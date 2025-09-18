// @ts-check

import { createDefaultPreset } from 'ts-jest';

const ci = !!process.env.CI;

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...createDefaultPreset(),
  testEnvironment: 'node',
  coverageDirectory: './.coverage/',
  coverageThreshold: {
    './src/manager': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    global: {
      branches: 100,
      functions: 80,
      lines: 72.4,
      statements: 72.4,
    },
  },
  reporters: ci
    ? [['github-actions', { silent: false }], 'summary', 'jest-junit']
    : ['default'],
  coverageReporters: ci
    ? ['text-summary', 'lcovonly']
    : ['text-summary', 'html'],
};
