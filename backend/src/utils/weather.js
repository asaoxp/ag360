// backend/src/utils/weather.js
const axios = require('axios');
const API_KEY = process.env.OPENWEATHER_API_KEY || null;

async function fetchForecast(lat, lon) {
  if (!API_KEY || !lat || !lon) return null;
  try {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${API_KEY}`;
    const res = await axios.get(url, { timeout: 7000 });
    return res.data;
  } catch (err) {
    console.warn('fetchForecast failed', err.message || err);
    return null;
  }
}

module.exports = { fetchForecast };
