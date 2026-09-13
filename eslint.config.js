const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['assets/mushaf/**', 'src/assets/mushafManifest.ts', 'dist/**', 'jest.setup.js'],
  },
];
