import { cloudflare } from "@cloudflare/vite-plugin";
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "waku/config";

export default defineConfig({
  vite: {
    define: {
      "import.meta.env.WAKU_BUILD_ID": "undefined",
    },
    environments: {
      rsc: {
        optimizeDeps: {
          include: ["hono/tiny"],
        },
        build: {
          rolldownOptions: {
            platform: "neutral",
          },
        },
      },
      ssr: {
        optimizeDeps: {
          include: ["waku > rsc-html-stream/server"],
        },
        build: {
          rolldownOptions: {
            platform: "neutral",
          },
        },
      },
    },
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
      }),
    ],
  },
});
