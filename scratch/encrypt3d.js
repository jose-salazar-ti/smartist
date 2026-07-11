const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/models/mug.glb');
const outputPath = path.join(__dirname, '../public/models/asset_core_01.dat');

try {
  const buffer = fs.readFileSync(inputPath);
  
  // XOR key (must match the decryption key in React)
  const KEY = 42;
  
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= KEY;
  }
  
  fs.writeFileSync(outputPath, buffer);
  console.log(`Encrypted model saved to ${outputPath}`);
} catch (error) {
  console.error("Error encrypting model:", error);
}
