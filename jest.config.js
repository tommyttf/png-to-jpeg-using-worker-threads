/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 15000,

  collectCoverage: true,
  coverageDirectory: 'coverage/jest',
  coverageReporters: [ 'text', 'cobertura' ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage/junit',
        usePathForSuiteName: 'true',
      },
    ],
  ],
};
