import { mkdir, copyFile, readdir } from "node:fs/promises";
const source = new URL("../node_modules/pyodide/", import.meta.url);
const target = new URL("../public/python/", import.meta.url);
await mkdir(target, { recursive: true });
for (const name of await readdir(source)) {
  if (/\.(mjs|js|wasm|zip|json)$/.test(name)) {
    await copyFile(new URL(name, source), new URL(name, target));
  }
}
console.log(
  "Python runtime copied to public/python (served locally, no CDN required).",
);
