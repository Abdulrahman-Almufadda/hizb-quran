const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes('svg')) {
  config.resolver.assetExts.push('svg');
}
config.resolver.sourceExts = config.resolver.sourceExts.filter((ext) => ext !== 'svg');

if (!config.resolver.assetExts.includes('db')) {
  config.resolver.assetExts.push('db');
}

module.exports = config;
