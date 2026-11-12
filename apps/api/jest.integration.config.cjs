/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('jest').Config} */
module.exports = { rootDir: '.', testEnvironment: 'node', testMatch: ['<rootDir>/test/**/*.integration-spec.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { ...require('./tsconfig.json').compilerOptions, rootDir: '.' } }] }, testTimeout: 30000, clearMocks: true };
