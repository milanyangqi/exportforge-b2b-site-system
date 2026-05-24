import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const repoRoot = process.cwd();
export const defaultBinding = "EXPORTFORGE_KV";
export const bundledNode = "/Users/zhang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node";

export function parseArgs(argv) {
  const parsed = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      parsed._.push(token);
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split("=", 2);
    const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

    if (inlineValue !== undefined) {
      parsed[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

export function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
}

export function safeKeyFilename(key) {
  return Buffer.from(key).toString("base64url");
}

export function keyTargetArgs(options = {}) {
  const args = [];

  if (options.config) args.push("--config", options.config);
  if (options.namespaceId) {
    args.push("--namespace-id", options.namespaceId);
  } else {
    args.push("--binding", options.binding || defaultBinding);
  }

  if (options.local) {
    args.push("--local");
  } else {
    args.push("--remote");
  }

  return args;
}

export function runtimeEnv(extra = {}) {
  const nodeBinDir = path.dirname(bundledNode);
  const pathValue = existsSync(bundledNode)
    ? `${nodeBinDir}:${process.env.PATH || ""}`
    : process.env.PATH || "";

  return {
    ...process.env,
    PATH: pathValue,
    ...extra
  };
}

export function run(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || repoRoot,
    env: runtimeEnv(options.env),
    encoding: options.encoding || "utf8",
    maxBuffer: options.maxBuffer || 1024 * 1024 * 200,
    stdio: options.stdio || "inherit"
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with ${result.status}`);
  }

  return result;
}

export function runOutput(command, args = [], options = {}) {
  return run(command, args, {
    ...options,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

export function runNodeScript(scriptPath, args = [], options = {}) {
  const nodeCommand = existsSync(bundledNode) ? bundledNode : process.execPath;
  return run(nodeCommand, [scriptPath, ...args], options);
}

export function runWrangler(args = [], options = {}) {
  const wranglerBin = path.join(repoRoot, "node_modules", "wrangler", "bin", "wrangler.js");
  const nodeCommand = existsSync(bundledNode) ? bundledNode : process.execPath;
  return run(nodeCommand, [wranglerBin, ...args], options);
}

export function wranglerOutput(args = [], options = {}) {
  const wranglerBin = path.join(repoRoot, "node_modules", "wrangler", "bin", "wrangler.js");
  const nodeCommand = existsSync(bundledNode) ? bundledNode : process.execPath;
  return runOutput(nodeCommand, [wranglerBin, ...args], options);
}

export function parseJsonArrayFromOutput(output) {
  const start = output.indexOf("[");
  const end = output.lastIndexOf("]");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("Wrangler output did not contain a JSON array.");
  }

  return JSON.parse(output.slice(start, end + 1));
}
