const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const upload = multer({ dest: 'uploads/' });

// Fertilizer recommendation sets
const fertilizerSets = [
  // Set 1: Potassium-focused
  [
    {
      name: 'Muriate of Potash (MOP)',
      marketStatus: 'Market Available',
      composition: '60% Potassium (K2O)',
      priceRange: '₹300-400 per 50kg bag',
      applicationRate: '100-150 kg/ha',
      instructions: 'Apply during fruit development stage, avoid contact with leaves.'
    },
    {
      name: 'Sulphate of Potash (SOP)',
      marketStatus: 'Market Available',
      composition: '50% Potassium (K2O), 18% Sulphur (S)',
      priceRange: '₹400-500 per 50kg bag',
      applicationRate: '80-120 kg/ha',
      instructions: 'Suitable for chloride-sensitive crops like tobacco, fruits.'
    },
    {
      name: 'Potassium Magnesium Sulphate',
      marketStatus: 'Market Available',
      composition: '22% Potassium (K2O), 11% Magnesium (Mg), 22% Sulphur (S)',
      priceRange: '₹500-600 per 25kg bag',
      applicationRate: '50-80 kg/ha',
      instructions: 'Apply during fruit development, good for magnesium-deficient soils.'
    }
  ],
  // Set 2: Nitrogen-focused
  [
    {
      name: 'Urea',
      marketStatus: 'Market Available',
      composition: '46% Nitrogen (N)',
      priceRange: '₹250-350 per 50kg bag',
      applicationRate: '80-120 kg/ha',
      instructions: 'Apply in split doses, avoid application before heavy rain.'
    },
    {
      name: 'Ammonium Sulphate',
      marketStatus: 'Market Available',
      composition: '21% Nitrogen (N), 24% Sulphur (S)',
      priceRange: '₹180-250 per 50kg bag',
      applicationRate: '100-150 kg/ha',
      instructions: 'Good for alkaline soils, apply during vegetative growth.'
    },
    {
      name: 'Calcium Ammonium Nitrate (CAN)',
      marketStatus: 'Market Available',
      composition: '25% Nitrogen (N), 8% Calcium (Ca)',
      priceRange: '₹220-300 per 50kg bag',
      applicationRate: '150-200 kg/ha',
      instructions: 'Provides quick nitrogen boost with calcium supplement.'
    }
  ],
  // Set 3: Phosphorus-focused
  [
    {
      name: 'Single Super Phosphate (SSP)',
      marketStatus: 'Market Available',
      composition: '16% Phosphorus (P2O5), 11% Sulphur (S)',
      priceRange: '₹200-280 per 50kg bag',
      applicationRate: '80-120 kg/ha',
      instructions: 'Apply at sowing time, good for root development.'
    },
    {
      name: 'Di-Ammonium Phosphate (DAP)',
      marketStatus: 'Market Available',
      composition: '18% Nitrogen (N), 46% Phosphorus (P2O5)',
      priceRange: '₹350-450 per 50kg bag',
      applicationRate: '60-100 kg/ha',
      instructions: 'Apply at sowing, excellent for seed germination.'
    },
    {
      name: 'Triple Super Phosphate (TSP)',
      marketStatus: 'Market Available',
      composition: '46% Phosphorus (P2O5)',
      priceRange: '₹400-500 per 50kg bag',
      applicationRate: '40-80 kg/ha',
      instructions: 'High phosphorus content, apply during early growth stages.'
    }
  ],
  // Set 4: Balanced NPK
  [
    {
      name: 'NPK 20-20-20',
      marketStatus: 'Market Available',
      composition: '20% Nitrogen (N), 20% Phosphorus (P2O5), 20% Potassium (K2O)',
      priceRange: '₹400-500 per 50kg bag',
      applicationRate: '80-120 kg/ha',
      instructions: 'Balanced fertilizer for overall plant growth and development.'
    },
    {
      name: 'NPK 15-15-15',
      marketStatus: 'Market Available',
      composition: '15% Nitrogen (N), 15% Phosphorus (P2O5), 15% Potassium (K2O)',
      priceRange: '₹350-450 per 50kg bag',
      applicationRate: '100-150 kg/ha',
      instructions: 'General purpose fertilizer suitable for most crops.'
    },
    {
      name: 'NPK 10-26-26',
      marketStatus: 'Market Available',
      composition: '10% Nitrogen (N), 26% Phosphorus (P2O5), 26% Potassium (K2O)',
      priceRange: '₹450-550 per 50kg bag',
      applicationRate: '60-100 kg/ha',
      instructions: 'High P-K fertilizer for flowering and fruit development.'
    }
  ],
  // Set 5: Organic options
  [
    {
      name: 'Vermicompost',
      marketStatus: 'Market Available',
      composition: '1-2% Nitrogen (N), 0.5-1% Phosphorus (P2O5), 0.5-1% Potassium (K2O)',
      priceRange: '₹150-250 per 50kg bag',
      applicationRate: '2-5 tons/ha',
      instructions: 'Organic matter rich fertilizer, improves soil structure.'
    },
    {
      name: 'Neem Cake',
      marketStatus: 'Market Available',
      composition: '5% Nitrogen (N), 1% Phosphorus (P2O5), 1% Potassium (K2O)',
      priceRange: '₹80-120 per 50kg bag',
      applicationRate: '200-300 kg/ha',
      instructions: 'Natural pesticide with nutrient value, apply as soil amendment.'
    },
    {
      name: 'Bone Meal',
      marketStatus: 'Market Available',
      composition: '4% Nitrogen (N), 20% Phosphorus (P2O5), Trace Potassium',
      priceRange: '₹200-300 per 50kg bag',
      applicationRate: '100-200 kg/ha',
      instructions: 'Slow-release phosphorus source, excellent for root development.'
    }
  ]
];

