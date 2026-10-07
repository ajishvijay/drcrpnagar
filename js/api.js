/**
 * All public page content is loaded here.
 *
 * Today the site is static: JSON files in /data, hosted from GitHub
 * through Cloudflare Pages. No build step.
 *
 * Later, set window.DRCRP_API = "https://example.org/api" before this
 * module runs. The API should return the same JSON shapes as /data.
 * Keep membership, complaints, dues, and admin on authenticated
 * resources. Do not fold private records into these public files.
 */

const RESOURCES = [
  "site",
  "about",
  "committee",
  "notices",
  "events",
  "gallery",
  "contacts",
  "documents",
  "emergency"
];

export async function loadAll() {
  const pairs = await Promise.all(RESOURCES.map(async (name) => [name, await load(name)]));
  return Object.fromEntries(pairs);
}

export async function load(name) {
  const endpoint = (window.DRCRP_API || "").replace(/\/$/, "");
  const url = endpoint
    ? `${endpoint}/${name}`
    : new URL(`data/${name}.json`, document.baseURI);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${name} (${response.status})`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`The file data/${name}.json is not valid JSON.`);
  }
}
