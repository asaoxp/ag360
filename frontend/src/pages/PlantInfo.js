import React, { useState } from 'react';
import axios from 'axios';

const PlantInfo = () => {
  const [plantInfo, setPlantInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [myCrops, setMyCrops] = useState([
    {
      id: 1,
      name: 'Tomato',
      imageUrl: 'https://images.unsplash.com/photo-1558351033-045e5c6bacd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      watering: 'Every 2-3 days',
      light: 'Full sun (6-8 hours)',
      soil: 'Well-draining, pH 6.0-6.8',
      fertilizer: 'Balanced fertilizer every 2 weeks',
      timeline: '70-80 days to harvest'
    },
    {
      id: 2,
      name: 'Corn',
      imageUrl: 'https://images.unsplash.com/photo-1558351033-045e5c6bacd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      watering: 'Once a week, deep watering',
      light: 'Full sun (6+ hours)',
      soil: 'Nitrogen-rich, pH 5.8-7.0',
      fertilizer: 'High-nitrogen fertilizer at planting',
      timeline: '60-100 days to harvest'
    }
  ]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    console.log('Starting search for:', searchTerm);
    setIsProcessing(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5001/api/plant/search', {
        plantName: searchTerm
      });

      console.log('Search response:', response.data);
      if (response.data.success) {
        setPlantInfo(response.data.plantInfo);
      } else {
        setError('Failed to get plant information. Please try again.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Error searching for plant. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addToMyCrops = () => {
    if (!plantInfo) return;
    
    const newCrop = {
      id: myCrops.length + 1,
      name: plantInfo.name,
      imageUrl: plantInfo.imageUrl,
      watering: plantInfo.watering,
      light: plantInfo.light,
      soil: plantInfo.soil,
      fertilizer: plantInfo.fertilizer,
      timeline: plantInfo.timeline
    };
    
    setMyCrops([...myCrops, newCrop]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      <h1 className="text-3xl font-bold text-green-700 mb-8 text-center">Plant Information Search</h1>

      {/* Centered Search Section */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 transition-shadow duration-300">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Search for Plant Information</h2>
            <p className="text-gray-600">Enter a plant name to get detailed information</p>
          </div>

          <div className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setError(null);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="Enter plant name..."
              className="flex-grow border border-gray-300 rounded-l-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={!searchTerm.trim() || isProcessing}
              className={`px-8 py-4 rounded-r-xl font-semibold text-white text-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] ${
                !searchTerm.trim() || isProcessing
                  ? 'bg-gray-400 cursor-not-allowed shadow-sm'
                  : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </div>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">Press Enter or click Search to find plant information</p>
        </div>
      </div>

      {/* Plant Information Display */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">Search Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {plantInfo && (
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 transition-shadow duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{plantInfo.name}</h2>
              <p className="text-gray-600 italic text-lg">{plantInfo.scientificName}</p>
            </div>

            <div className="flex flex-col lg:flex-row mb-8">
              <img
                src={plantInfo.imageUrl}
                alt={plantInfo.name}
                className="w-full lg:w-1/3 h-64 object-cover rounded-xl mb-6 lg:mb-0 lg:mr-8 shadow-md"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed mb-6">{plantInfo.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-blue-800">Watering Schedule</h4>
                </div>
                <p className="text-gray-700">{plantInfo.watering}</p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-yellow-800">Light Requirements</h4>
                </div>
                <p className="text-gray-700">{plantInfo.light}</p>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-green-800">Soil Requirements</h4>
                </div>
                <p className="text-gray-700">{plantInfo.soil}</p>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-purple-800">Fertilizer Needs</h4>
                </div>
                <p className="text-gray-700">{plantInfo.fertilizer}</p>
              </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 mb-8">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-indigo-800">Cultivation Timeline</h4>
              </div>
              <p className="text-gray-700">{plantInfo.timeline}</p>
            </div>

            <div className="text-center">
              <button
                onClick={addToMyCrops}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] hover:bg-green-700"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to My Crops
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-shadow duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">My Crops</h2>
          <span className="bg-green-100 text-green-800 text-sm font-semibold px-2.5 py-0.5 rounded">
            {myCrops.length} crops
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCrops.map((crop) => (
            <div key={crop.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
              <img src={crop.imageUrl} alt={crop.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{crop.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Watering:</span>
                    <span className="font-medium">{crop.watering}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Light:</span>
                    <span className="font-medium">{crop.light}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Harvest:</span>
                    <span className="font-medium">{crop.timeline}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  </div>
);
};

export default PlantInfo;