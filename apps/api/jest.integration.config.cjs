/** @type {import('jest').Config} */
module.exports = { rootDir: '.', testEnvironment: 'node', testMatch: ['<rootDir>/test/**/*.integration-spec.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }] }, testTimeout: 30000, clearMocks: true };
