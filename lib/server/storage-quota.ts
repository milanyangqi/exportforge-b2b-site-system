import type { AdminState, UploadedFile } from "@/types/site";

export type StorageUsage = {
  siteDataBytes: number;
  mediaBytes: number;
  usedBytes: number;
  quotaBytes: number | null;
  remainingBytes: number | null;
  percentUsed: number | null;
  exceeded: boolean;
};

function isStoredMedia(file: UploadedFile) {
  return Boolean(file.storageKey || file.url.startsWith("/api/files/"));
}

export function calculateStorageUsage(state: AdminState): StorageUsage {
  const siteDataBytes = new TextEncoder().encode(JSON.stringify(state, null, 2)).byteLength;
  const seenKeys = new Set<string>();
  const mediaBytes = state.uploadedFiles.reduce((total, file) => {
    if (!isStoredMedia(file)) return total;
    const key = file.storageKey ?? file.url;
    if (seenKeys.has(key)) return total;
    seenKeys.add(key);
    return total + (Number.isFinite(file.size) ? Math.max(0, file.size) : 0);
  }, 0);
  const usedBytes = siteDataBytes + mediaBytes;
  const quotaBytes = typeof state.storageQuotaBytes === "number" && state.storageQuotaBytes > 0 ? state.storageQuotaBytes : null;
  return {
    siteDataBytes,
    mediaBytes,
    usedBytes,
    quotaBytes,
    remainingBytes: quotaBytes === null ? null : Math.max(0, quotaBytes - usedBytes),
    percentUsed: quotaBytes === null ? null : Math.round((usedBytes / quotaBytes) * 1000) / 10,
    exceeded: quotaBytes !== null && usedBytes > quotaBytes
  };
}

export class StorageQuotaExceededError extends Error {
  constructor() {
    super("存储空间不足。请删除媒体文件或联系超级管理员提高全站额度。");
    this.name = "StorageQuotaExceededError";
  }
}

type CoordinatorStub = { fetch(request: Request | string, init?: RequestInit): Promise<Response> };
type CoordinatorNamespace = { idFromName(name: string): unknown; get(id: unknown): CoordinatorStub };

async function getCoordinator(): Promise<CoordinatorStub | null> {
  if (process.env.EXPORTFORGE_SELF_HOST === "1") return null;
  let context: { env?: { STORAGE_QUOTA_COORDINATOR?: CoordinatorNamespace; EXPORTFORGE_KV?: unknown } };
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    context = await getCloudflareContext({ async: true }) as typeof context;
  } catch {
    return null;
  }
  const namespace = context.env?.STORAGE_QUOTA_COORDINATOR;
  if (!namespace && context.env?.EXPORTFORGE_KV) throw new Error("Cloudflare 存储协调绑定缺失，已停止媒体写入。");
  return namespace ? namespace.get(namespace.idFromName("exportforge-site-storage")) : null;
}

async function callCoordinator(stub: CoordinatorStub, action: string, payload: Record<string, unknown>) {
  const response = await stub.fetch("https://storage-quota.internal" + action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json() as { token?: string; error?: string };
  if (!response.ok) {
    if (response.status === 413) throw new StorageQuotaExceededError();
    throw new Error(result.error || "全站存储协调服务不可用。");
  }
  return result;
}

export async function withStorageMutationReservation<T>(before: AdminState, after: AdminState, callback: () => Promise<T>): Promise<T> {
  const priorKeys = new Set(before.uploadedFiles.filter(isStoredMedia).map((file) => file.storageKey ?? file.url));
  const addsMedia = after.uploadedFiles.some((file) => isStoredMedia(file) && !priorKeys.has(file.storageKey ?? file.url));
  const stub = await getCoordinator();
  if (!stub) {
    if (addsMedia || calculateStorageUsage(after).mediaBytes > calculateStorageUsage(before).mediaBytes) assertMediaCapacity(after);
    return callback();
  }
  const current = calculateStorageUsage(before);
  const proposed = calculateStorageUsage(after);
  const { token } = await callCoordinator(stub, "/reserve", {
    mediaBytes: current.mediaBytes,
    siteDataBytes: proposed.siteDataBytes,
    deltaBytes: proposed.mediaBytes - current.mediaBytes,
    addsMedia,
    quotaBytes: current.quotaBytes
  });
  if (!token) throw new Error("存储空间预留失败。");
  let completed = false;
  try {
    const result = await callback();
    completed = true;
    // A successful KV write must not be rolled back just because confirmation
    // fails. The next reservation reconciles its baseline from current state.
    await callCoordinator(stub, "/complete", { token }).catch(() => undefined);
    return result;
  } finally {
    if (!completed) await callCoordinator(stub, "/cancel", { token }).catch(() => undefined);
  }
}

export async function setGlobalStorageQuota(quotaBytes: number | null, mediaBytes: number) {
  const stub = await getCoordinator();
  if (stub) await callCoordinator(stub, "/limit", { quotaBytes, mediaBytes });
}

export function assertMediaCapacity(nextState: AdminState) {
  const usage = calculateStorageUsage(nextState);
  if (usage.quotaBytes !== null && usage.usedBytes > usage.quotaBytes) {
    throw new StorageQuotaExceededError();
  }
}

// Serializes media writes in the current server process, including local development.
let pendingWrite: Promise<void> = Promise.resolve();

export async function withMediaWriteLock<T>(callback: () => Promise<T>): Promise<T> {
  const previous = pendingWrite;
  let release: () => void = () => undefined;
  pendingWrite = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try {
    return await callback();
  } finally {
    release();
  }
}
