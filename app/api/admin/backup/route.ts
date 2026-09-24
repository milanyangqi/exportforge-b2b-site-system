import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { deleteStoredFile, preserveUserPasswordHashes, readAdminState, readStoredFile, sanitizeAdminState, sanitizeSiteSettingsSecrets, writeAdminState, writeStoredFile } from "@/lib/server/admin-store";
import { calculateStorageUsage, setGlobalStorageQuota, StorageQuotaExceededError, withMediaWriteLock, withStorageMutationReservation } from "@/lib/server/storage-quota";
import type { AdminState, RoleKey } from "@/types/site";
import type { StoredUploadFile } from "@/lib/server/admin-store";

type BackupSectionKey = keyof Pick<AdminState, "products" | "pages" | "articles" | "leads" | "contactChannels" | "uploadedFiles" | "storageQuotaBytes" | "users" | "rolePermissions" | "navigation" | "siteSettings" | "templateSettings" | "pageLayouts" | "aiSettings" | "aiCreditSettings" | "aiUsageRecords" | "activeTheme" | "enabledLocales">;

type BackupPayload = {
  format: "exportforge-site-backup";
  version: 1;
  createdAt: string;
  sections: BackupSectionKey[];
  state: Partial<AdminState>;
  files?: StoredUploadFile[];
};

type BackupRequest = {
  action?: "export" | "import";
  sections?: string[];
  includeFiles?: boolean;
  backup?: BackupPayload;
};

const adminRoles = new Set<RoleKey>(["super-admin", "admin"]);
const sectionKeys = new Set<BackupSectionKey>([
  "products",
  "pages",
  "articles",
  "leads",
  "contactChannels",
  "uploadedFiles",
  "storageQuotaBytes",
  "users",
  "rolePermissions",
  "navigation",
  "siteSettings",
  "templateSettings",
  "pageLayouts",
  "aiSettings",
  "aiCreditSettings",
  "aiUsageRecords",
  "activeTheme",
  "enabledLocales"
]);
const superAdminOnlySections = new Set<BackupSectionKey>(["users", "rolePermissions", "aiSettings", "aiCreditSettings", "aiUsageRecords", "storageQuotaBytes"]);

function parseSections(sections?: string[]) {
  return (sections ?? []).filter((section): section is BackupSectionKey => sectionKeys.has(section as BackupSectionKey));
}

function isBackupPayload(value: unknown): value is BackupPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as BackupPayload;
  return payload.format === "exportforge-site-backup"
    && payload.version === 1
    && payload.state !== null
    && typeof payload.state === "object";
}

function ensureSectionPermission(sections: BackupSectionKey[], role?: RoleKey) {
  if (role === "super-admin") return null;
  const restricted = sections.filter((section) => superAdminOnlySections.has(section));
  if (restricted.length) {
    return "用户、AI 配置、积分和消耗记录只能由 Super Admin 导入导出。";
  }
  if (!adminRoles.has(role ?? "viewer")) {
    return "只有管理员可以导入导出整站数据。";
  }
  return null;
}

async function exportBackup(sections: BackupSectionKey[], includeFiles: boolean) {
  const state = await readAdminState();
  const partialState: Partial<AdminState> = {};

  for (const section of sections) {
    partialState[section] = (section === "siteSettings" ? sanitizeSiteSettingsSecrets(state.siteSettings) : state[section]) as never;
  }

  const files: StoredUploadFile[] = [];
  if (includeFiles && sections.includes("uploadedFiles")) {
    for (const file of state.uploadedFiles) {
      const storageId = file.storageKey || file.id;
      const storedFile = storageId ? await readStoredFile(storageId) : null;
      if (storedFile) files.push(storedFile);
    }
  }

  return {
    format: "exportforge-site-backup",
    version: 1,
    createdAt: new Date().toISOString(),
    sections,
    state: partialState,
    files: files.length ? files : undefined
  } satisfies BackupPayload;
}

