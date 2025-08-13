// setup.js
const sensor_setup = true;

const fs = require('fs');
const path = require('path');
const https = require('https');

const sensorSource = path.resolve(__dirname, '../sensor-pos.json');
const sensorDestination = path.resolve(__dirname, 'src/sensor-pos.json');

async function fetchLatLon(sensorId) {
  if(sensorId == "0")
    return {
      lat: 42.174540,
      lon: -71.602290
    };

  const url = `https://api.purpleair.com/v1/sensors/${sensorId}?fields=latitude,longitude`;
  const options = {
    headers: {
      'X-API-Key': "97AFA31E-6D6C-11F0-AF66-42010A800028"
    }
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  // DEBUG print raw API response (to see what's happening)
  console.log(`Raw API response for sensor ${sensorId}:`, JSON.stringify(data));

  if (!data.sensor || data.sensor.latitude == null || data.sensor.longitude == null) {
    throw new Error(`Missing latitude/longitude in API response for sensor ${sensorId}`);
  }

  return {
    lat: data.sensor.latitude,
    lon: data.sensor.longitude
  };
}

async function main() {
  if(!sensor_setup) return;

  try {
    if (!fs.existsSync(sensorSource)) {
      throw new Error(`Source file not found: ${sensorSource}`);
    }

    const sensorsRaw = fs.readFileSync(sensorSource, 'utf-8');
    const sensors = JSON.parse(sensorsRaw);

    // Fetch lat/lon for each sensor
    for (const obj of sensors) {
      try {
        const { lat, lon } = await fetchLatLon(obj.id);
        obj.lat = lat;
        obj.lon = lon;
        console.log(`✅ Sensor ${obj.id} updated with lat: ${lat}, lon: ${lon}`);
      } catch (fetchErr) {
        console.error(`❌ Failed to fetch lat/lon for sensor ${obj.id}:`, fetchErr.message);
      }
    }

    // Save updated sensors to destination file
    fs.writeFileSync(sensorDestination, JSON.stringify(sensors, null, 2));
    console.log(`✅ sensor-pos.json copied and updated at src/`);
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
  }
}

main();