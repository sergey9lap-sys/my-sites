import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative as relativePath, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sitesRoot = join(root, "sites");
const textExtensions = new Set([".html", ".css", ".js"]);
const assetExtension = /\.(?:avif|gif|jpe?g|png|svg|webp|woff2?|ttf)(?:[?#].*)?$/i;
const issues = [];

for (const slug of readdirSync(sitesRoot)) {
  const siteRoot = join(sitesRoot, slug);
  if (!statSync(siteRoot).isDirectory()) continue;

  for (const file of walk(siteRoot)) {
    if (!textExtensions.has(extname(file))) continue;
    const source = readFileSync(file, "utf8");
    const urls = new Set();

    for (const match of source.matchAll(/(?:src|href)=["']([^"'#]+)["']/g)) urls.add(match[1]);
    for (const match of source.matchAll(/url\(["']?([^\)"']+)["']?\)/g)) urls.add(match[1]);
    for (const match of source.matchAll(/["'`]((?:\/|\.\.\/|\.\/)[^"'`\s<>]+)["'`]/g)) {
      if (!match[1].includes("${") && !match[1].startsWith("%23") && assetExtension.test(match[1])) urls.add(match[1]);
    }

    for (const rawUrl of urls) {
      if (rawUrl.includes("${") || rawUrl.startsWith("%23") || /^(?:data:|https?:|mailto:|tel:|#)/.test(rawUrl)) continue;
      const url = rawUrl.split(/[?#]/)[0];
      let target;

      if (url.startsWith(`/${slug}/`)) {
        target = join(siteRoot, decode(url.slice(slug.length + 2)));
      } else if (url === "/") {
        continue;
      } else if (url.startsWith("/")) {
        issues.push(`${slug}: unprefixed ${url} in ${relative(file)}`);
        continue;
      } else {
        target = resolve(dirname(file), decode(url));
      }

      if (!existsSync(target)) issues.push(`${slug}: missing ${rawUrl} in ${relative(file)}`);
    }
  }
}

if (issues.length) {
  console.error(issues.slice(0, 100).join("\n"));
  console.error(`Found ${issues.length} asset path issue(s).`);
  process.exit(1);
}

console.log("All embedded site asset paths are valid.");

function* walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

function decode(value) {
  try { return decodeURIComponent(value); }
  catch { return value; }
}

function relative(file) {
  return relativePath(root, file).replaceAll("\\", "/");
}
