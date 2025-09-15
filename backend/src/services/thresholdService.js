// backend/src/services/thresholdService.js
const Crop = require('../models/CropProfile');

/**
 * computeThreshold - compute threshold_on and threshold_off (percent 0-100)
 * @param {Object} opts
 *  telemetry: { soilPct, temperature, humidity }
 *  forecast: openweather-like daily[] (optional)
 *  cropProfile: { name, Kc, targetFraction, rootDepth_cm, fieldCapacityPct, wiltingPointPct, hysteresisPct }
 */
async function computeThreshold({ telemetry = {}, forecast = {}, cropProfile = {} } = {}) {
  // Merge DB profile when name provided
  let profile = { ...(cropProfile || {}) };

  if (profile.name && !profile.Kc) {
    try {
      const fromDb = await Crop.findOne({ name: profile.name.toLowerCase() }).lean().exec();
      if (fromDb) profile = { ...fromDb, ...profile };
    } catch (err) {
      // ignore DB lookup errors; fall back to provided/defaults
      console.warn('[thresholdService] crop lookup failed', err && err.message);
    }
  }

  const fieldCapacityPct = profile.fieldCapacityPct ?? 40;
  const wiltingPointPct = profile.wiltingPointPct ?? 10;
  const rootDepth_cm = profile.rootDepth_cm ?? 30;
  const Kc = profile.Kc ?? 0.9;
  const targetFraction = profile.targetFraction ?? 0.75;
  const hysteresisPct = profile.hysteresisPct ?? 5; // NEW: per-crop hysteresis

  // Forecasted rain next 24h (mm)
  let rain24 = 0;
  if (forecast && forecast.daily && forecast.daily.length > 0) {
    rain24 = forecast.daily[0].rain || 0;
  }

  // Estimate ETo (simple proxy)
  const tDay = telemetry?.temperature ?? (forecast?.current?.temp ?? 25);
  const ETo = Math.max(0, 0.1 * (tDay - 10)); // mm/day (very rough proxy)
  const ETc = ETo * Kc;

  // Effective rain assumed infiltration factor
  const rainEff = rain24 * 0.8;

  const water_deficit_mm = Math.max(0, ETc - rainEff); // mm

  // Convert mm to percent within root zone:
  // using approximate conversion: 10 mm water ≈ 1% soil moisture (tune per soil)
  const mmPerPct = Math.max(5, (rootDepth_cm * 10) / 10); // default 10mm per 1%
  const deltaPct = water_deficit_mm / mmPerPct;

  const baselinePct = fieldCapacityPct * targetFraction;
  const safetyMargin = 3; // percent

  const raw_threshold_on = baselinePct + deltaPct;
  const threshold_on = Math.round(Math.max(wiltingPointPct + safetyMargin, Math.min(fieldCapacityPct - safetyMargin, raw_threshold_on)));
  const threshold_off = Math.round(Math.min(100, threshold_on + hysteresisPct));

  const details = {
    ETo, ETc, rain24, rainEff, deltaPct, baselinePct,
    fieldCapacityPct, wiltingPointPct, rootDepth_cm, Kc, hysteresisPct
  };

  return { threshold_on, threshold_off, details };
}

module.exports = { computeThreshold };
