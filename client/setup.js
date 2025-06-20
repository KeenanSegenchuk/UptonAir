// setup.js

const fs = require('fs');
const path = require('path');

// Copy sensor-pos.json to src
try {
  const sensorSource = path.resolve(__dirname, '../sensor-pos.json');
  const sensorDestination = path.resolve(__dirname, 'src/sensor-pos.json');

  if (!fs.existsSync(sensorSource)) {
    throw new Error(`Source file not found: ${sensorSource}`);
  }

  fs.copyFileSync(sensorSource, sensorDestination);
  console.log('✅ sensor-pos.json copied to src/');
} catch (err) {
  console.error('❌ Failed to copy sensor-pos.json:', err.message);
}

// Configure env vars
try {
  const configSource = path.resolve(__dirname, '../client-config.json');

  if (!fs.existsSync(configSource)) {
    throw new Error(`client-config.json not found at ${configSource}`);
  }

  const configRaw = fs.readFileSync(configSource, 'utf-8');
  const config = JSON.parse(configRaw); // ensure valid JSON

  for (const [key, value] of Object.entries(config)) {
    process.env[key] = value;
    console.log(`🌱 ENV set: ${key}=${value}`);
  }

} catch (err) {
  console.error('❌ Error setting environment variables:', err.message);
}