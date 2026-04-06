// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Habilita a resolução de sub-caminhos (package exports) para pacotes Node modernos (como o novo React Query v5)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
