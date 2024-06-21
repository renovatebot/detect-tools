/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
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
};
