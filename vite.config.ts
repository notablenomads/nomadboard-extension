import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// Function to copy files
function copyFiles() {
  return {
    name: "copy-files",
    buildEnd() {
      // Create assets directory if it doesn't exist
      if (!fs.existsSync("dist/assets")) {
        fs.mkdirSync("dist/assets", { recursive: true });
      }

      // Copy icon files
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
        popup: "src/popup/popup.html",
        background: "src/js/background.js",
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
