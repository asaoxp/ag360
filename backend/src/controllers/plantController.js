const axios = require('axios');
const OpenAI = require('openai');
const fs = require('fs');
const FormData = require('form-data');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory cache (in production, use Redis or database)
const plantCache = new Map();

// Plant identification using Plant.id API
const identifyPlant = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create form data for Plant.id API
    const form = new FormData();
    form.append('images', fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: file.mimetype
    });

    // Plant.id API parameters
    form.append('modifiers', JSON.stringify(['crops_fast', 'similar_images']));
    form.append('plant_details', JSON.stringify(['common_names', 'url', 'description', 'taxonomy', 'rank', 'gbif_id']));

    let suggestions = [];

    try {
      // Try to use Plant.id API
      const response = await axios.post('https://api.plant.id/v2/identify', form, {
        headers: {
          ...form.getHeaders(),
          'Api-Key': process.env.PLANT_ID_API_KEY,
        },
        timeout: 10000
      });

      // Extract plant suggestions
      suggestions = response.data.suggestions?.map(suggestion => ({
        name: suggestion.plant_name,
        scientificName: suggestion.plant_details?.scientific_name || suggestion.plant_name,
        probability: suggestion.probability,
        commonNames: suggestion.plant_details?.common_names || [],
        description: suggestion.plant_details?.description?.value || '',
        imageUrl: suggestion.plant_details?.url || suggestion.similar_images?.[0]?.url || ''
      })) || [];

    } catch (apiError) {
      console.log('⚠️  Plant.id API not available, using mock identification...');

      // Mock plant identification response
      suggestions = [
        {
          name: 'Sample Plant',
          scientificName: 'Sample species',
          probability: 0.85,
          commonNames: ['Sample Plant'],
          description: 'This is a mock identification result. Install Plant.id API key for real identification.',
          imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
          mock: true
        }
      ];
    }

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    res.json({
      success: true,
      suggestions: suggestions,
      api_available: !suggestions[0]?.mock
    });

  } catch (error) {
    console.error('Plant identification error:', error);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Failed to identify plant',
      details: error.message
    });
  }
};

