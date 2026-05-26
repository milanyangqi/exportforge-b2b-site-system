import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { preserveUserPasswordHashes, readAdminState, readStoredFile, sanitizeAdminState, writeAdminState, writeStoredFile } from "@/lib/server/admin-store";
import type { AdminState, RoleKey } from "@/types/site";
import type { StoredUploadFile } from "@/lib/server/admin-store";

type BackupSectionKey = keyof Pick<AdminState, "products" | "pages" | "articles" | "leads" | "contactChannels" | "uploadedFiles" | "users" | "navigation" | "siteSettings" | "templateSettings" | "aiSettings" | "aiCreditSettings" | "aiUsageRecords" | "activeTheme" | "enabledLocales">;

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
  "users",
  "navigation",
  "siteSettings",
  "templateSettings",
  "aiSettings",
  "aiCreditSettings",
  "aiUsageRecords",
  "activeTheme",
  "enabledLocales"
]);
const superAdminOnlySections = new Set<BackupSectionKey>(["users", "aiSettings", "aiCreditSettings", "aiUsageRecords"]);

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
    partialState[section] = state[section] as never;
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
  const existingState = await readAdminState();
  const nextState: AdminState = { ...existingState };

  for (const section of sections) {
    if (backup.state[section] === undefined) continue;
    nextState[section] = backup.state[section] as never;
  }

  const stateWithSecrets = preserveUserPasswordHashes(nextState, existingState);
  let importedFileCount = 0;

  if (includeFiles && sections.includes("uploadedFiles") && Array.isArray(backup.files)) {
    for (const file of backup.files) {
      if (!file?.id || !file.base64) continue;
      await writeStoredFile(file);
      importedFileCount += 1;
    }
  }

  const savedState = await writeAdminState(stateWithSecrets);
  return {
    state: sanitizeAdminState(savedState),
    importedSections: sections.filter((section) => backup.state[section] !== undefined),
    importedFileCount
  };
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
    return NextResponse.json(await importBackup(sections, Boolean(body.includeFiles), body.backup));
  }

  return NextResponse.json({ error: "Unsupported backup action." }, { status: 400 });
}
