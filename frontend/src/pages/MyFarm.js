import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MyFarm = () => {
  // Mock data for the dashboard
  const farmOverview = {
    totalZones: 5,
    activePlants: 12,
    healthStatus: 'Good',
    warnings: 2,
    lastUpdate: '2023-06-15 14:30'
  };

  const healthData = [
    { day: 'Mon', health: 85 },
    { day: 'Tue', health: 87 },
    { day: 'Wed', health: 82 },
    { day: 'Thu', health: 88 },
    { day: 'Fri', health: 90 },
    { day: 'Sat', health: 89 },
    { day: 'Sun', health: 92 }
  ];

  const zones = [
    { id: 1, name: 'Zone A', crop: 'Tomatoes', health: 92, moisture: 42, status: 'Healthy' },
    { id: 2, name: 'Zone B', crop: 'Corn', health: 88, moisture: 38, status: 'Healthy' },
    { id: 3, name: 'Zone C', crop: 'Peppers', health: 76, moisture: 35, status: 'Warning' },
    { id: 4, name: 'Zone D', crop: 'Lettuce', health: 95, moisture: 52, status: 'Excellent' },
    { id: 5, name: 'Zone E', crop: 'Carrots', health: 83, moisture: 40, status: 'Good' }
  ];

  const alerts = [
    { id: 1, type: 'warning', message: 'Low soil moisture in Zone C', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'Irrigation scheduled for Zone A tomorrow', time: '5 hours ago' }
  ];

  const weeklyInsights = [
    { day: 'Mon', temperature: 28, humidity: 58, rainfall: 0 },
    { day: 'Tue', temperature: 30, humidity: 55, rainfall: 0 },
    { day: 'Wed', temperature: 32, humidity: 52, rainfall: 2 },
    { day: 'Thu', temperature: 29, humidity: 60, rainfall: 5 },
    { day: 'Fri', temperature: 27, humidity: 65, rainfall: 0 },
    { day: 'Sat', temperature: 26, humidity: 68, rainfall: 0 },
    { day: 'Sun', temperature: 28, humidity: 62, rainfall: 0 }
  ];

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">My Farm Dashboard</h1>
        <div className="text-sm text-gray-500">Last updated: {farmOverview.lastUpdate}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Farm Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Zones</p>
              <p className="text-3xl font-bold text-green-700">{farmOverview.totalZones}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Active Plants</p>
              <p className="text-3xl font-bold text-blue-700">{farmOverview.activePlants}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Health Status</p>
              <p className="text-3xl font-bold text-yellow-700">{farmOverview.healthStatus}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Warnings</p>
              <p className="text-3xl font-bold text-red-700">{farmOverview.warnings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3">
          <h2 className="text-2xl font-bold mb-4">Health Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={healthData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="health" stroke="#10b981" fillOpacity={1} fill="url(#colorHealth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Zone Status</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moisture</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {zones.map((zone) => (
                  <tr key={zone.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{zone.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{zone.crop}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              zone.health > 90 ? 'bg-green-500' : 
                              zone.health > 80 ? 'bg-green-400' : 
                              zone.health > 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${zone.health}%` }}
                          ></div>
                        </div>
                        <span>{zone.health}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{zone.moisture}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        zone.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                        zone.status === 'Good' ? 'bg-blue-100 text-blue-800' :
                        zone.status === 'Healthy' ? 'bg-green-100 text-green-800' :
                        zone.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {zone.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Alerts & Warnings</h2>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex">
                  <div className={`flex-shrink-0 h-5 w-5 ${
                    alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`}>
                    {alert.type === 'warning' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.386c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      alert.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'
                    }`}>
                      {alert.message}
                    </p>
                    <p className={`mt-1 text-xs ${
                      alert.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                    }`}>
                      {alert.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Weekly Insights</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyInsights}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="temperature" fill="#ef4444" name="Temperature (°C)" />
                  <Bar dataKey="humidity" fill="#3b82f6" name="Humidity (%)" />
                  <Bar dataKey="rainfall" fill="#0ea5e9" name="Rainfall (mm)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Monthly Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">92%</p>
            <p className="text-gray-600">Average Health</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">42mm</p>
            <p className="text-gray-600">Avg. Rainfall</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">28°C</p>
            <p className="text-gray-600">Avg. Temperature</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">12</p>
            <p className="text-gray-600">Active Crops</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyFarm;