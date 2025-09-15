// frontend/src/components/ManualMode.js
// Clean, compact Manual UI for two zones (A, B).
// Props:
//  - zones: [{id, name, crop, manualOn}]
//  - zoneStatus: { A: {...}, B: {...} } (optional, shows live soil% and relay state)
//  - publishRelay(zoneId, action)
//  - toggleManual or manualOverrideToggle to lock/unlock auto for a zone

import React from 'react';
import PropTypes from 'prop-types';

function SmallStat({ label, value }) {
  return (
    <div className="text-sm text-gray-600">
      <div className="text-xs">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function ZoneCard({ zone, status = {}, onPublish, onToggle }) {
  const soil = status.currentSoil == null ? '—' : `${status.currentSoil}%`;
  const relay = status.relayState === true ? 'ON' : status.relayState === false ? 'OFF' : '—';
  const lastAction = status.lastActionTs ? new Date(status.lastActionTs).toLocaleString() : '—';
  const locked = !!zone.manualOn;

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold">{zone.name} <span className="text-sm text-gray-500">({zone.id})</span></h3>
        <div className="text-sm text-gray-600">Crop: <span className="font-medium">{zone.crop || 'unknown'}</span></div>
        <div className="mt-2 flex gap-4">
          <SmallStat label="Soil" value={soil} />
          <SmallStat label="Relay" value={relay} />
          <SmallStat label="Last Action" value={lastAction} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onPublish(zone.id, 'ON')}
          className="px-3 py-1 rounded border bg-green-50 text-green-700"
        >
          ON
        </button>
        <button
          onClick={() => onPublish(zone.id, 'OFF')}
          className="px-3 py-1 rounded border bg-red-50 text-red-700"
        >
          OFF
        </button>

        <button
          onClick={() => onToggle(zone.id)}
          className={`px-3 py-1 rounded border ${locked ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          {locked ? 'Unlock Manual' : 'Lock Manual'}
        </button>
      </div>
    </div>
  );
}

export default function ManualMode({ zones = [], zoneStatus = {}, publishRelay, toggleManual, manualOverrideToggle }) {
  const onToggle = manualOverrideToggle || toggleManual || (() => console.warn('toggle function not provided'));
  const onPublish = (zoneId, action) => {
    if (typeof publishRelay === 'function') publishRelay(zoneId, action);
    else console.warn('publishRelay not provided', zoneId, action);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Manual Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map(z => (
          <ZoneCard
            key={z.id}
            zone={z}
            status={zoneStatus?.[z.id] || {}}
            onPublish={onPublish}
            onToggle={onToggle}
          />
        ))}
      </div>
      <div className="text-sm text-gray-500 mt-2">Tip: Use Lock Manual to prevent Auto mode from changing this zone.</div>
    </div>
  );
}

ManualMode.propTypes = {
  zones: PropTypes.array,
  zoneStatus: PropTypes.object,
  publishRelay: PropTypes.func,
  toggleManual: PropTypes.func,
  manualOverrideToggle: PropTypes.func,
};
