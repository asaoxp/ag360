import React, { useState } from 'react';

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([
    {
      id: 1,
      date: '2023-06-15',
      disease: 'Tomato Blight',
      confidence: 92,
      treatment: 'Apply copper-based fungicide and remove affected leaves immediately.',
      imageUrl: 'https://images.unsplash.com/photo-1558351033-045e5c6bacd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 2,
      date: '2023-06-10',
      disease: 'Corn Rust',
      confidence: 87,
      treatment: 'Use resistant varieties and apply appropriate fungicides as recommended.',
      imageUrl: 'https://images.unsplash.com/photo-1558351033-045e5c6bacd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'
    }
  ]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
      setError(null);
    }
  };

  const handleDetect = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();

      // Process the result
      const result = {
        disease: data.disease.disease,
        confidence: Math.round(data.disease.confidence * 100),
        treatment: 'Apply appropriate treatment based on disease. Consult local agricultural extension for specific recommendations.',
        severity: 'Detected',
        recommendations: [
          'Monitor the plant regularly',
          'Apply recommended pesticides if necessary',
          'Ensure proper plant nutrition'
        ],
        nutrients: data.nutrients,
        fertilizers: data.fertilizers,
        diseaseAnalysis: data.diseaseAnalysis,
        nutrientAnalysis: data.nutrientAnalysis
      };

      setDetectionResult(result);
      setIsProcessing(false);

      // Add to history
      const newEntry = {
        id: history.length + 1,
        date: new Date().toISOString().split('T')[0],
        disease: result.disease,
        confidence: result.confidence,
        treatment: result.treatment,
        imageUrl: previewUrl
      };

      setHistory([newEntry, ...history]);
    } catch (error) {
      console.error('Error:', error);
      setIsProcessing(false);
      setError('Failed to analyze image. Please check your connection and try again.');
    }
  };

  const confidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-700 mb-2">AI Plant Disease Detection</h1>
        <p className="text-gray-600 text-lg">Upload your plant image for instant AI-powered analysis</p>
      </div>

      {/* Upload Section - Large Centered Card */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 border border-gray-100 transition-shadow duration-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Plant Image</h2>
            <p className="text-gray-600">Select a clear image of the plant leaf for comprehensive analysis</p>
          </div>

          <div className="border-2 border-dashed border-green-300 rounded-xl p-12 text-center mb-8 bg-green-50/30 hover:bg-green-50/50 transition-colors relative">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-80 mx-auto rounded-xl shadow-lg"
                />
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedImage(null);
                    setDetectionResult(null);
                  }}
                  className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-colors z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-lg text-gray-700 mb-2">
                  <span className="font-semibold text-green-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                />
              </div>
            )}

            {!previewUrl && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
              />
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleDetect}
              disabled={!selectedImage || isProcessing}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] ${
                !selectedImage || isProcessing
                  ? 'bg-gray-400 cursor-not-allowed shadow-sm'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Detect Disease
                </div>
              )}
            </button>

            <button
              onClick={handleDetect}
              disabled={!selectedImage || isProcessing}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] ${
                !selectedImage || isProcessing
                  ? 'bg-gray-400 cursor-not-allowed shadow-sm'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Check Nutrients
                </div>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 font-medium">Upload Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section - Side by Side Cards */}
      {detectionResult && (
        <div className="max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Disease Analysis Result Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 border border-gray-100 transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Disease Analysis Result</h3>
              </div>

              {/* 1. Disease Affected */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-blue-800 bg-blue-200 px-3 py-1 rounded-lg">1. Disease Affected</h4>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xl font-bold text-gray-800">{detectionResult.diseaseAnalysis?.name || detectionResult.disease}</h5>
                  <p className="text-gray-600">Plant: {detectionResult.diseaseAnalysis?.plant || 'Unknown'}</p>
                </div>
              </div>

              {/* 2. Disease Description */}
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 mb-6 border border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-yellow-800 bg-yellow-200 px-3 py-1 rounded-lg">2. Disease Description</h4>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{detectionResult.diseaseAnalysis?.description || 'Disease analysis in progress...'}</p>
                <div>
                  <h6 className="font-semibold text-gray-800 mb-2">Symptoms:</h6>
                  <ul className="space-y-1">
                    {detectionResult.diseaseAnalysis?.symptoms?.map((symptom, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700 text-sm">{symptom}</span>
                      </li>
                    )) || <li className="text-gray-500">Symptoms analysis in progress...</li>}
                  </ul>
                </div>
              </div>

              {/* 3. Suggested Remedies/Actions */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-green-800 bg-green-200 px-3 py-1 rounded-lg">3. Suggested Remedies/Actions</h4>
                </div>
                <ol className="space-y-2">
                  {detectionResult.diseaseAnalysis?.remedies?.map((remedy, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-green-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{remedy}</span>
                    </li>
                  )) || <li className="text-gray-500">Remedies analysis in progress...</li>}
                </ol>
              </div>

              {/* 4. Health Status/Alert */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-amber-800 bg-amber-200 px-3 py-1 rounded-lg">4. Health Status/Alert</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                      detectionResult.diseaseAnalysis?.healthStatus === 'High' ? 'bg-red-100 text-red-800' :
                      detectionResult.diseaseAnalysis?.healthStatus === 'Critical' ? 'bg-red-200 text-red-900' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      Status: {detectionResult.diseaseAnalysis?.healthStatus || 'Unknown'}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-700">{detectionResult.diseaseAnalysis?.alert || 'Analysis in progress'}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                      <span className="text-sm font-semibold">AI Confidence: {detectionResult.diseaseAnalysis?.confidence || detectionResult.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nutrient Analysis Result Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 border border-gray-100 transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Nutrient Analysis Result</h3>
              </div>

              {/* 1. Plant Identified */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-blue-800 bg-blue-200 px-3 py-1 rounded-lg">1. Plant Identified</h4>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xl font-bold text-gray-800">{detectionResult.nutrientAnalysis?.plantIdentified || 'Tomato (Solanum lycopersicum)'}</h5>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      detectionResult.nutrientAnalysis?.plantStatus?.includes('Deficient') ? 'bg-red-100 text-red-800' :
                      detectionResult.nutrientAnalysis?.plantStatus?.includes('Excess') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {detectionResult.nutrientAnalysis?.plantStatus || 'Healthy'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Nutrient Levels Detected */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-6 border border-green-200">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-green-800 bg-green-200 px-3 py-1 rounded-lg">2. Nutrient Levels Detected</h4>
                </div>
                <div className="space-y-6">
                  {Object.entries(detectionResult.nutrientAnalysis?.nutrientLevels || { Nitrogen: 21, Phosphorus: 16, Potassium: 8 }).map(([nutrient, level]) => (
                    <div key={nutrient} className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            nutrient === 'Nitrogen' ? 'bg-green-500' :
                            nutrient === 'Phosphorus' ? 'bg-blue-500' :
                            'bg-purple-500'
                          }`}></div>
                          <span className="font-semibold text-gray-800">{nutrient}</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            level < 15 ? 'bg-red-500' :
                            level < 25 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(level * 2, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Analysis Summary */}
              <div className="bg-gradient-to-r from-stone-50 to-stone-100 rounded-xl p-6 border border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-stone-800 bg-stone-200 px-3 py-1 rounded-lg">3. Analysis Summary</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-stone-200">
                    <div className="text-center">
                      <h5 className="text-sm font-semibold text-gray-600 mb-2">Deficiency Type</h5>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                        detectionResult.nutrientAnalysis?.deficiencyType?.includes('NITROGEN') ? 'bg-green-100 text-green-800' :
                        detectionResult.nutrientAnalysis?.deficiencyType?.includes('PHOSPHORUS') ? 'bg-blue-100 text-blue-800' :
                        detectionResult.nutrientAnalysis?.deficiencyType?.includes('POTASSIUM') ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {detectionResult.nutrientAnalysis?.deficiencyType || 'BALANCED'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-stone-200">
                    <div className="text-center">
                      <h5 className="text-sm font-semibold text-gray-600 mb-2">AI Confidence</h5>
                      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                        <span className="text-xl font-bold">{detectionResult.nutrientAnalysis?.confidence || '75.41'}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fertilizer Recommendations - Full Width Section */}
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 border border-gray-100 transition-shadow duration-300">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800">Recommended Fertilizers</h3>
                </div>
                <p className="text-gray-600 text-lg">Based on nutrient analysis, here are the recommended fertilizers for optimal plant health</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {detectionResult.fertilizers.map((fertilizer, index) => (
                  <div key={index} className="bg-gradient-to-br from-yellow-50 via-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold text-gray-800 mb-3">{fertilizer.name}</h4>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-200 text-yellow-800 border border-yellow-300">
                        {fertilizer.marketStatus}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/80 rounded-lg p-3 border border-yellow-200">
                        <div className="flex items-center mb-1">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                          <span className="text-sm font-semibold text-gray-700">Composition</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-5">{fertilizer.composition}</p>
                      </div>

                      <div className="bg-white/80 rounded-lg p-3 border border-yellow-200">
                        <div className="flex items-center mb-1">
                          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                          <span className="text-sm font-semibold text-gray-700">Price Range</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-5">{fertilizer.priceRange}</p>
                      </div>

                      <div className="bg-white/80 rounded-lg p-3 border border-yellow-200">
                        <div className="flex items-center mb-1">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                          <span className="text-sm font-semibold text-gray-700">Application Rate</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-5">{fertilizer.applicationRate}</p>
                      </div>

                      <div className="bg-white/80 rounded-lg p-3 border border-yellow-200">
                        <div className="flex items-center mb-1">
                          <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                          <span className="text-sm font-semibold text-gray-700">Instructions</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-5 leading-relaxed">{fertilizer.instructions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detection History */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 border border-gray-100 transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Detection History</h3>
            </div>
            <button className="text-green-600 hover:text-green-800 font-semibold transition-colors">
              View All →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 rounded-t-xl">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-xl">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Disease</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Treatment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tr-xl">Image</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{entry.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{entry.disease}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${confidenceColor(entry.confidence)}`}>
                        {entry.confidence}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{entry.treatment}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={entry.imageUrl} alt="Plant" className="h-12 w-12 rounded-lg shadow-sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  </div>
);
};

export default DiseaseDetection;