async function importBackup(sections: BackupSectionKey[], includeFiles: boolean, backup: BackupPayload) {
  return withMediaWriteLock(async () => {
    const existingState = await readAdminState();
    const nextState: AdminState = { ...existingState };

    for (const section of sections) {
      if (backup.state[section] === undefined) continue;
      nextState[section] = backup.state[section] as never;
    }

    if (sections.includes("storageQuotaBytes") && backup.state.storageQuotaBytes !== undefined) {
      const quota = backup.state.storageQuotaBytes;
      if (quota !== null && (typeof quota !== "number" || !Number.isSafeInteger(quota) || quota <= 0)) {
        throw new Error("备份中的存储额度无效。");
      }
    }

    const stateWithSecrets = preserveUserPasswordHashes(nextState, existingState);
    const files = includeFiles && sections.includes("uploadedFiles") && Array.isArray(backup.files) ? backup.files : [];
    const importedFiles = new Map(files.map((file) => [file.id, file]));
    if (sections.includes("uploadedFiles")) {
      for (const record of stateWithSecrets.uploadedFiles) {
        if (!record.storageKey && !record.url.startsWith("/api/files/")) continue;
        const key = record.storageKey || record.id;
        const stored = importedFiles.get(key) ?? await readStoredFile(key);
        if (!stored || stored.size !== record.size) {
          throw new Error("备份中的媒体记录缺少对应文件，导入已取消。");
        }
      }
    }
    for (const file of files) {
      const record = stateWithSecrets.uploadedFiles.find((item) => item.storageKey === file.id);
      if (!record || !file.base64 || file.size !== record.size || record.size !== Buffer.byteLength(file.base64, "base64")) {
        throw new Error("备份中的媒体文件与媒体记录不一致，导入已取消。");
      }
    }
    const priorFiles = new Map<string, StoredUploadFile | null>();
    const reservationState = { ...stateWithSecrets, storageQuotaBytes: existingState.storageQuotaBytes };
    return withStorageMutationReservation(existingState, reservationState, async () => {
      let stateWritten = false;
      try {
        for (const file of files) {
          priorFiles.set(file.id, await readStoredFile(file.id));
          await writeStoredFile(file);
        }
        const savedState = await writeAdminState(stateWithSecrets);
        stateWritten = true;
        if (sections.includes("storageQuotaBytes")) {
          await setGlobalStorageQuota(savedState.storageQuotaBytes ?? null, calculateStorageUsage(existingState).mediaBytes);
        }
        return {
          state: sanitizeAdminState(savedState),
          importedSections: sections.filter((section) => backup.state[section] !== undefined),
          importedFileCount: files.length
        };
      } catch (error) {
        if (stateWritten) await writeAdminState(existingState);
        for (const [id, prior] of priorFiles) {
          if (prior) await writeStoredFile(prior);
          else await deleteStoredFile(id);
        }
        throw error;
      }
    });
  });
}

export async function POST(request: Request) {
  const sessionEmail = await getAdminSessionEmail();

  if (!sessionEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await readAdminState();
  const currentUser = state.users.find((user) => user.email.toLowerCase() === sessionEmail.toLowerCase());
  const body = (await request.json()) as BackupRequest;
  const sections = parseSections(body.sections);

  if (!sections.length) {
    return NextResponse.json({ error: "请至少选择一个数据模块。" }, { status: 400 });
  }

  const permissionError = ensureSectionPermission(sections, currentUser?.role);
  if (permissionError) {
    return NextResponse.json({ error: permissionError }, { status: 403 });
  }

  if (body.action === "export") {
    return NextResponse.json(await exportBackup(sections, Boolean(body.includeFiles)));
  }

  if (body.action === "import") {
    if (!isBackupPayload(body.backup)) {
      return NextResponse.json({ error: "备份文件格式不正确。" }, { status: 400 });
    }
    try {
      return NextResponse.json(await importBackup(sections, Boolean(body.includeFiles), body.backup));
    } catch (error) {
      const message = error instanceof Error ? error.message : "备份导入失败。";
      return NextResponse.json({ error: message }, { status: error instanceof StorageQuotaExceededError ? 413 : 400 });
    }
  }

  return NextResponse.json({ error: "Unsupported backup action." }, { status: 400 });
}
