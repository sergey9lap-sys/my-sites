import { cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "dist");
const files = ["index.html", "styles.css", "app.js", "assets"];

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const file of files) {
  cpSync(join(root, file), join(output, file), { recursive: true });
}

console.log("Static site built in dist/");
