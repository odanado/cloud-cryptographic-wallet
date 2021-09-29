/** @type {import('@jest/types').Config.InitialOptions} */

const config = {
  preset: "ts-jest",
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "html"],
  testEnvironment: "node",
};

module.exports = config;
