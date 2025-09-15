// backend/src/models/CropProfile.js
const mongoose = require('mongoose');

const CropProfileSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  Kc: { type: Number, required: true },                // crop coefficient
  targetFraction: { type: Number, default: 0.75 },     // fraction of field capacity to aim
  rootDepth_cm: { type: Number, default: 30 },         // root zone depth cm
  fieldCapacityPct: { type: Number, default: 40 },
  wiltingPointPct: { type: Number, default: 10 },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('CropProfile', CropProfileSchema);
