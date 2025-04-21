const fs = require("fs");
const path = require("path");

// Create assets directory if it doesn't exist
if (!fs.existsSync("dist/assets")) {
  fs.mkdirSync("dist/assets", { recursive: true });
}

// Copy icon files
const iconFiles = ["icon16.png", "icon48.png", "icon128.png"];
iconFiles.forEach((file) => {
  fs.copyFileSync(path.join("src/assets/icons", file), path.join("dist/assets", file));
  console.log(`Copied ${file} to dist/assets`);
});
