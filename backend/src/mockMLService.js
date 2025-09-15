const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Mock disease detection endpoint
app.post('/predict_disease', upload.single('file'), (req, res) => {
  console.log('📊 Mock ML Service: Processing disease detection request');

  // Mock response
  const diseases = [
    'Tomato___healthy',
    'Tomato___Late_blight',
    'Corn_(maize)___healthy',
    'Corn_(maize)___Common_rust_',
    'Potato___Early_blight',
    'Grape___Black_rot'
  ];

  const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];

  res.json({
    disease: randomDisease,
    confidence: Math.random() * 0.5 + 0.5, // Random confidence between 0.5-1.0
    mock: true,
    message: 'This is a mock response. Install Python dependencies for real ML analysis.'
  });
});

// Mock nutrient analysis endpoint
app.post('/predict_nutrients', upload.single('file'), (req, res) => {
  console.log('📊 Mock ML Service: Processing nutrient analysis request');

  // Mock nutrient response
  const nitrogenLevels = ['Deficient', 'Normal', 'Excess'];
  const phosphorusLevels = ['Deficient', 'Normal', 'Excess'];
  const potassiumLevels = ['Deficient', 'Normal', 'Excess'];

  res.json({
    Nitrogen: nitrogenLevels[Math.floor(Math.random() * nitrogenLevels.length)],
    Phosphorus: phosphorusLevels[Math.floor(Math.random() * phosphorusLevels.length)],
    Potassium: potassiumLevels[Math.floor(Math.random() * potassiumLevels.length)],
    mock: true,
    message: 'This is a mock response. Install Python dependencies for real nutrient analysis.'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'mock_ml_service',
    port: 5004,
    services: {
      disease_detection: 'available (mock)',
      nutrient_analysis: 'available (mock)',
      plant_info: 'available (mock)'
    },
    mock: true
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    service: 'Mock ML Service (Node.js)',
    status: 'running',
    port: 5004,
    model_loaded: false,
    mock: true,
    endpoints: [
      '/predict_disease (POST) - Mock disease detection',
      '/predict_nutrients (POST) - Mock nutrient analysis',
      '/health (GET) - Health check',
      '/status (GET) - Service status'
    ]
  });
});

module.exports = app;