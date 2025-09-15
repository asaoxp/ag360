// backend/src/routes/irrigation.js
const express = require('express');
const router = express.Router();
const { computeThreshold } = require('../services/thresholdService');
const { fetchForecast } = require('../utils/weather');
const Telemetry = require('../models/Telemetry'); // if you have a telemetry model; else skip

// GET /api/irrigation/threshold?deviceId=&lat=&lon=&crop=
router.get('/threshold', async (req, res) => {
  try {
    const deviceId = req.query.deviceId;
    const crop = (req.query.crop || 'tomato').toLowerCase();
    const lat = req.query.lat;
    const lon = req.query.lon;

    // latest telemetry lookup (if you store telemetry in DB); otherwise client can pass telemetry in body
    let latestTelemetry = {};
    if (deviceId && Telemetry) {
      try {
        latestTelemetry = await Telemetry.findOne({ deviceId }).sort({ createdAt: -1 }).lean().exec();
      } catch (e) { latestTelemetry = {}; }
    }

    const forecast = (lat && lon) ? await fetchForecast(lat, lon) : null;

    const cropProfile = { name: crop }; // computeThreshold will fetch more if available in DB
    const result = await computeThreshold({ telemetry: latestTelemetry || {}, forecast, cropProfile });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to compute threshold' });
  }
});

module.exports = router;
