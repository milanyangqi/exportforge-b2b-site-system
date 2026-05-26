#!/usr/bin/env node
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateKey = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
const libraryRoot = path.resolve(
  repoRoot,
  process.env.TEMPLATE_LIBRARY_DIR || "../WebsiteTemplates"
);

function usage() {
  console.error("Usage: npm run template:apply -- <templateKey>");
  console.error("Set TEMPLATE_LIBRARY_DIR to override the default ../WebsiteTemplates path.");
}

function resolveTemplateDir(key) {
  const direct = path.join(libraryRoot, key);
  const nested = path.join(libraryRoot, "templates", key);

  if (existsSync(path.join(direct, "manifest.json"))) return direct;
  if (existsSync(path.join(nested, "manifest.json"))) return nested;

  return direct;
}

function assertInsideRepo(targetPath) {
  const relative = path.relative(repoRoot, targetPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside repository: ${targetPath}`);
  }
}

async function copyFileFromTemplate(templateDir, relativeSource, relativeTarget) {
  const source = path.join(templateDir, relativeSource);
  const target = path.join(repoRoot, relativeTarget);

  if (!existsSync(source)) {
    throw new Error(`Template source does not exist: ${source}`);
  }

  assertInsideRepo(target);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { force: true });
  console.log(`Updated ${relativeTarget}`);
}

async function copyDirectoryFromTemplate(templateDir, relativeSource, relativeTarget) {
  const source = path.join(templateDir, relativeSource);
  const target = path.join(repoRoot, relativeTarget);

  if (!existsSync(source)) {
    throw new Error(`Template asset directory does not exist: ${source}`);
  }

  assertInsideRepo(target);
  await rm(target, { recursive: true, force: true });
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { recursive: true, force: true });
  console.log(`Updated ${relativeTarget}`);
}

async function updateContentVersion(contentVersion) {
  if (!contentVersion) return;

  const adminStorePath = path.join(repoRoot, "lib/server/admin-store.ts");
  const source = await readFile(adminStorePath, "utf8");
  const versionPattern = /const\s+currentTemplateContentVersion\s*=\s*"[^"]+";/;

  if (!versionPattern.test(source)) {
    throw new Error("Could not find currentTemplateContentVersion in lib/server/admin-store.ts");
  }

  const updated = source.replace(
    versionPattern,
    `const currentTemplateContentVersion = "${contentVersion}";`
  );

  if (source === updated) {
    console.log(`currentTemplateContentVersion already set to ${contentVersion}`);
    return;
  }

  await writeFile(adminStorePath, updated, "utf8");
  console.log(`Updated currentTemplateContentVersion to ${contentVersion}`);
}

if (!templateKey) {
  usage();
  process.exit(1);
}

const templateDir = resolveTemplateDir(templateKey);
const manifestPath = path.join(templateDir, "manifest.json");

if (!existsSync(manifestPath)) {
  console.error(`Template manifest not found: ${manifestPath}`);
  usage();
  process.exit(1);
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const paths = manifest.paths || {};

if (!paths.content || !paths.assets) {
  throw new Error("Template manifest must define paths.content and paths.assets.");
}

console.log(`Applying template ${manifest.key || templateKey} from ${templateDir}`);

await copyFileFromTemplate(templateDir, paths.content, "data/current-template-content.json");
await copyDirectoryFromTemplate(templateDir, paths.assets, "public/assets/current-template");

if (paths.activeTemplate) {
  await copyFileFromTemplate(templateDir, paths.activeTemplate, "components/templates/ActiveTemplate.tsx");
}

if (paths.styles) {
  await copyFileFromTemplate(templateDir, paths.styles, "styles/active-template.css");
}

await updateContentVersion(manifest.contentVersion);

console.log("Template applied. Run npm run typecheck and npm run build before committing.");
