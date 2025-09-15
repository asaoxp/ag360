// backend/src/services/controllerService.js
'use strict';

/**
 * Controller service (debuggable)
 * - Verbose logs for ON gating
 * - Honor DEBUG_ALLOW_REON env var to bypass ON gating (temporary debugging only)
 * - Multi-format publish retained
 *
 * Usage:
 *  - For normal operation: DEBUG_ALLOW_REON not set or false
 *  - For debug tests: set DEBUG_ALLOW_REON=true in .env then restart backend
 */

const mqttClient = require('../lib/mqttClient');
const { computeThreshold } = require('./thresholdService');
const { fetchForecast } = require('../utils/weather');
const IrrigationEvent = require('../models/IrrigationEvent');
const DeviceState = require('../models/DeviceState');
const Crop = require('../models/CropProfile');

const MIN_ON_MS = Number(process.env.MIN_ON_MS || 60 * 1000);
const MIN_INTERVAL_BETWEEN_ON_MS = Number(process.env.MIN_INTERVAL_BETWEEN_ON_MS || 30 * 1000);
const MIN_INTERVAL_AFTER_OFF_MS = Number(process.env.MIN_INTERVAL_AFTER_OFF_MS || 5 * 1000);
const MIN_INTERVAL_BETWEEN_OFF_MS = Number(process.env.MIN_INTERVAL_BETWEEN_OFF_MS || 5 * 1000);
const TELEMETRY_TOPIC = process.env.TELEMETRY_TOPIC || 'esp32/telemetry';
const MQTT_RETRY_COUNT = Number(process.env.MQTT_RETRY_COUNT || 1);
const MQTT_RETRY_DELAY_MS = Number(process.env.MQTT_RETRY_DELAY_MS || 800);
const DEBUG_ALLOW_REON = (process.env.DEBUG_ALLOW_REON || 'false').toLowerCase() === 'true';
const MAX_ON_MS = Number(process.env.MAX_ON_MS || 4 * 60 * 60 * 1000);

function zoneToRelayTopic(zoneId) {
  const map = { A: 'esp32/relay1', B: 'esp32/relay2' };
  return map[zoneId] || `esp32/relay/${zoneId}`;
}

async function logIrrigationEvent(payload) {
  try { await IrrigationEvent.create(payload); } catch (e) { console.warn('[controllerService] IrrigationEvent save failed', e && e.message); }
}

function safeParseJSON(v) {
  try {
    if (typeof v === 'string') return JSON.parse(v);
    if (Buffer.isBuffer(v)) return JSON.parse(v.toString());
    if (typeof v === 'object') return v;
  } catch (e) {}
  return null;
}

