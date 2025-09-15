// backend/src/services/telemetryService.js
const Telemetry = require('../models/Telemetry');

/**
 * Save telemetry safely (non-blocking).
 * Accepts an object with fields: deviceId, temperature, humidity, soilPct, ldrPct, relay1, relay2, ts (optional)
 */
async function saveTelemetry(payload = {}) {
  try {
    if (!payload || typeof payload !== 'object') return;

    // basic normalization
    const doc = {
      deviceId: payload.deviceId || payload.device || 'unknown',
      temperature: (typeof payload.temperature === 'number') ? payload.temperature : (payload.temp || null),
      humidity: (typeof payload.humidity === 'number') ? payload.humidity : (payload.hum || null),
      soilPct: (typeof payload.soilPct === 'number') ? payload.soilPct : (payload.soil || null),
      ldrPct: (typeof payload.ldrPct === 'number') ? payload.ldrPct : (payload.ldr || null),
      relay1: (typeof payload.relay1 === 'number') ? payload.relay1 : (payload.r1 || 0),
      relay2: (typeof payload.relay2 === 'number') ? payload.relay2 : (payload.r2 || 0),
      raw: payload,
      createdAt: payload.ts ? new Date(payload.ts) : new Date()
    };

    // quick validation: require deviceId
    if (!doc.deviceId) doc.deviceId = 'unknown';

    // Fire-and-forget save (don't block mqtt processing)
    Telemetry.create(doc).catch(err => {
      // Log but do not throw. Avoid crashing process for DB write errors.
      console.error('[telemetryService] save failed', err && err.message);
    });
  } catch (err) {
    console.error('[telemetryService] unexpected error', err && err.message);
  }
}

module.exports = { saveTelemetry };