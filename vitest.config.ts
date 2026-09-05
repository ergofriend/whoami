import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    // Keep the official React wrappers real while mocking their SVG engine in tests.
    server: { deps: { inline: ["drawably"] } },
  },
});
