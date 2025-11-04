// @ts-check

import { createDefaultPreset } from 'ts-jest';

const ci = !!process.env.CI;

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...createDefaultPreset(),
  testEnvironment: 'node',
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: './.coverage/',
  coverageThreshold: {
    './src/manager': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    global: {
      branches: 71.4,
      functions: 66.6,
      lines: 69.2,
      statements: 69.2,
    },
  },
  reporters: ci
    ? [['github-actions', { silent: false }], 'summary', 'jest-junit']
    : ['default'],
  coverageReporters: ci
    ? ['text-summary', 'lcovonly']
    : ['text-summary', 'html'],
};
