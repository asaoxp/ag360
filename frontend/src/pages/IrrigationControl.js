// frontend/src/pages/IrrigationControl.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import AutoMode from '../components/AutoMode';
import ManualMode from '../components/ManualMode';
import AIMode from '../components/AIMode';
import { computeThreshold } from '../utils/threshold';
import useMqttPublish from '../hooks/useMqttPublish';
import useWebsocketTelemetry from '../hooks/useWebsocketTelemetry';

const POLL_INTERVAL_MS = 15 * 1000;
const MIN_ON_MS = 60 * 1000;
const MIN_INTERVAL_MS = 5 * 60 * 1000;

// Only zones A and B
const defaultZones = [
  { id: 'A', name: 'Zone A', manualOn: false, crop: 'tomato', lat: null, lon: null },
  { id: 'B', name: 'Zone B', manualOn: false, crop: 'maize', lat: null, lon: null },
];

const cropOptions = ['tomato','maize','wheat','potato','cotton','sugarcane','banana','soybean'];

const cropDefaults = {
  tomato:    { Kc: 0.9,  targetFraction: 0.75, rootDepth_cm: 30, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 5 },
  maize:     { Kc: 1.15, targetFraction: 0.7,  rootDepth_cm: 50, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 5 },
  wheat:     { Kc: 0.8,  targetFraction: 0.65, rootDepth_cm: 40, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 5 },
  potato:    { Kc: 1.0,  targetFraction: 0.75, rootDepth_cm: 30, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 4 },
  cotton:    { Kc: 0.95, targetFraction: 0.7,  rootDepth_cm: 50, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 5 },
  sugarcane: { Kc: 1.2,  targetFraction: 0.8,  rootDepth_cm: 60, fieldCapacityPct: 45, wiltingPointPct: 12, hysteresisPct: 6 },
  banana:    { Kc: 1.1,  targetFraction: 0.8,  rootDepth_cm: 60, fieldCapacityPct: 45, wiltingPointPct: 12, hysteresisPct: 6 },
  soybean:   { Kc: 0.9,  targetFraction: 0.7,  rootDepth_cm: 40, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 5 },
};

