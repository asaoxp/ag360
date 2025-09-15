import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    irrigationThresholds: {
      zoneA: 30,
      zoneB: 25,
      zoneC: 35
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
      lowMoisture: true,
      diseaseAlerts: true,
      weatherWarnings: true
    },
    apiKeys: {
      weather: 'sk-weather-1234567890abcdef',
      soil: 'sk-soil-0987654321fedcba'
    },
    crops: [
      { id: 1, name: 'Tomato', selected: true },
      { id: 2, name: 'Corn', selected: true },
      { id: 3, name: 'Pepper', selected: false },
      { id: 4, name: 'Lettuce', selected: false },
      { id: 5, name: 'Carrot', selected: false }
    ]
  });

  const [newCrop, setNewCrop] = useState('');

  const updateIrrigationThreshold = (zone, value) => {
    setSettings({
      ...settings,
      irrigationThresholds: {
        ...settings.irrigationThresholds,
        [zone]: value
      }
    });
  };

  const toggleNotification = (type) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: !settings.notifications[type]
      }
    });
  };

  const updateApiKey = (key, value) => {
    setSettings({
      ...settings,
      apiKeys: {
        ...settings.apiKeys,
        [key]: value
      }
    });
  };

  const toggleCrop = (id) => {
    setSettings({
      ...settings,
      crops: settings.crops.map(crop => 
        crop.id === id ? { ...crop, selected: !crop.selected } : crop
      )
    });
  };

  const addNewCrop = () => {
    if (newCrop.trim()) {
      const newCropItem = {
        id: settings.crops.length + 1,
        name: newCrop.trim(),
        selected: true
      };
      
      setSettings({
        ...settings,
        crops: [...settings.crops, newCropItem]
      });
      
      setNewCrop('');
    }
  };

  const saveSettings = () => {
    // In a real app, this would send the settings to a backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Irrigation Thresholds</h2>
            <p className="mb-6 text-gray-600">Set soil moisture thresholds for automatic irrigation</p>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Zone A Threshold</label>
                  <span className="font-bold">{settings.irrigationThresholds.zoneA}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={settings.irrigationThresholds.zoneA}
                  onChange={(e) => updateIrrigationThreshold('zoneA', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Zone B Threshold</label>
                  <span className="font-bold">{settings.irrigationThresholds.zoneB}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={settings.irrigationThresholds.zoneB}
                  onChange={(e) => updateIrrigationThreshold('zoneB', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Zone C Threshold</label>
                  <span className="font-bold">{settings.irrigationThresholds.zoneC}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={settings.irrigationThresholds.zoneC}
                  onChange={(e) => updateIrrigationThreshold('zoneC', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
            <p className="mb-6 text-gray-600">Choose how you want to be notified about farm events</p>
            
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Notification Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span>Email Notifications</span>
                  </div>
                  <button 
                    onClick={() => toggleNotification('email')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${settings.notifications.email ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${settings.notifications.email ? 'translate-x-6' : ''}`}></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <span>SMS Notifications</span>
                  </div>
                  <button 
                    onClick={() => toggleNotification('sms')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${settings.notifications.sms ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${settings.notifications.sms ? 'translate-x-6' : ''}`}></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <span>Push Notifications</span>
                  </div>
                  <button 
                    onClick={() => toggleNotification('push')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${settings.notifications.push ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${settings.notifications.push ? 'translate-x-6' : ''}`}></div>
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-3">Alert Types</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Low Soil Moisture Alerts</span>
                  <button 
                    onClick={() => toggleNotification('lowMoisture')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${settings.notifications.lowMoisture ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${settings.notifications.lowMoisture ? 'translate-x-6' : ''}`}></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Disease Detection Alerts</span>
                  <button 
                    onClick={() => toggleNotification('diseaseAlerts')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${settings.notifications.diseaseAlerts ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${settings.notifications.diseaseAlerts ? 'translate-x-6' : ''}`}></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Weather Warnings</span>
                  <button 
                    onClick={() => toggleNotification('weatherWarnings')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${settings.notifications.weatherWarnings ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${settings.notifications.weatherWarnings ? 'translate-x-6' : ''}`}></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Crop List Customization</h2>
            <p className="mb-4 text-gray-600">Select which crops to include in your farm management</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {settings.crops.map((crop) => (
                <div 
                  key={crop.id} 
                  className={`border rounded-lg p-3 flex items-center justify-between cursor-pointer ${
                    crop.selected ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                  onClick={() => toggleCrop(crop.id)}
                >
                  <span>{crop.name}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    crop.selected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {crop.selected && (
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex">
              <input 
                type="text" 
                value={newCrop}
                onChange={(e) => setNewCrop(e.target.value)}
                placeholder="Add new crop..."
                className="flex-grow border border-gray-300 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={addNewCrop}
                className="bg-green-600 text-white px-6 rounded-r-lg hover:bg-green-700 transition duration-300"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
          <h2 className="text-2xl font-bold mb-4">API Keys</h2>
          <p className="mb-6 text-gray-600">Manage your external service API keys</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weather API Key</label>
              <div className="flex">
                <input 
                  type="password" 
                  value={settings.apiKeys.weather}
                  onChange={(e) => updateApiKey('weather', e.target.value)}
                  className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="bg-gray-200 px-3 rounded-r-lg">
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil Data API Key</label>
              <div className="flex">
                <input 
                  type="password" 
                  value={settings.apiKeys.soil}
                  onChange={(e) => updateApiKey('soil', e.target.value)}
                  className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="bg-gray-200 px-3 rounded-r-lg">
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={saveSettings}
            className="w-full mt-8 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;