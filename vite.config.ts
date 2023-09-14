import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "aws-kms-packages/**",
    ],
  },
  resolve: {
    alias: {
      "@packages": path.resolve(__dirname, "./packages"),
    },
  },
});
