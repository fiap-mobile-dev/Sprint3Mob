const fs = require('fs');
const path = require('path');
const { createSeedData } = require('./seed');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'store.json');

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(createSeedData(), null, 2));
  }
}

function readData() {
  ensureStore();
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function writeData(data) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function createId(prefix) {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${time}-${random}`;
}

module.exports = {
  createId,
  readData,
  writeData,
};
