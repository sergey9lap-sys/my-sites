import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sitesRoot = join(root, "sites");
const textExtensions = new Set([".html", ".css", ".js"]);

for (const slug of readdirSync(sitesRoot)) {
  const siteRoot = join(sitesRoot, slug);
  if (!statSync(siteRoot).isDirectory()) continue;

  const nestedPublic = join(siteRoot, slug);
  if (existsSync(nestedPublic) && statSync(nestedPublic).isDirectory()) {
    cpSync(nestedPublic, siteRoot, { recursive: true, force: true });
    rmSync(nestedPublic, { recursive: true, force: true });
  }

  for (const file of walk(siteRoot)) {
    if (!textExtensions.has(extname(file))) continue;
    const source = readFileSync(file, "utf8");
    const normalized = source.replaceAll(`/${slug}/${slug}/`, `/${slug}/`);
    const rewritten = normalized.replace(/(["'`])(\/[^"'`\r\n]*)\1/g, (match, quote, url) => {
      if (url.startsWith("//") || url === `/${slug}` || url.startsWith(`/${slug}/`)) return match;
      if (extname(file) === ".js" && url === "/") return match;

      const cleanUrl = url.split(/[?#]/)[0];
      const target = resolve(siteRoot, decode(cleanUrl.slice(1)));
      if (!target.startsWith(siteRoot) || !existsSync(target)) return match;
      return `${quote}/${slug}${url}${quote}`;
    });

    const cssRewritten = rewritten.replace(/url\((["']?)\/(?!\/)([^\)"']+)\1\)/g, (match, quote, url) => {
      if (url === slug || url.startsWith(`${slug}/`)) return match;
      const cleanUrl = url.split(/[?#]/)[0];
      const target = resolve(siteRoot, decode(cleanUrl));
      if (!target.startsWith(siteRoot) || !existsSync(target)) return match;
      return `url(${quote}/${slug}/${url}${quote})`;
    });

    if (cssRewritten !== source) writeFileSync(file, cssRewritten);
  }
}

console.log("Embedded site paths prepared.");

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
