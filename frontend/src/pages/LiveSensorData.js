// frontend/src/pages/LiveSensorData.js
import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import useWebsocketTelemetry from '../hooks/useWebsocketTelemetry';

const LiveSensorData = () => {
  const { telemetry, wsConnected, lastMsgTs } = useWebsocketTelemetry();

  // initial mock data (kept to fill charts until live data arrives) - limit to 12
  const initialMock = [
    { time: '00:00', temperature: 22, humidity: 65, soilMoisture: 45 },
    { time: '02:00', temperature: 21, humidity: 68, soilMoisture: 44 },
    { time: '04:00', temperature: 20, humidity: 70, soilMoisture: 43 },
    { time: '06:00', temperature: 23, humidity: 67, soilMoisture: 46 },
    { time: '08:00', temperature: 26, humidity: 62, soilMoisture: 42 },
    { time: '10:00', temperature: 29, humidity: 58, soilMoisture: 40 },
    { time: '12:00', temperature: 32, humidity: 55, soilMoisture: 38 },
    { time: '14:00', temperature: 34, humidity: 52, soilMoisture: 37 },
    { time: '16:00', temperature: 33, humidity: 54, soilMoisture: 39 },
    { time: '18:00', temperature: 30, humidity: 57, soilMoisture: 41 },
    { time: '20:00', temperature: 27, humidity: 60, soilMoisture: 43 },
    { time: '22:00', temperature: 24, humidity: 63, soilMoisture: 44 },
  ].slice(-12);

  // sensorData will hold last 12 readings (for charts)
  const [sensorData, setSensorData] = useState(initialMock);

  // tableRows will show last 12 rows (most recent first)
  const [tableRows, setTableRows] = useState(() =>
    initialMock.slice().reverse().map(d => ({
      time: d.time,
      temperature: `${d.temperature} °C`,
      humidity: `${d.humidity} %`,
      soilMoisture: `${d.soilMoisture} %`,
      ldr: '—',
      relay1: 0,
      relay2: 0
    }))
  );

  const [lastSync, setLastSync] = useState('--:--:--');

  // Update when telemetry arrives
  useEffect(() => {
    if (!telemetry) return;

    const t = telemetry.temperature !== undefined ? (Math.round(telemetry.temperature * 10) / 10) : null;
    const h = telemetry.humidity !== undefined ? (Math.round(telemetry.humidity * 10) / 10) : null;
    const soil = telemetry.soilPct !== undefined ? telemetry.soilPct : null;
    const ldr = telemetry.ldrPct !== undefined ? telemetry.ldrPct : null;
    const r1 = telemetry.relay1 !== undefined ? telemetry.relay1 : 0;
    const r2 = telemetry.relay2 !== undefined ? telemetry.relay2 : 0;

    const now = new Date();
    const timeStr = now.toLocaleTimeString();

    // New point for charts
    const newPoint = {
      time: timeStr,
      temperature: t !== null ? t : null,
      humidity: h !== null ? h : null,
      soilMoisture: soil !== null ? soil : null
    };

    // maintain last 12 values for charts
    setSensorData(prev => {
      const next = [...prev, newPoint].slice(-12);
      return next;
    });

    // new row for table (most recent first), limit to 12 rows
    const newRow = {
      time: timeStr,
      temperature: t !== null ? `${t} °C` : '--',
      humidity: h !== null ? `${h} %` : '--',
      soilMoisture: soil !== null ? `${soil} %` : '--',
      ldr: ldr !== null ? `${ldr} %` : '—',
      relay1: r1,
      relay2: r2
    };
    setTableRows(prev => [newRow, ...prev].slice(0, 12));

    setLastSync(timeStr);
  }, [telemetry]);

  // Determine online status: require wsConnected AND lastMsgTs recent (<=12s)
  const nowMs = Date.now();
  const recent = lastMsgTs && (nowMs - lastMsgTs <= 12_000); // 12s tolerance
  const online = wsConnected && recent;

  const statusCards = [
    {
      title: 'Temperature',
      value: telemetry && telemetry.temperature !== undefined ? `${Math.round(telemetry.temperature*10)/10} °C` : '— °C',
      change: 'Real-time',
      icon: '🌡️',
      color: 'bg-red-100'
    },
    {
      title: 'Humidity',
      value: telemetry && telemetry.humidity !== undefined ? `${Math.round(telemetry.humidity*10)/10} %` : '— %',
      change: 'Real-time',
      icon: '💧',
      color: 'bg-blue-100'
    },
    {
      title: 'Soil Moisture',
      value: telemetry && telemetry.soilPct !== undefined ? `${telemetry.soilPct} %` : '— %',
      change: 'Real-time',
      icon: '🌱',
      color: 'bg-green-100'
    },
    {
      title: 'Light (LDR)',
      value: telemetry && telemetry.ldrPct !== undefined ? `${telemetry.ldrPct} %` : '— %',
      change: 'Real-time',
      icon: '💡',
      color: 'bg-yellow-100'
    },
  ];

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Live Sensor Data</h1>
        <div className="flex items-center">
          <span className={`inline-block px-3 py-1 rounded-full font-semibold ${online ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {online ? 'MQTT ONLINE' : (wsConnected ? 'MQTT OFFLINE (no recent msgs)' : 'WS DISCONNECTED')}
          </span>
          <span className="text-sm text-gray-500 ml-4">Last sync: {lastSync}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statusCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-500 mb-1">{card.title}</h3>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-sm text-gray-500 mt-2">{card.change}</p>
              </div>
              <div className={`text-3xl p-3 rounded-full ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* charts: use sensorData (last 12 points) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Temperature Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="temperature" stroke="#ef4444" fillOpacity={1} fill="url(#colorTemperature)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Humidity & Soil Moisture</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="soilMoisture" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table updated live rows (last 12) */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Sensor Readings</h2>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300">
            Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature (°C)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humidity (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soil Moisture (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Light Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relays</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableRows.map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{row.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.temperature}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.humidity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.soilMoisture}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.ldr}</td>
                  <td className="px-6 py-4 whitespace-nowrap">R1: {row.relay1 ? 'ON' : 'OFF'} / R2: {row.relay2 ? 'ON' : 'OFF'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* weather card kept as-is */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Weather Forecast</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-3xl my-2">☀️</p>
            <p className="font-bold">28°C</p>
            <p className="text-sm text-gray-500">Sunny</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Fri</p>
            <p className="text-3xl my-2">⛅</p>
            <p className="font-bold">26°C</p>
            <p className="text-sm text-gray-500">Cloudy</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Sat</p>
            <p className="text-3xl my-2">🌧️</p>
            <p className="font-bold">24°C</p>
            <p className="text-sm text-gray-500">Rainy</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Sun</p>
            <p className="text-3xl my-2">🌦️</p>
            <p className="font-bold">25°C</p>
            <p className="text-sm text-gray-500">Showers</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Mon</p>
            <p className="text-3xl my-2">☀️</p>
            <p className="font-bold">27°C</p>
            <p className="text-sm text-gray-500">Sunny</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSensorData;