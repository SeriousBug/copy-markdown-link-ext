/// <reference types="vitest" />
import { defineConfig } from "vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import solidPlugin from "vite-plugin-solid";
import path from "path";
import zipPack from "vite-plugin-zip-pack";

const pkg = readJsonFile("package.json");

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    solidPlugin(),
    webExtension({
      manifest: generateManifest,
      disableAutoLaunch: false,
      browser: process.env.BROWSER,
    }),
    process.env.NODE_ENV === "production" &&
      zipPack({
        outDir: ".",
        outFileName: `copy-markdown-link-ext-${process.env.BROWSER}-${pkg.version}.zip`,
      }),
  ],
  define: {
    APP_VERSION: JSON.stringify(pkg.version),
    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
  },
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["src/**/*"],
    },
  },
});
