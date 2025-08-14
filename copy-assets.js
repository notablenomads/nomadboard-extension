const fs = require("fs");
const path = require("path");

if (!fs.existsSync("dist/assets")) {
  fs.mkdirSync("dist/assets", { recursive: true });
}

const iconFiles = ["icon16.png", "icon48.png", "icon128.png"];
iconFiles.forEach((file) => {
  fs.copyFileSync(path.join("src/assets/icons", file), path.join("dist/assets", file));
  console.log(`Copied ${file} to dist/assets`);
});
