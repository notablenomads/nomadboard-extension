import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

function copyFiles() {
  return {
    name: "copy-files",
    buildEnd() {
      if (!fs.existsSync("dist/assets")) {
        fs.mkdirSync("dist/assets", { recursive: true });
      }

      const iconFiles = ["icon16.png", "icon48.png", "icon128.png"];
      iconFiles.forEach((file) => {
        fs.copyFileSync(`src/assets/icons/${file}`, `dist/assets/${file}`);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), copyFiles()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: "src/pages/popup/popup.html",
        background: "src/background/background.ts",
        contentScript: "src/content-scripts/linkedin.ts",
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
    cssCodeSplit: false,
  },
  base: "./",
});
