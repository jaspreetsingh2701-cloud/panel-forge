const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });
/** @type {import('jest').Config} */
module.exports = createJestConfig({ testEnvironment: 'jsdom', setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.spec.tsx'], moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }, collectCoverageFrom: ['src/components/ui/button.tsx'], coverageThreshold: { './src/components/ui/button.tsx': { branches: 70, functions: 70, lines: 70, statements: 70 } } });
