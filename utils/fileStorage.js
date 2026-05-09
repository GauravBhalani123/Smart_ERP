const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function getFilePath(fileName) {
  ensureDataDir();
  return path.join(dataDir, fileName);
}

function readJson(fileName, defaultValue) {
  const filePath = getFilePath(fileName);
  if (!fs.existsSync(filePath)) {
    if (defaultValue !== undefined) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!content.trim()) {
    return defaultValue !== undefined ? defaultValue : null;
  }
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error(`Failed to parse JSON from ${fileName}`, err);
    return defaultValue !== undefined ? defaultValue : null;
  }
}

function writeJson(fileName, data) {
  const filePath = getFilePath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  readJson,
  writeJson,
};