// Function to generate fertilizer recommendations based on nutrient analysis
function generateFertilizerRecommendations(nutrients) {
  // Select fertilizer set based on nutrient deficiencies
  let selectedSet = 0;

  if (nutrients.Nitrogen === 'Deficient') {
    selectedSet = 1; // Nitrogen-focused
  } else if (nutrients.Phosphorus === 'Deficient') {
    selectedSet = 2; // Phosphorus-focused
  } else if (nutrients.Potassium === 'Deficient') {
    selectedSet = 0; // Potassium-focused
  } else {
    // Random selection for balanced or excess nutrients
    selectedSet = Math.floor(Math.random() * fertilizerSets.length);
  }

  return fertilizerSets[selectedSet];
}

// Function to generate detailed disease analysis
function generateDetailedDiseaseAnalysis(diseaseData) {
  const diseases = {
    'Tomato___Bacterial_spot': {
      name: 'Bacterial Spot',
      plant: 'Tomato (Solanum lycopersicum)',
      description: 'Bacterial spot is a common disease caused by Xanthomonas bacteria. It appears as small, dark lesions on leaves, stems, and fruits. The lesions are surrounded by a yellow halo and can cause significant yield loss if not controlled.',
      symptoms: [
        'Small, dark, water-soaked lesions on leaves',
        'Yellow halos around lesions',
        'Lesions on stems and fruits',
        'Defoliation in severe cases'
      ],
      remedies: [
        'Use certified disease-free seeds',
        'Apply copper-based bactericides preventively',
        'Avoid overhead irrigation to reduce leaf wetness',
        'Remove and destroy infected plant debris',
        'Rotate crops with non-host plants for 2–3 years'
      ],
      healthStatus: 'High',
      alert: 'Immediate action required',
      confidence: Math.round(diseaseData.confidence * 10000) / 100
    },
    'Tomato___Late_blight': {
      name: 'Late Blight',
      plant: 'Tomato (Solanum lycopersicum)',
      description: 'Late blight is a devastating disease caused by Phytophthora infestans. It spreads rapidly in cool, wet conditions and can destroy entire crops within days.',
      symptoms: [
        'Dark, water-soaked lesions on leaves',
        'White fungal growth on leaf undersides',
        'Brown lesions on stems and fruits',
        'Rapid plant collapse in humid conditions'
      ],
      remedies: [
        'Apply fungicides preventively during wet seasons',
        'Ensure good air circulation between plants',
        'Avoid overhead watering',
        'Remove infected plants immediately',
        'Use resistant varieties when available'
      ],
      healthStatus: 'Critical',
      alert: 'Immediate action required',
      confidence: Math.round(diseaseData.confidence * 10000) / 100
    },
    'Corn_(maize)___Common_rust_': {
      name: 'Common Rust',
      plant: 'Corn (Zea mays)',
      description: 'Common rust is caused by Puccinia sorghi fungus. It appears as reddish-brown pustules on leaves and can reduce photosynthesis and yield.',
      symptoms: [
        'Reddish-brown pustules on leaves',
        'Pustules arranged in rows along veins',
        'Yellowing of affected leaves',
        'Premature leaf death in severe cases'
      ],
      remedies: [
        'Plant resistant varieties',
        'Apply fungicides when pustules first appear',
        'Ensure proper plant spacing for air circulation',
        'Avoid excessive nitrogen fertilization',
        'Rotate crops with non-host plants'
      ],
      healthStatus: 'Medium',
      alert: 'Monitor closely',
      confidence: Math.round(diseaseData.confidence * 10000) / 100
    }
  };

  // Return detailed analysis for the detected disease, or a default if not found
  const diseaseKey = diseaseData.disease;
  return diseases[diseaseKey] || {
    name: diseaseKey.replace(/___/g, ' ').replace(/_/g, ' '),
    plant: 'Unknown',
    description: 'Disease analysis available. Please consult agricultural experts for specific treatment.',
    symptoms: ['Disease symptoms detected'],
    remedies: ['Consult local agricultural extension for treatment recommendations'],
    healthStatus: 'Unknown',
    alert: 'Further analysis recommended',
    confidence: Math.round(diseaseData.confidence * 10000) / 100
  };
}

