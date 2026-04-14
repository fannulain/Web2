module.exports = {
  verbose: true,
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/server.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'cobertura'],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  testTimeout: 60000
};
