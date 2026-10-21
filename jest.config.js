module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^test-renderer$': 'react-test-renderer',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/mobile/$1',
    '^@landing/(.*)$': '<rootDir>/src/landing/$1',
    '^@admin/(.*)$': '<rootDir>/src/admin/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)', '**/*.test.(ts|tsx|js)'],
  testPathIgnorePatterns: ['/node_modules/', '/contracts/', '/dist/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|@react-native-async-storage|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};