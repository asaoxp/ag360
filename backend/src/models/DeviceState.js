// backend/src/models/DeviceState.js
const mongoose = require('mongoose');

const DeviceStateSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  relayState: { type: Boolean, default: false }, // true => ON
  lastActionTs: { type: Date, default: null },
  lastOnTs: { type: Date, default: null },
  lastTelemetry: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('DeviceState', DeviceStateSchema);
