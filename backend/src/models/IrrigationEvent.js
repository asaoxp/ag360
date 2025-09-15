// backend/src/models/IrrigationEvent.js
const mongoose = require('mongoose');

const IrrigationEventSchema = new mongoose.Schema({
  deviceId: { type: String },          // e.g., zone id or esp32 id
  zoneId: { type: String },            // optional, same as deviceId often
  action: { type: String, enum: ['ON', 'OFF', 'RECOMMEND_ON', 'RECOMMEND_OFF', 'FORCE_ON', 'FORCE_OFF'] },
  reason: String,
  threshold_on: Number,
  threshold_off: Number,
  soilPct: Number,
  telemetry: Object,
  forecast: Object,
  details: Object,  // any computed details (ETo, ETc etc)
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IrrigationEvent', IrrigationEventSchema);
