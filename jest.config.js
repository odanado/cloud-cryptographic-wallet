/** @type {import('@jest/types').Config.InitialOptions} */

const config = {
  preset: "ts-jest/presets/js-with-ts",
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "html"],
  testEnvironment: "node",
  transformIgnorePatterns: ["/node_modules/(?!(node-cjs-interop))"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};

module.exports = config;
