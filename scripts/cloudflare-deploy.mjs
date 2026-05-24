#!/usr/bin/env node
import { parseArgs, run } from "./cloudflare-helpers.mjs";

const options = parseArgs(process.argv.slice(2));
const config = options.config || "wrangler.jsonc";
const skipGitCheck = Boolean(options.skipGitCheck);

function output(command, args) {
  return run(command, args, { stdio: ["ignore", "pipe", "pipe"] }).stdout.trim();
}

if (!skipGitCheck) {
  const status = output("git", ["status", "--short"]);
  if (status) {
    console.error("Git working tree is dirty. Commit and push before deploying, or use --skip-git-check for a test deployment.");
    console.error(status);
    process.exit(1);
  }

  const branch = output("git", ["branch", "--show-current"]);
  const upstream = output("git", ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
  const localHead = output("git", ["rev-parse", branch]);
  const upstreamHead = output("git", ["rev-parse", upstream]);

  if (localHead !== upstreamHead) {
    console.error(`Local ${branch} is not synced with ${upstream}. Push before deploying.`);
    process.exit(1);
  }
}

run("npm", ["install"]);
run("npm", ["run", "typecheck"]);
run("npm", ["run", "build"]);

run("npx", ["opennextjs-cloudflare", "build"]);
run("npx", ["opennextjs-cloudflare", "deploy", "--config", config]);
