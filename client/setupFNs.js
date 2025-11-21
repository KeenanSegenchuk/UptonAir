// setupFNs.js
const fs = require('fs');
const path = require('path');
const https = require('https');

// --------------------------------------------------
// Small helper to load .env key-value pairs
// --------------------------------------------------
function loadEnvValues() {
  const envPath = path.resolve(__dirname, '../.env');
  const envValues = {};

  if (!fs.existsSync(envPath)) {
    console.error("❌ .env not found at:", envPath);
    return envValues;
  }

  const envText = fs.readFileSync(envPath, 'utf-8');
  envText.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length > 0) {
      envValues[key] = rest.join('=').trim();
    }
  });

  return envValues;
}

// Cache .env so we only load once
const ENV = loadEnvValues();

// --------------------------------------------------
// FETCH LAT/LON FROM PURPLEAIR (now using .env key)
// --------------------------------------------------
async function fetchLatLon(sensorId) {
  const apiKey = ENV.PURPLEAIR_API_KEY;

  if (!apiKey) {
    throw new Error("Missing PURPLEAIR_API_KEY in .env");
  }

  if (sensorId == "0") {
    return {
      lat: 42.174540,
      lon: -71.602290
    };
  }

  const url = `https://api.purpleair.com/v1/sensors/${sensorId}?fields=latitude,longitude`;
  const options = {
    headers: {
      'X-API-Key': apiKey
    }
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  console.log(`Raw API response for sensor ${sensorId}:`, JSON.stringify(data));

  if (!data.sensor || data.sensor.latitude == null || data.sensor.longitude == null) {
    throw new Error(`Missing latitude/longitude in API response for sensor ${sensorId}`);
  }

  return {
    lat: data.sensor.latitude,
    lon: data.sensor.longitude
  };
}

// --------------------------------------------------
// APPLY .env → config.json (unchanged except using ENV)
// --------------------------------------------------
function applyEnvToConfig() {
  const configPath = path.resolve(__dirname, './src/config.json');
  const CONFIG_KEYS = [
    "URL",
    "WEBPAGE_TITLE",
    "HOMEPAGE",
    "CHATBOT_ENABLED",
    "ALERTS_ENABLED"
  ];

  if (!fs.existsSync(configPath)) {
    console.error("❌ config.json not found at:", configPath);
    return;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  CONFIG_KEYS.forEach(key => {
    if (ENV[key] !== undefined) config[key] = ENV[key];
  });

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  console.log("✅ config.json updated from .env");
}

module.exports = {
  fetchLatLon,
  applyEnvToConfig
};