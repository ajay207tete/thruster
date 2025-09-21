module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))'
  ],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/?(*.)+(spec|test).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**'
  ],
  // Use node environment instead of jsdom to avoid conflicts with React Native
  testEnvironment: 'node',
  // Mock modules that don't work in Node environment
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@expo/vector-icons/(.*)$': '<rootDir>/node_modules/@expo/vector-icons/$1'
  }
};
