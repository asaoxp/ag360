// backend/src/routes/irrigationDebug.js
const express = require('express');
const router = express.Router();
const IrrigationEvent = require('../models/IrrigationEvent');
const DeviceState = require('../models/DeviceState');

/**
 * POST /api/irrigation/debug/state
 * body: { deviceId: "A" }
 * returns: { deviceState, recentEvents }
 */
router.post('/state', async (req, res) => {
  const deviceId = (req.body && req.body.deviceId) || req.query.deviceId;
  if (!deviceId) return res.status(400).json({ error: 'deviceId required' });
  try {
    const deviceState = await DeviceState.findOne({ deviceId }).lean().exec();
    const recentEvents = await IrrigationEvent.find({ deviceId }).sort({ timestamp: -1 }).limit(50).lean().exec();
    return res.json({ ok: true, deviceState, recentEvents });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/irrigation/debug/force-state
 * body: { deviceId: "A", relayState: true|false, lastOnTs: 0|timestamp, lastOffTs: 0|timestamp }
 * Use to simulate timestamps for testing.
 */
router.post('/force-state', async (req, res) => {
  const { deviceId, relayState, lastOnTs, lastOffTs } = req.body || {};
  if (!deviceId) return res.status(400).json({ error: 'deviceId required' });
  try {
    const update = {};
    if (typeof relayState === 'boolean') update.relayState = relayState;
    if (lastOnTs) update.lastOnTs = new Date(lastOnTs);
    if (lastOffTs) update.lastOffTs = new Date(lastOffTs);
    const doc = await DeviceState.findOneAndUpdate({ deviceId }, { $set: update }, { upsert: true, new: true }).lean().exec();
    return res.json({ ok: true, deviceState: doc });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
