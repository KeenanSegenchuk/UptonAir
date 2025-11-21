//on-build client configuration setup
//copies env vars into client-accesible config
//copies over sensor list and pulls lat/lon vals from purpleair

const sensor_setup = true;

const fs = require('fs');
const path = require('path');
const https = require('https');
//helper functions
const { fetchLatLon, applyEnvToConfig } = require('./setupFNs');

const sensorSource = path.resolve(__dirname, '../sensor-info.json');
const sensorDestination = path.resolve(__dirname, 'src/sensor-pos.json');

const geojsonSource = path.resolve(__dirname, '../town.geojson');
const geojsonDestination = path.resolve(__dirname, 'src/town.geojson');

async function main() {
  //copy relevant project env vars into client config
  applyEnvToConfig();

  //copy town.geojson into src code
  if (!fs.existsSync(geojsonSource)) {
    throw new Error(`Source file not found: ${geojsonSource}`);
  }
  const geojson = fs.readFileSync(geojsonSource, 'utf-8');
  fs.writeFileSync(geojsonDestination, geojson);


  try {
    //optional: skip sensor setup 
    if(!sensor_setup) {return;}

    //make sure files exist
    if (!fs.existsSync(sensorSource)) {
      throw new Error(`Source file not found: ${sensorSource}`);
    }

    //load sensor configuration
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