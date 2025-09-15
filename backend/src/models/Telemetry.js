// backend/src/models/Telemetry.js
const mongoose = require('mongoose');

const TelemetrySchema = new mongoose.Schema({
  deviceId: { type: String, required: true, index: true },
  temperature: { type: Number, default: null },
  humidity: { type: Number, default: null },
  soilPct: { type: Number, default: null },
  ldrPct: { type: Number, default: null },
  relay1: { type: Number, default: 0 },
  relay2: { type: Number, default: 0 },
  // original raw payload (optional)
  raw: { type: mongoose.Schema.Types.Mixed, default: null },
  // createdAt will be used for TTL (expiry)
  createdAt: { type: Date, default: Date.now, index: true }
});

// TTL index: remove documents after ~30 days (30*24*60*60 seconds)
// You can change '30d' to '7d' or seconds like 2592000 for 30 days.
TelemetrySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Telemetry', TelemetrySchema);
