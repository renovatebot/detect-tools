/* globals process */

const ci = !!process.env.CI;

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: './.coverage/',
  coverageThreshold: {
    './src/manager': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  reporters: ci
    ? [['github-actions', { silent: false }], 'summary', 'jest-junit']
    : ['default'],
  coverageReporters: ci
    ? ['text-summary', 'lcovonly']
    : ['text-summary', 'html'],
};
