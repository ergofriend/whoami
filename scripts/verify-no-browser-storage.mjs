import { readFile } from "node:fs/promises";

const serverBundlePath = new URL("../dist/server/ssr/index.js", import.meta.url);
const serverBundle = await readFile(serverBundlePath, "utf8");

if (serverBundle.includes("sessionStorage")) {
  throw new Error("Production bundle must not access sessionStorage");
}
