// backend/scripts/seedCrops.js
'use strict';

/**
 * Seed crop profiles into MongoDB.
 * Behavior:
 *  - Loads .env if present
 *  - Uses process.env.MONGO_URL or falls back to local mongodb://127.0.0.1:27017/agriverse360
 *  - Sets mongoose strictQuery to avoid deprecation warning
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const CropProfile = require('../src/models/CropProfile');

const DEFAULT_MONGO = 'mongodb://127.0.0.1:27017/agriverse360';
const MONGO_URL = process.env.MONGO_URL || DEFAULT_MONGO;

const crops = [
  { name: 'tomato', Kc: 0.9, targetFraction: 0.75, rootDepth_cm: 30, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 5 },
  { name: 'maize', Kc: 1.15, targetFraction: 0.7, rootDepth_cm: 50, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 5 },
  { name: 'wheat', Kc: 0.8, targetFraction: 0.65, rootDepth_cm: 40, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 5 },
  { name: 'potato', Kc: 1.0, targetFraction: 0.75, rootDepth_cm: 30, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 4 },
  { name: 'cotton', Kc: 0.95, targetFraction: 0.7, rootDepth_cm: 50, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 5 },
  { name: 'sugarcane', Kc: 1.2, targetFraction: 0.8, rootDepth_cm: 60, fieldCapacityPct: 45, wiltingPointPct: 12, hysteresisPct: 6 },
  { name: 'banana', Kc: 1.1, targetFraction: 0.8, rootDepth_cm: 60, fieldCapacityPct: 45, wiltingPointPct: 12, hysteresisPct: 6 },
  { name: 'soybean', Kc: 0.9, targetFraction: 0.7, rootDepth_cm: 40, fieldCapacityPct: 40, wiltingPointPct: 10, hysteresisPct: 5 }
];

async function seed() {
  try {
    // silence deprecation warning by setting strictQuery explicitly
    mongoose.set('strictQuery', false);

    console.log('[seedCrops] connecting to MongoDB at', MONGO_URL);
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

    console.log('[seedCrops] connected. Upserting crop profiles...');

    for (const c of crops) {
      const filter = { name: c.name };
      const update = { $set: c };
      const opts = { upsert: true };
      await CropProfile.updateOne(filter, update, opts);
      console.log(`[seedCrops] upserted ${c.name}`);
    }

    console.log('[seedCrops] seed complete.');
  } catch (err) {
    console.error('[seedCrops] failed:', err && (err.message || err));
  } finally {
    try {
      await mongoose.disconnect();
      console.log('[seedCrops] disconnected.');
    } catch (e) { /* ignore */ }
    process.exit(0);
  }
}

seed();