function normalizeSoil(raw) {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    raw = raw.trim();
    if (raw.endsWith('%')) raw = raw.slice(0, -1);
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

async function tryPublish(topic, message) {
  try {
    const res = await mqttClient.publish(topic, String(message));
    return { ok: true, detail: res ?? null };
  } catch (err) {
    return { ok: false, error: err };
  }
}

async function publishManyFormats(topic, action) {
  const formats = [
    { name: 'plain', payload: action },
    { name: 'numeric', payload: action === 'ON' ? '1' : '0' },
    { name: 'json', payload: JSON.stringify({ cmd: action }) }
  ];
  const results = { successes: [], failures: {} };
  for (const fmt of formats) {
    let lastErr = null;
    for (let attempt = 0; attempt <= MQTT_RETRY_COUNT; attempt++) {
      try {
        const r = await tryPublish(topic, fmt.payload);
        if (r.ok) { results.successes.push(fmt.name); console.info(`[controllerService] publish success topic=${topic} fmt=${fmt.name} payload=${fmt.payload}`); lastErr = null; break; }
        else { lastErr = r.error; console.warn(`[controllerService] publish failed topic=${topic} fmt=${fmt.name} attempt=${attempt+1}`, r.error && r.error.message); }
      } catch (e) { lastErr = e; console.warn(`[controllerService] publish threw topic=${topic} fmt=${fmt.name} attempt=${attempt+1}`, e && e.message); }
      if (attempt < MQTT_RETRY_COUNT) await new Promise(r => setTimeout(r, MQTT_RETRY_DELAY_MS));
    }
    if (lastErr) results.failures[fmt.name] = (lastErr && lastErr.message) || String(lastErr);
  }
  return results;
}

async function handleTelemetryMessage(topic, message) {
  const payload = safeParseJSON(message);
  if (!payload) { console.warn('[controllerService] invalid telemetry'); return; }

  const deviceId = payload.deviceId || payload.zoneId || payload.id || 'unknown';
  const soilPct = normalizeSoil(payload.soilPct ?? payload.soil ?? null);
  const temperature = payload.temperature ?? payload.temp ?? null;
  const humidity = payload.humidity ?? null;
  const cropName = (payload.crop || payload.cropName || 'tomato').toString().toLowerCase();
  const lat = payload.lat || payload.latitude || null;
  const lon = payload.lon || payload.longitude || null;

  console.info(`[controllerService] telemetry device=${deviceId} soil=${soilPct} temp=${temperature} hum=${humidity} crop=${cropName}`);

  let state;
  try {
    state = await DeviceState.findOne({ deviceId }).exec();
    if (!state) {
      state = await DeviceState.create({ deviceId, relayState: false, lastActionTs: null, lastOnTs: null, lastOffTs: null, lastTelemetry: payload });
      console.info(`[controllerService] created DeviceState for ${deviceId}`);
    } else {
      state.lastTelemetry = payload;
      await state.save().catch(()=>null);
    }
  } catch (e) { console.warn('[controllerService] DeviceState error', e && e.message); }

  let cropProfile = null;
  try { cropProfile = await Crop.findOne({ name: cropName }).lean().exec().catch(()=>null); } catch (e) { cropProfile = null; }
  const profileForCompute = cropProfile ? { ...cropProfile } : { name: cropName, Kc: 0.9, targetFraction: 0.75, rootDepth_cm: 30, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 5 };

  let forecast = null;
  if (lat && lon) {
    try { forecast = await fetchForecast(lat, lon); } catch (e) { forecast = null; }
  }

  const { threshold_on, threshold_off, details } = await computeThreshold({ telemetry: { soilPct, temperature, humidity }, forecast, cropProfile: profileForCompute });

  const now = Date.now();
  const lastOnTs = state && state.lastOnTs ? new Date(state.lastOnTs).getTime() : 0;
  const lastOffTs = state && state.lastOffTs ? new Date(state.lastOffTs).getTime() : 0;
  const relayIsOn = !!(state && state.relayState);

  async function persistEvent(action, reason, extra = {}) {
    try {
      if (action === 'ON') { state.relayState = true; state.lastOnTs = new Date(now); state.lastActionTs = new Date(now); }
      else if (action === 'OFF') { state.relayState = false; state.lastOffTs = new Date(now); state.lastActionTs = new Date(now); }
      else { state.lastActionTs = new Date(now); }
      await state.save().catch(()=>console.warn('[controllerService] state.save failed'));
    } catch (e) { console.warn('[controllerService] persistEvent error', e && e.message); }
    const ev = { deviceId, zoneId: deviceId, action, reason, threshold_on, threshold_off, soilPct, telemetry: payload, forecast, details, timestamp: new Date(now), extra };
    await logIrrigationEvent(ev);
  }

  // Watchdog
  if (relayIsOn) {
    const timeOn = now - lastOnTs;
    if (timeOn > MAX_ON_MS) {
      const topic = zoneToRelayTopic(deviceId);
      console.warn(`[controllerService] Watchdog forcing OFF for ${deviceId} (on ${timeOn}ms)`);
      const pubRes = await publishManyFormats(topic, 'OFF');
      await persistEvent('OFF', 'watchdog_forced_off', { publishResults: pubRes });
      return;
    }
  }

  if (soilPct == null) { await persistEvent('RECOMMEND', 'no_numeric_soil'); console.info(`[controllerService] device=${deviceId} missing numeric soil.`); return; }

  // Ultra-verbose ON decision block
  if (soilPct <= threshold_on && !relayIsOn) {
    // If debug flag set, allow immediate re-ON to test device reaction
    if (DEBUG_ALLOW_REON) {
      console.warn('[controllerService] DEBUG_ALLOW_REON enabled — bypassing gating and forcing ON for test');
      const topic = zoneToRelayTopic(deviceId);
      const pubRes = await publishManyFormats(topic, 'ON');
      if (pubRes.successes.length > 0) { await persistEvent('ON', 'debug_force_on', { publishResults: pubRes }); console.info('[controllerService] DEBUG ON published'); }
      else { await persistEvent('RECOMMEND', 'debug_publish_failed_on', { publishResults: pubRes }); console.error('[controllerService] DEBUG publish failed'); }
      return;
    }

    const sinceLastOn = now - lastOnTs;
    const sinceLastOff = now - lastOffTs;
    const lastOnIso = lastOnTs ? new Date(lastOnTs).toISOString() : null;
    const lastOffIso = lastOffTs ? new Date(lastOffTs).toISOString() : null;

    // compute gating
    let allowOn = false;
    let blockReason = '';

    if (lastOffTs > lastOnTs) {
      // recent OFF after last ON -> use MIN_INTERVAL_AFTER_OFF_MS
      if (sinceLastOff >= MIN_INTERVAL_AFTER_OFF_MS) { allowOn = true; blockReason = `allow_after_off`; }
      else { allowOn = false; blockReason = `blocked_after_off_wait ${sinceLastOff}ms<${MIN_INTERVAL_AFTER_OFF_MS}`; }
    } else {
      // no OFF after last ON -> use MIN_INTERVAL_BETWEEN_ON_MS
      if (sinceLastOn >= MIN_INTERVAL_BETWEEN_ON_MS) { allowOn = true; blockReason = `allow_by_min_between_on`; }
      else { allowOn = false; blockReason = `blocked_by_min_between_on ${sinceLastOn}ms<${MIN_INTERVAL_BETWEEN_ON_MS}`; }
    }

    // verbose log
    console.info(`[controllerService][ON-GATE] device=${deviceId} soil=${soilPct} threshold_on=${threshold_on} relayIsOn=${relayIsOn}`);
    console.info(`[controllerService][ON-GATE] lastOn=${lastOnIso} (${sinceLastOn}ms ago) lastOff=${lastOffIso} (${sinceLastOff}ms ago) allowOn=${allowOn} reason=${blockReason}`);

    if (allowOn) {
      const topic = zoneToRelayTopic(deviceId);
      const pubRes = await publishManyFormats(topic, 'ON');
      if (pubRes.successes.length > 0) { await persistEvent('ON', 'soil_below_threshold_on', { publishResults: pubRes }); console.info(`[controllerService] ON published for ${deviceId} formats=${pubRes.successes.join(',')}`); }
      else { await persistEvent('RECOMMEND', 'publish_failed_on', { publishResults: pubRes }); console.error('[controllerService] ON publish failed for all formats'); }
    } else {
      await persistEvent('RECOMMEND', blockReason);
    }
    return;
  }

  // OFF logic (unchanged)
  if (soilPct >= threshold_off && relayIsOn) {
    const sinceOn = now - lastOnTs;
    const minOnLeft = Math.max(0, MIN_ON_MS - sinceOn);
    if (minOnLeft > 0) {
      await persistEvent('RECOMMEND', 'min_on_not_elapsed', { minOnLeft }); console.info(`[controllerService] Skipping OFF - min on left=${minOnLeft}ms`); return;
    }
    const sinceLastOff = now - lastOffTs;
    if (sinceLastOff < MIN_INTERVAL_BETWEEN_OFF_MS) {
      await persistEvent('RECOMMEND', 'min_interval_between_off_not_elapsed', { sinceLastOff }); console.info('[controllerService] Skipping OFF - min interval between off not elapsed'); return;
    }
    const topic = zoneToRelayTopic(deviceId);
    const pubRes = await publishManyFormats(topic, 'OFF');
    if (pubRes.successes.length > 0) { await persistEvent('OFF', 'soil_above_threshold_off', { publishResults: pubRes }); console.info(`[controllerService] OFF published for ${deviceId}`); }
    else { await persistEvent('RECOMMEND', 'publish_failed_off', { publishResults: pubRes }); console.error('[controllerService] OFF publish failed for all formats'); }
    return;
  }

  await persistEvent('RECOMMEND', 'no_action');
  console.debug(`[controllerService] no_action device=${deviceId} soil=${soilPct} thresholds on=${threshold_on} off=${threshold_off}`);
}

// start/stop unchanged
let subscribed = false;
let internalHandler = null;

async function startController() {
  if (subscribed) { console.info('[controllerService] already started'); return; }
  try { await mqttClient.connect(); } catch(e) { console.warn('[controllerService] mqtt connect failed', e && e.message); }
  try {
    internalHandler = async (topic, message) => { try { await handleTelemetryMessage(topic, message); } catch (err) { console.error('[controllerService] handler error', err && err.message); } };
    await mqttClient.subscribe(TELEMETRY_TOPIC, {}, internalHandler);
    subscribed = true;
    console.info(`[controllerService] Subscribed to ${TELEMETRY_TOPIC}`);
  } catch (err) { console.error('[controllerService] subscribe failed', err && err.message); throw err; }
}

async function stopController() {
  try { await mqttClient.end(); subscribed = false; internalHandler = null; console.info('[controllerService] stopped'); } catch (e) { console.warn('[controllerService] stop error', e && e.message); }
}

module.exports = { startController, stopController, handleTelemetryMessage, publishManyFormats };
