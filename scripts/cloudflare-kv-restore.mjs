#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  defaultBinding,
  keyTargetArgs,
  parseArgs,
  repoRoot,
  runWrangler
} from "./cloudflare-helpers.mjs";

const options = parseArgs(process.argv.slice(2));
const backupDirArg = options._[0];

if (!backupDirArg) {
  console.error("Usage: npm run restore:cloudflare -- <backup-dir> --yes [--config wrangler.restore-test.jsonc]");
  process.exit(1);
}

if (!options.yes) {
  console.error("Restore writes to Cloudflare KV. Re-run with --yes after checking the target config/namespace.");
  process.exit(1);
}

const backupDir = path.resolve(repoRoot, backupDirArg);
const manifest = JSON.parse(await readFile(path.join(backupDir, "manifest.json"), "utf8"));
const targetArgs = keyTargetArgs({ ...options, binding: options.binding || defaultBinding });

console.log(`Restoring ${manifest.keyCount} key(s) from ${backupDir}`);
console.log(`Target: ${options.config || options.namespaceId || options.binding || defaultBinding}`);

for (const item of manifest.keys) {
  const valuePath = path.join(backupDir, item.file);
  runWrangler(["kv", "key", "put", item.key, ...targetArgs, "--path", valuePath]);
  console.log(`Restored ${item.key}`);
}

console.log("Restore complete.");
