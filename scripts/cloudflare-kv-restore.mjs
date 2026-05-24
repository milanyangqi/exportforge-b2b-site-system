#!/usr/bin/env node
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { randomBytes, scryptSync } from "node:crypto";
import os from "node:os";
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
const usage =
  "Usage: npm run restore:cloudflare -- <backup-dir> --yes [--config wrangler.restore-test.jsonc] [--admin-email admin@example.com --admin-password 'new-password']";

if (!backupDirArg) {
  console.error(usage);
  process.exit(1);
}

if (!options.yes) {
  console.error("Restore writes to Cloudflare KV. Re-run with --yes after checking the target config/namespace.");
  process.exit(1);
}

const backupDir = path.resolve(repoRoot, backupDirArg);
const manifest = JSON.parse(await readFile(path.join(backupDir, "manifest.json"), "utf8"));
const targetArgs = keyTargetArgs({ ...options, binding: options.binding || defaultBinding });
const adminEmail = String(options.adminEmail || process.env.RESTORE_ADMIN_EMAIL || "").trim().toLowerCase();
const adminPassword = String(options.adminPassword || process.env.RESTORE_ADMIN_PASSWORD || "");

if ((adminEmail && !adminPassword) || (!adminEmail && adminPassword)) {
  console.error("Pass both admin email and admin password when resetting a restored admin password.");
  console.error(usage);
  process.exit(1);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const key = scryptSync(password, salt, 64).toString("base64url");
  return `scrypt:${salt}:${key}`;
}

async function valuePathForRestore(item) {
  const originalValuePath = path.join(backupDir, item.file);

  if (item.key !== "admin-state" || !adminEmail || !adminPassword) {
    return originalValuePath;
  }

  const state = JSON.parse(await readFile(originalValuePath, "utf8"));
  let updated = false;

  state.users = (state.users || []).map((user) => {
    if (String(user.email || "").toLowerCase() !== adminEmail) return user;
    updated = true;
    return { ...user, passwordHash: hashPassword(adminPassword) };
  });

  if (!updated) {
    throw new Error(`Admin user ${adminEmail} was not found in admin-state.`);
  }

  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "cloudflare-kv-restore-"));
  const patchedValuePath = path.join(tmpDir, "admin-state.json");
  await writeFile(patchedValuePath, JSON.stringify(state, null, 2), "utf8");
  console.log(`Updated password hash for ${adminEmail} during restore`);
  return patchedValuePath;
}

console.log(`Restoring ${manifest.keyCount} key(s) from ${backupDir}`);
console.log(`Target: ${options.config || options.namespaceId || options.binding || defaultBinding}`);

for (const item of manifest.keys) {
  const valuePath = await valuePathForRestore(item);
  runWrangler(["kv", "key", "put", item.key, ...targetArgs, "--path", valuePath]);
  console.log(`Restored ${item.key}`);
}

console.log("Restore complete.");
