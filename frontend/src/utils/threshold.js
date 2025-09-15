// frontend/src/utils/threshold.js
export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

/**
 * computeThreshold - compute threshold_on and threshold_off (percent 0-100)
 * @param {Object} opts
 *  telemetry: { soilPct, temperature, humidity, ldrPct }
 *  forecast: { daily: [{ rain }] }  // optional - shape like openweather daily
 *  cropProfile: { Kc, targetFraction, rootDepth_cm, fieldCapacityPct, wiltingPointPct, hysteresisPct }
 */
export function computeThreshold({ telemetry = {}, forecast = {}, cropProfile = {} }) {
  const fieldCapacityPct = cropProfile.fieldCapacityPct ?? 40;
  const wiltingPointPct = cropProfile.wiltingPointPct ?? 10;
  const rootDepth_cm = cropProfile.rootDepth_cm ?? 30;
  const Kc = cropProfile.Kc ?? 0.9;
  const targetFraction = cropProfile.targetFraction ?? 0.75;
  const hysteresisPct = cropProfile.hysteresisPct ?? 5;

  // Forecasted rain next 24h (mm)
  let rain24 = 0;
  try {
    if (forecast && forecast.daily && forecast.daily.length > 0) {
      rain24 = forecast.daily[0].rain || 0;
    }
  } catch (e) { rain24 = 0; }

  // Estimate ETo (simple proxy using avg temp)
  const tDay = telemetry.temperature ?? (forecast?.current?.temp ?? 25);
  const ETo = Math.max(0, 0.1 * (tDay - 10)); // mm/day
  const ETc = ETo * Kc;

  const rainEff = rain24 * 0.8;
  const water_deficit_mm = Math.max(0, ETc - rainEff); // mm

  // Convert mm to percent within root zone (10 mm ~ 1% default)
  const mmPerPct = Math.max(5, (rootDepth_cm * 10) / 10);
  const deltaPct = water_deficit_mm / mmPerPct;

  const baselinePct = fieldCapacityPct * targetFraction;
  const safetyMargin = 3;

  let threshold_on = Math.round(clamp(baselinePct + deltaPct, wiltingPointPct + safetyMargin, fieldCapacityPct - safetyMargin));
  let threshold_off = Math.round(clamp(threshold_on + hysteresisPct, threshold_on, 100));

  const details = {
    ETo, ETc, rain24, rainEff, deltaPct, baselinePct, fieldCapacityPct, wiltingPointPct, rootDepth_cm, Kc, hysteresisPct
  };

  return { threshold_on, threshold_off, details };
}