// Function to generate detailed nutrient analysis
function generateDetailedNutrientAnalysis(nutrientData) {
  // Mock nutrient levels (in real implementation, this would come from ML analysis)
  const nutrientLevels = {
    Nitrogen: Math.floor(Math.random() * 40) + 10, // 10-50%
    Phosphorus: Math.floor(Math.random() * 30) + 5, // 5-35%
    Potassium: Math.floor(Math.random() * 25) + 5   // 5-30%
  };

  // Determine deficiency type based on nutrient levels
  let deficiencyType = 'BALANCED';
  let plantStatus = 'Healthy';

  if (nutrientLevels.Nitrogen < 20) {
    deficiencyType = 'NITROGEN DEFICIENCY';
    plantStatus = 'Nitrogen Deficient';
  } else if (nutrientLevels.Phosphorus < 15) {
    deficiencyType = 'PHOSPHORUS DEFICIENCY';
    plantStatus = 'Phosphorus Deficient';
  } else if (nutrientLevels.Potassium < 15) {
    deficiencyType = 'POTASSIUM DEFICIENCY';
    plantStatus = 'Potassium Deficient';
  }

  return {
    plantIdentified: 'Tomato (Solanum lycopersicum)',
    plantStatus: plantStatus,
    nutrientLevels: nutrientLevels,
    deficiencyType: deficiencyType,
    confidence: Math.round((Math.random() * 20 + 70) * 100) / 100 // 70-90%
  };
}

const uploadImage = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let diseaseData, nutrientData;

        try {
            // Try to use ML service
            const fileStream = fs.createReadStream(file.path);

            // Create form data for disease prediction
            const diseaseForm = new FormData();
            diseaseForm.append('file', fileStream, { filename: file.originalname });

            // Send to Python API for disease
            const diseaseResponse = await axios.post('http://localhost:5004/predict_disease', diseaseForm, {
                headers: diseaseForm.getHeaders(),
                timeout: 10000
            });
            diseaseData = diseaseResponse.data;

            // Reset stream for nutrients
            const fileStream2 = fs.createReadStream(file.path);
            const nutrientForm = new FormData();
            nutrientForm.append('file', fileStream2, { filename: file.originalname });

            // Send to Python API for nutrients
            const nutrientResponse = await axios.post('http://localhost:5004/predict_nutrients', nutrientForm, {
                headers: nutrientForm.getHeaders(),
                timeout: 10000
            });
            nutrientData = nutrientResponse.data;

        } catch (mlError) {
            console.log('⚠️  ML Service not available, using mock responses...');

            // Mock disease detection response
            diseaseData = {
                disease: 'Unable to analyze - ML service not available',
                confidence: 0,
                mock: true,
                message: 'Install Python dependencies to enable ML analysis'
            };

            // Mock nutrient analysis response
            nutrientData = {
                Nitrogen: 'Analysis unavailable',
                Phosphorus: 'Analysis unavailable',
                Potassium: 'Analysis unavailable',
                mock: true,
                message: 'Install Python dependencies to enable nutrient analysis'
            };
        }

        // Generate fertilizer recommendations based on nutrient analysis
        const fertilizerRecommendations = generateFertilizerRecommendations(nutrientData);

        // Generate detailed disease analysis
        const detailedDiseaseAnalysis = generateDetailedDiseaseAnalysis(diseaseData);

        // Generate detailed nutrient analysis
        const detailedNutrientAnalysis = generateDetailedNutrientAnalysis(nutrientData);

        // Clean up uploaded file
        fs.unlinkSync(file.path);

        res.json({
            disease: diseaseData,
            nutrients: nutrientData,
            fertilizers: fertilizerRecommendations,
            diseaseAnalysis: detailedDiseaseAnalysis,
            nutrientAnalysis: detailedNutrientAnalysis,
            ml_service_available: !diseaseData.mock
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: error.message,
            disease: { disease: 'Error processing image', confidence: 0 },
            nutrients: { Nitrogen: 'Error', Phosphorus: 'Error', Potassium: 'Error' }
        });
    }
};

module.exports = { upload, uploadImage };