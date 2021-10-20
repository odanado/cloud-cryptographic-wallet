/** @type {import('@jest/types').Config.InitialOptions} */

const config = {
  preset: "ts-jest",
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "html"],
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
  },
};

module.exports = config;
