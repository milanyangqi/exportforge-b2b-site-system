#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  defaultBinding,
  keyTargetArgs,
  parseArgs,
  parseJsonArrayFromOutput,
  repoRoot,
  safeKeyFilename,
  timestamp,
  wranglerOutput
} from "./cloudflare-helpers.mjs";

const options = parseArgs(process.argv.slice(2));
const backupRoot = path.resolve(repoRoot, options.out || path.join("backups", "cloudflare", timestamp()));
const keysDir = path.join(backupRoot, "keys");
const binding = options.binding || defaultBinding;
const targetArgs = keyTargetArgs(options);
const prefixArgs = options.prefix ? ["--prefix", String(options.prefix)] : [];

await mkdir(keysDir, { recursive: true });

console.log(`Backing up Cloudflare KV to ${backupRoot}`);
const listResult = wranglerOutput(["kv", "key", "list", ...targetArgs, ...prefixArgs]);
const listedKeys = parseJsonArrayFromOutput(listResult.stdout);
const keyNames = listedKeys
  .map((entry) => (typeof entry === "string" ? entry : entry.name))
  .filter(Boolean)
  .sort();
const manifestKeys = [];

await writeFile(path.join(backupRoot, "kv-keys.json"), JSON.stringify(listedKeys, null, 2));

for (const key of keyNames) {
  const file = path.join("keys", `${safeKeyFilename(key)}.txt`);
  const absoluteFile = path.join(backupRoot, file);
  const valueResult = wranglerOutput(["kv", "key", "get", key, ...targetArgs, "--text"]);
  const value = valueResult.stdout;

  await writeFile(absoluteFile, value, "utf8");

  if (key === "admin-state") {
    await writeFile(path.join(backupRoot, "admin-state.json"), value, "utf8");
  }

  manifestKeys.push({
    key,
    file,
    bytes: Buffer.byteLength(value)
  });

  console.log(`Saved ${key}`);
}

const manifest = {
  version: 1,
  createdAt: new Date().toISOString(),
  source: {
    config: options.config || "wrangler.jsonc",
    binding,
    namespaceId: options.namespaceId || null,
    mode: options.local ? "local" : "remote"
  },
  keyCount: manifestKeys.length,
  keys: manifestKeys
};

await writeFile(path.join(backupRoot, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Backup complete: ${manifestKeys.length} key(s)`);