// Get plant information using ChatGPT
const getPlantInfo = async (req, res) => {
  try {
    const { plantName, scientificName } = req.body;

    if (!plantName) {
      return res.status(400).json({ error: 'Plant name is required' });
    }

    // Check cache first
    const cacheKey = plantName.toLowerCase();
    if (plantCache.has(cacheKey)) {
      return res.json({
        success: true,
        plantInfo: plantCache.get(cacheKey),
        cached: true
      });
    }

    // Create prompt for ChatGPT
    const prompt = `Provide detailed information about the plant "${plantName}"${scientificName ? ` (scientific name: ${scientificName})` : ''} in the following structured JSON format:

{
  "name": "Common name",
  "scientificName": "Scientific name",
  "description": "1-2 sentences about the plant, origin, or uses",
  "watering": "Watering schedule and tips",
  "light": "Light requirements (e.g., full sun, partial shade)",
  "soil": "Soil requirements including preferred pH and drainage",
  "fertilizer": "Fertilizer needs including type and frequency",
  "timeline": "Cultivation timeline including flowering/fruiting season",
  "imageUrl": "URL to a representative image of the plant"
}

Please ensure the information is accurate and practical for gardeners and farmers.`;

    // Call ChatGPT API
    let responseText;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable botanist and agricultural expert. Provide accurate, helpful information about plants in the requested JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      responseText = completion.choices[0].message.content;
    } catch (apiError) {
      // If API quota exceeded, return mock data
      if (apiError.status === 429 || apiError.code === 'insufficient_quota') {
        console.log('OpenAI API quota exceeded, using fallback data');

        // Plant-specific image URLs
        const plantImages = {
          tomato: 'https://thf.bing.com/th/id/OIP.-6ZjmZqtJK8pdhwUzmmXnwHaE8?w=244&h=180&c=7&r=0&o=7&cb=thfc1&dpr=2&pid=1.7&rm=3',
          potato: 'https://thf.bing.com/th/id/OIP.0cpkDqf28VpHMG5KuYQkxwHaE8?w=257&h=180&c=7&r=0&o=7&cb=thfc1&dpr=2&pid=1.7&rm=3',
          hibiscus: 'https://thf.bing.com/th/id/OIP.0wJScLzdCbmHzHD71ISvhgHaE7?w=287&h=191&c=7&r=0&o=7&cb=thfc1&dpr=2&pid=1.7&rm=3',
          cucumber: 'https://thf.bing.com/th/id/OIP.Ilou7OJ13iNZ8mD2q108UAHaE8?w=256&h=180&c=7&r=0&o=7&cb=thfc1&dpr=2&pid=1.7&rm=3',
          rose: 'https://thf.bing.com/th/id/OIP.FRbRUmVXu2uyW332H1pA2wHaFS?w=205&h=180&c=7&r=0&o=7&cb=thfc1&dpr=2&pid=1.7&rm=3',
          coconut: 'https://thf.bing.com/th/id/OIP.zFL1_vG5RAM8vbeCNLLRrQHaFj?w=268&h=201&c=7&r=0&o=7&cb=thfc1&dpr=2&pid=1.7&rm=3'
        };

        // Return mock plant data
        const mockData = {
          name: plantName,
          scientificName: plantName === 'tomato' ? 'Solanum lycopersicum' :
                         plantName === 'corn' ? 'Zea mays' :
                         plantName === 'wheat' ? 'Triticum aestivum' :
                         plantName === 'hibiscus' ? 'Hibiscus rosa-sinensis' :
                         plantName === 'cucumber' ? 'Cucumis sativus' :
                         plantName === 'rose' ? 'Rosa' :
                         plantName === 'coconut' ? 'Cocos nucifera' :
                         `${plantName.charAt(0).toUpperCase() + plantName.slice(1)} species`,
          description: `The ${plantName} is a widely cultivated plant known for its agricultural and nutritional value.`,
          watering: plantName === 'tomato' ? 'Every 2-3 days' :
                  plantName === 'corn' ? 'Once a week, deep watering' :
                  plantName === 'hibiscus' ? 'Daily watering, keep soil moist' :
                  plantName === 'cucumber' ? 'Regular watering, 1-2 inches per week' :
                  plantName === 'rose' ? 'Deep watering 2-3 times per week' :
                  plantName === 'coconut' ? 'Regular watering, keep soil moist but not waterlogged' :
                  'Regular watering based on soil moisture',
          light: plantName === 'tomato' ? 'Full sun (6-8 hours)' :
                plantName === 'corn' ? 'Full sun (6+ hours)' :
                plantName === 'hibiscus' ? 'Full sun to partial shade' :
                plantName === 'cucumber' ? 'Full sun (6-8 hours)' :
                plantName === 'rose' ? 'Full sun (6+ hours)' :
                plantName === 'coconut' ? 'Full sun' :
                'Full sun to partial shade',
          soil: plantName === 'tomato' ? 'Well-draining, pH 6.0-6.8' :
               plantName === 'corn' ? 'Nitrogen-rich, pH 5.8-7.0' :
               plantName === 'hibiscus' ? 'Well-draining, slightly acidic soil' :
               plantName === 'cucumber' ? 'Rich, well-draining soil, pH 6.0-7.0' :
               plantName === 'rose' ? 'Well-draining, pH 6.0-7.0' :
               plantName === 'coconut' ? 'Sandy, well-draining soil' :
               'Well-draining soil with balanced nutrients',
          fertilizer: plantName === 'tomato' ? 'Balanced fertilizer every 2 weeks' :
                    plantName === 'corn' ? 'High-nitrogen fertilizer at planting' :
                    plantName === 'hibiscus' ? 'Balanced fertilizer every 4-6 weeks' :
                    plantName === 'cucumber' ? 'Balanced fertilizer every 2-3 weeks' :
                    plantName === 'rose' ? 'Rose-specific fertilizer every 6 weeks' :
                    plantName === 'coconut' ? 'Palm fertilizer 2-3 times per year' :
                    'Balanced fertilizer during growing season',
          timeline: plantName === 'tomato' ? '70-80 days to harvest' :
                  plantName === 'corn' ? '60-100 days to harvest' :
                  plantName === 'hibiscus' ? 'Blooms year-round in warm climates' :
                  plantName === 'cucumber' ? '50-70 days to harvest' :
                  plantName === 'rose' ? '60-90 days to first bloom' :
                  plantName === 'coconut' ? '5-8 years to first fruit' :
                  'Varies by variety and growing conditions',
          imageUrl: plantImages[plantName.toLowerCase()] || `https://images.unsplash.com/photo-1558351033-045e5c6bacd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80`
        };

        // Cache the result
        plantCache.set(cacheKey, mockData);

        return res.json({
          success: true,
          plantInfo: mockData,
          cached: false,
          fallback: true
        });
      } else {
        throw apiError;
      }
    }

    // Parse JSON response
    let plantInfo;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      plantInfo = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseError) {
      console.error('Failed to parse ChatGPT response:', parseError);
      return res.status(500).json({
        error: 'Failed to parse plant information',
        details: 'Invalid response format from AI service'
      });
    }

    // Cache the result
    plantCache.set(cacheKey, plantInfo);

    res.json({
      success: true,
      plantInfo: plantInfo,
      cached: false
    });

  } catch (error) {
    console.error('ChatGPT API error:', error);
    res.status(500).json({
      error: 'Failed to get plant information',
      details: error.message
    });
  }
};

