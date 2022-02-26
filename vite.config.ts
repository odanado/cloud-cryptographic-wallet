import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "packages/aws-kms-signer/**",
      "packages/aws-kms-provider/**",
      "packages/aws-kms-ethers-signer/**",
      "test/e2e/**",
    ],
  },
});