export default function IrrigationControl() {
  const [activeTab, setActiveTab] = useState('manual');
  const [zones, setZones] = useState(defaultZones);
  const [timing, setTiming] = useState({ start: '06:00', end: '07:00' });
  const [zoneStatus, setZoneStatus] = useState({}); // { A: {...}, B: {...} }

  // runtime state (not causing renders)
  const stateRef = useRef({});
  // stable ref to latest runAutoCheck function
  const runAutoCheckRef = useRef(() => Promise.resolve());

  const publish = useMqttPublish ? useMqttPublish() : (t,m) => console.warn('publish missing', t, m);
  const ws = useWebsocketTelemetry ? useWebsocketTelemetry() : { telemetry: null, wsConnected: false };
  const telemetry = ws.telemetry ?? null;

  const zoneToTopic = { A: 'esp32/relay1', B: 'esp32/relay2' };

  const publishRelay = useCallback((zoneId, action) => {
    const topic = zoneToTopic[zoneId] || `esp32/relay/${zoneId}`;
    try {
      // Small UI log for visibility
      console.debug(`[IrrigationControl] publish -> topic=${topic} action=${action}`);
      publish(topic, String(action));
    } catch (e) {
      console.error('[IrrigationControl] publishRelay error', e);
    }
  }, [publish]);

  const manualOverrideToggle = (zoneId) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, manualOn: !z.manualOn } : z));
  };

  // CORE: runAutoCheck (stable identity via useCallback without zoneStatus dep)
  const runAutoCheck = useCallback(async () => {
    if (!zones || zones.length === 0) return;
    const now = Date.now();

    // We'll build the nextStatus and apply it once at the end with functional update to avoid dependency loops.
    const nextStatus = {};

    for (const zone of zones) {
      const zoneId = zone.id;

      if (zone.manualOn) {
        nextStatus[zoneId] = { ...(zoneStatus[zoneId] || {}), manualLocked: true, lastChecked: now };
        // keep existing relayState if present
        continue;
      }

      // Get latest telemetry for this zone (support either keyed or single-object telemetry)
      let latest = {};
      if (!telemetry) latest = {};
      else if (telemetry[zoneId]) latest = telemetry[zoneId];
      else latest = telemetry;

      // Coerce soil value to Number safely
      let soilRaw = latest.soilPct ?? latest.soil ?? null;
      if (typeof soilRaw === 'string' && soilRaw.endsWith('%')) soilRaw = soilRaw.slice(0, -1);
      const currentSoil = soilRaw == null ? null : Number(soilRaw);
      const cropKey = (zone.crop || '').toLowerCase();
      const cropProfile = cropDefaults[cropKey] || { Kc: 0.9, targetFraction: 0.7, rootDepth_cm: 30, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 5 };
      const forecast = {}; // optional

      const { threshold_on, threshold_off, details } = computeThreshold({ telemetry: latest, forecast, cropProfile });

      // initialize runtime state for this zone if missing
      stateRef.current[zoneId] = stateRef.current[zoneId] || { relayState: false, lastActionTs: 0, lastOnTs: 0 };
      const st = stateRef.current[zoneId];

      // Build status record
      nextStatus[zoneId] = { ...(zoneStatus[zoneId] || {}), currentSoil, threshold_on, threshold_off, details, lastChecked: now };

      // Decisions and side-effects: use the runtime stateRef to decide without causing rerenders mid-loop
      if (currentSoil == null) {
        nextStatus[zoneId].info = 'No numeric soil telemetry';
        // No action
      } else {
        // ON logic
        if (currentSoil <= threshold_on && !st.relayState) {
          if (now - st.lastActionTs > MIN_INTERVAL_MS) {
            publishRelay(zoneId, 'ON');
            st.relayState = true;
            st.lastActionTs = now;
            st.lastOnTs = now;
            nextStatus[zoneId].relayState = true;
            nextStatus[zoneId].lastActionTs = now;
            console.info(`[AutoCheck] ON -> zone=${zoneId} soil=${currentSoil} <= ${threshold_on}`);
            // log here if you want to POST to backend for auditing
          } else {
            nextStatus[zoneId].info = 'Cooldown active';
            console.info(`[AutoCheck] Recommend ON but cooldown active zone=${zoneId}`);
          }
        }

        // OFF logic
        if (currentSoil >= threshold_off && st.relayState) {
          const timeSinceOn = now - st.lastOnTs;
          const timeLeftMs = Math.max(0, MIN_ON_MS - timeSinceOn);
          if (timeLeftMs <= 0) {
            publishRelay(zoneId, 'OFF');
            st.relayState = false;
            st.lastActionTs = now;
            nextStatus[zoneId].relayState = false;
            nextStatus[zoneId].lastActionTs = now;
            console.info(`[AutoCheck] OFF -> zone=${zoneId} soil=${currentSoil} >= ${threshold_off}`);
          } else {
            nextStatus[zoneId].info = `Min-on not elapsed (${Math.ceil(timeLeftMs/1000)}s left)`;
            console.info(`[AutoCheck] Skip OFF zone=${zoneId} minOnLeft=${timeLeftMs}ms`);
          }
        }
      }
    }

    // apply status update once
    setZoneStatus(prev => ({ ...(prev || {}), ...nextStatus }));
  // Intentionally do NOT include zoneStatus in deps, to avoid effect loops.
  }, [zones, telemetry, publishRelay]);

  // put the latest runAutoCheck into a ref so external callers (like setZoneCrop) can call it safely
  useEffect(() => { runAutoCheckRef.current = runAutoCheck; }, [runAutoCheck]);

  // Polling when auto active — effect depends only on activeTab and runAutoCheck identity
  useEffect(() => {
    if (activeTab !== 'auto') return;
    // call immediately
    runAutoCheckRef.current().catch(e => console.error('runAutoCheck immediate error', e));
    const id = setInterval(() => {
      runAutoCheckRef.current().catch(e => console.error('runAutoCheck interval error', e));
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [activeTab]); // do NOT include runAutoCheck here to prevent re-starting interval on every call

  // telemetry-driven trigger — run only when telemetry object pointer changes (not when zoneStatus changes)
  useEffect(() => {
    if (activeTab !== 'auto') return;
    if (!telemetry) return;
    runAutoCheckRef.current().catch(e => console.error('runAutoCheck telemetry-trigger error', e));
  }, [telemetry, activeTab]);

  // force ON/OFF from UI
  const forceAction = useCallback((zoneId, action) => {
    const now = Date.now();
    stateRef.current[zoneId] = stateRef.current[zoneId] || { relayState: false, lastActionTs: 0, lastOnTs: 0 };
    const st = stateRef.current[zoneId];
    if (action === 'ON') {
      publishRelay(zoneId, 'ON');
      st.relayState = true;
      st.lastActionTs = now;
      st.lastOnTs = now;
    } else {
      publishRelay(zoneId, 'OFF');
      st.relayState = false;
      st.lastActionTs = now;
    }
    // update visible status immediately
    setZoneStatus(prev => ({ ...(prev || {}), [zoneId]: { ...((prev||{})[zoneId]||{}), relayState: st.relayState, lastActionTs: now } }));
  }, [publishRelay]);

  // set zone's crop and immediately recompute without causing loops
  const setZoneCrop = (zoneId, cropName) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, crop: cropName } : z));
    // call ref'd check once (no setTimeout)
    setTimeout(() => {
      // schedule next tick so zones state has applied
      if (typeof runAutoCheckRef.current === 'function') runAutoCheckRef.current().catch(e => console.error('runAutoCheck after setZoneCrop error', e));
    }, 0);
  };

  // initialize stateRef entries for zones (once)
  useEffect(() => {
    const s = {};
    defaultZones.forEach(z => { s[z.id] = stateRef.current[z.id] || { relayState: false, lastActionTs: 0, lastOnTs: 0 }; });
    stateRef.current = { ...stateRef.current, ...s };
  }, []); // run once on mount

  return (
    <div className="p-6">
      <div className="flex gap-3 mb-6">
        <button onClick={() => setActiveTab('manual')} className={`px-4 py-2 rounded ${activeTab==='manual' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>Manual</button>
        <button onClick={() => setActiveTab('auto')} className={`px-4 py-2 rounded ${activeTab==='auto' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>Auto</button>
        <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 rounded ${activeTab==='ai' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>AI</button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h1 className="text-xl font-semibold">Irrigation Control</h1>
        <p className="text-sm text-gray-600">Auto computes thresholds using crop defaults + telemetry and publishes ON/OFF to relays.</p>
      </div>

      <div>
        {activeTab === 'manual' && (
          <ManualMode
            zones={zones}
            zoneStatus={zoneStatus}
            publishRelay={publishRelay}
            toggleManual={manualOverrideToggle}
            manualOverrideToggle={manualOverrideToggle}
          />
        )}

        {activeTab === 'auto' && (
          <AutoMode
            zones={zones}
            zoneStatus={zoneStatus}
            publishRelay={publishRelay}
            manualOverrideToggle={manualOverrideToggle}
            toggleManual={manualOverrideToggle}
            timing={timing}
            setTiming={setTiming}
            onForceAction={forceAction}
            cropOptions={cropOptions}
            onChangeCrop={setZoneCrop}
          />
        )}

        {activeTab === 'ai' && <AIMode />}
      </div>
    </div>
  );
}
