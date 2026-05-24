// scripts/patch-metro.cjs
const fs = require("fs");
const path = require("path");

const file = path.join(
  process.cwd(),
  "node_modules",
  "metro-config",
  "src",
  "loadConfig.js",
);

if (!fs.existsSync(file)) {
  console.log("metro-config not found");
  process.exit(0);
}

const original = "const configModule = await import(absolutePath)";
const patched =
  'const configModule = await import(require("url").pathToFileURL(absolutePath).href)';

let content = fs.readFileSync(file, "utf8");
if (content.includes(patched)) {
  console.log("already patched");
  process.exit(0);
}
if (!content.includes(original)) {
  console.log("patch target not found");
  process.exit(0);
}

fs.writeFileSync(file, content.replace(original, patched), "utf8");
console.log("patched successfully");
