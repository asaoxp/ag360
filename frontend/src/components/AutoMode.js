// frontend/src/components/AutoMode.js
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const Badge = ({ children, className = '' }) => (
  <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${className}`}>{children}</span>
);

function formatTimestamp(ts) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString(); } catch (e) { return String(ts); }
}

export default function AutoMode({
  zones = [],
  zoneStatus = {},
  publishRelay,
  manualOverrideToggle,
  timing = { start: '06:00', end: '07:00' },
  setTiming = () => {},
  onForceAction = null,
  cropOptions = [],          // array of crop names strings
  onChangeCrop = () => {},   // function(zoneId, newCrop)
}) {
  const summary = useMemo(() => {
    let on = 0, off = 0, unknown = 0;
    zones.forEach(z => {
      const st = zoneStatus?.[z.id] || {};
      if (st.relayState === true) on++;
      else if (st.relayState === false) off++;
      else unknown++;
    });
    return { on, off, unknown, total: zones.length };
  }, [zones, zoneStatus]);

  const handleForce = (zoneId, action) => {
    if (typeof onForceAction === 'function') onForceAction(zoneId, action);
    else if (typeof publishRelay === 'function') publishRelay(zoneId, action);
    else console.warn('No publishRelay or onForceAction provided.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Automatic Mode</h2>
          <p className="text-sm text-gray-600">Heuristic automatic irrigation using crop & telemetry.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            <div>Zones: <span className="font-medium">{summary.total}</span></div>
            <div>ON: <span className="font-medium">{summary.on}</span> &nbsp; OFF: <span className="font-medium">{summary.off}</span></div>
          </div>
          <Badge className="border-green-300 bg-green-50 text-green-700">Auto</Badge>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-md font-medium mb-3">Timing Window (optional)</h3>
        <div className="flex gap-4 items-center">
          <label className="text-sm text-gray-600">Start</label>
          <input type="time" value={timing.start} onChange={(e)=>setTiming({...timing, start: e.target.value})} className="border rounded px-2 py-1" />
          <label className="text-sm text-gray-600">End</label>
          <input type="time" value={timing.end} onChange={(e)=>setTiming({...timing, end: e.target.value})} className="border rounded px-2 py-1" />
          <div className="text-sm text-gray-500 italic">If empty, Auto runs all day.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {zones.map(zone => {
          const st = zoneStatus?.[zone.id] || {};
          const soilStr = st.currentSoil == null ? '—' : `${st.currentSoil}%`;
          const tOn = st.threshold_on == null ? '—' : `${st.threshold_on}%`;
          const tOff = st.threshold_off == null ? '—' : `${st.threshold_off}%`;
          const relay = st.relayState === true ? 'ON' : st.relayState === false ? 'OFF' : '—';
          const isManual = !!zone.manualOn;

          return (
            <div key={zone.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{zone.name} <span className="text-sm text-gray-500">({zone.id})</span></h3>
                    <div className="text-sm text-gray-600">Crop:
                      <select
                        value={zone.crop || ''}
                        onChange={(e)=>onChangeCrop(zone.id, e.target.value)}
                        className="ml-2 border rounded px-2 py-1"
                      >
                        <option value="">(select)</option>
                        {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {isManual ? <Badge className="border-orange-300 bg-orange-50 text-orange-700">Manual locked</Badge> : null}
                    <Badge className="border-slate-200 bg-slate-50 text-slate-700">Relay: {relay}</Badge>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <div className="text-gray-500">Soil (now)</div>
                    <div className="text-xl font-bold">{soilStr}</div>
                  </div>

                  <div>
                    <div className="text-gray-500">Thresholds</div>
                    <div className="text-lg font-semibold">{tOn} <span className="text-sm text-gray-400"> (ON)</span></div>
                    <div className="text-sm text-gray-500">OFF at {tOff}</div>
                  </div>
                </div>

                {st.details ? (
                  <div className="mt-3 text-xs text-gray-500">
                    <div>Details: ETo {Number(st.details.ETo ?? 0).toFixed(2)}mm, ETc {Number(st.details.ETc ?? 0).toFixed(2)}mm, rain24 {Number(st.details.rain24 ?? 0).toFixed(2)}mm</div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="text-xs text-gray-500">Last checked: <span className="font-medium">{formatTimestamp(st.lastChecked)}</span></div>
                <div className="flex gap-2">
                  <button onClick={()=>manualOverrideToggle(zone.id)} className={`px-3 py-1 rounded border ${isManual?'bg-orange-600 text-white':'bg-gray-100 text-gray-800'}`} title="Toggle manual override">
                    {isManual ? 'Unlock Manual' : 'Lock Manual'}
                  </button>

                  <button onClick={()=>handleForce(zone.id, 'ON')} className="px-3 py-1 rounded border bg-green-50 text-green-700" title="Force ON">Force ON</button>
                  <button onClick={()=>handleForce(zone.id, 'OFF')} className="px-3 py-1 rounded border bg-red-50 text-red-700" title="Force OFF">Force OFF</button>
                </div>

                <div className="text-xs text-gray-400">Last action: {formatTimestamp(st.lastActionTs)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-sm text-gray-500">
        Notes: Selecting a crop updates the heuristic used to compute thresholds. For production, run the controller server-side.
      </div>
    </div>
  );
}

AutoMode.propTypes = {
  zones: PropTypes.array,
  zoneStatus: PropTypes.object,
  publishRelay: PropTypes.func,
  manualOverrideToggle: PropTypes.func,
  timing: PropTypes.object,
  setTiming: PropTypes.func,
  onForceAction: PropTypes.func,
  cropOptions: PropTypes.array,
  onChangeCrop: PropTypes.func,
};