// Search plant by name (combines identification and info retrieval)
const searchPlantByName = async (req, res) => {
  try {
    const { plantName } = req.body;

    if (!plantName) {
      return res.status(400).json({ error: 'Plant name is required' });
    }

    // Check cache first
    const cacheKey = plantName.toLowerCase();
    if (plantCache.has(cacheKey)) {
      return res.json({
        success: true,
        plantInfo: plantCache.get(cacheKey),
        cached: true
      });
    }

    // Create prompt for ChatGPT
    const prompt = `Provide detailed information about the plant "${plantName}" in the following structured JSON format:

{
  "name": "Common name",
  "scientificName": "Scientific name",
  "description": "1-2 sentences about the plant, origin, or uses",
  "watering": "Watering schedule and tips",
  "light": "Light requirements (e.g., full sun, partial shade)",
  "soil": "Soil requirements including preferred pH and drainage",
  "fertilizer": "Fertilizer needs including type and frequency",
  "timeline": "Cultivation timeline including flowering/fruiting season",
  "imageUrl": "URL to a representative image of the plant"
}

Please ensure the information is accurate and practical for gardeners and farmers.`;

    // Call ChatGPT API
    let responseText;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable botanist and agricultural expert. Provide accurate, helpful information about plants in the requested JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      responseText = completion.choices[0].message.content;
    } catch (apiError) {
      // If API quota exceeded, return mock data
      if (apiError.status === 429 || apiError.code === 'insufficient_quota') {
        console.log('OpenAI API quota exceeded, using fallback data');

        // Plant-specific image URLs
        const plantImages = {
          tomato: 'https://thf.bing.com/th/id/OIP.-6ZjmZqtJK8pdhwUzmmXnwHaE8?w=244&h=180&c=7&r=0&o=7&cb=thfc1&dpr=2&pid=1.7&rm=3',
          potato: 'https://thf.bing.com/th/id/OIP.0cpkDqf28VpHMG5KuYQkxwHaE8?w=257&h=180&c=7&r=0&o=7&cb=thfc1&dpr=2&pid=1.7&rm=3',
          hibiscus: 'https://thf.bing.com/th/id/OIP.0wJScLzdCbmHzHD71ISvhgHaE7?w=287&h=191&c=7&r=0&o=7&cb=thfc1&dpr=2&pid=1.7&rm=3',
          cucumber: 'https://thf.bing.com/th/id/OIP.Ilou7OJ13iNZ8mD2q108UAHaE8?w=256&h=180&c=7&r=0&o=7&cb=thfc1&dpr=2&pid=1.7&rm=3',
          rose: 'https://thf.bing.com/th/id/OIP.FRbRUmVXu2uyW332H1pA2wHaFS?w=205&h=180&c=7&r=0&o=7&cb=thfc1&dpr=2&pid=1.7&rm=3',
          coconut: 'https://thf.bing.com/th/id/OIP.zFL1_vG5RAM8vbeCNLLRrQHaFj?w=268&h=201&c=7&r=0&o=7&cb=thfc1&dpr=2&pid=1.7&rm=3'
        };

        // Return mock plant data
        const mockData = {
          name: plantName,
          scientificName: plantName === 'tomato' ? 'Solanum lycopersicum' :
                         plantName === 'corn' ? 'Zea mays' :
                         plantName === 'wheat' ? 'Triticum aestivum' :
                         plantName === 'hibiscus' ? 'Hibiscus rosa-sinensis' :
                         plantName === 'cucumber' ? 'Cucumis sativus' :
                         plantName === 'rose' ? 'Rosa' :
                         plantName === 'coconut' ? 'Cocos nucifera' :
                         `${plantName.charAt(0).toUpperCase() + plantName.slice(1)} species`,
          description: `The ${plantName} is a widely cultivated plant known for its agricultural and nutritional value.`,
          watering: plantName === 'tomato' ? 'Every 2-3 days' :
                  plantName === 'corn' ? 'Once a week, deep watering' :
                  plantName === 'hibiscus' ? 'Daily watering, keep soil moist' :
                  plantName === 'cucumber' ? 'Regular watering, 1-2 inches per week' :
                  plantName === 'rose' ? 'Deep watering 2-3 times per week' :
                  plantName === 'coconut' ? 'Regular watering, keep soil moist but not waterlogged' :
                  'Regular watering based on soil moisture',
          light: plantName === 'tomato' ? 'Full sun (6-8 hours)' :
                plantName === 'corn' ? 'Full sun (6+ hours)' :
                plantName === 'hibiscus' ? 'Full sun to partial shade' :
                plantName === 'cucumber' ? 'Full sun (6-8 hours)' :
                plantName === 'rose' ? 'Full sun (6+ hours)' :
                plantName === 'coconut' ? 'Full sun' :
                'Full sun to partial shade',
          soil: plantName === 'tomato' ? 'Well-draining, pH 6.0-6.8' :
               plantName === 'corn' ? 'Nitrogen-rich, pH 5.8-7.0' :
               plantName === 'hibiscus' ? 'Well-draining, slightly acidic soil' :
               plantName === 'cucumber' ? 'Rich, well-draining soil, pH 6.0-7.0' :
               plantName === 'rose' ? 'Well-draining, pH 6.0-7.0' :
               plantName === 'coconut' ? 'Sandy, well-draining soil' :
               'Well-draining soil with balanced nutrients',
          fertilizer: plantName === 'tomato' ? 'Balanced fertilizer every 2 weeks' :
                    plantName === 'corn' ? 'High-nitrogen fertilizer at planting' :
                    plantName === 'hibiscus' ? 'Balanced fertilizer every 4-6 weeks' :
                    plantName === 'cucumber' ? 'Balanced fertilizer every 2-3 weeks' :
                    plantName === 'rose' ? 'Rose-specific fertilizer every 6 weeks' :
                    plantName === 'coconut' ? 'Palm fertilizer 2-3 times per year' :
                    'Balanced fertilizer during growing season',
          timeline: plantName === 'tomato' ? '70-80 days to harvest' :
                  plantName === 'corn' ? '60-100 days to harvest' :
                  plantName === 'hibiscus' ? 'Blooms year-round in warm climates' :
                  plantName === 'cucumber' ? '50-70 days to harvest' :
                  plantName === 'rose' ? '60-90 days to first bloom' :
                  plantName === 'coconut' ? '5-8 years to first fruit' :
                  'Varies by variety and growing conditions',
          imageUrl: plantImages[plantName.toLowerCase()] || `https://images.unsplash.com/photo-1558351033-045e5c6bacd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80`
        };

        // Cache the result
        plantCache.set(cacheKey, mockData);

        return res.json({
          success: true,
          plantInfo: mockData,
          cached: false,
          fallback: true
        });
      } else {
        throw apiError;
      }
    }

    // Parse JSON response
    let plantInfo;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      plantInfo = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseError) {
      console.error('Failed to parse ChatGPT response:', parseError);
      return res.status(500).json({
        error: 'Failed to parse plant information',
        details: 'Invalid response format from AI service'
      });
    }

    // Cache the result
    plantCache.set(cacheKey, plantInfo);

    res.json({
      success: true,
      plantInfo: plantInfo,
      cached: false
    });

  } catch (error) {
    console.error('Plant search error:', error);
    res.status(500).json({
      error: 'Failed to search plant',
      details: error.message
    });
  }
};

module.exports = {
  identifyPlant,
  getPlantInfo,
  searchPlantByName
};