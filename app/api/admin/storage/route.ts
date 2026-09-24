import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { readAdminState, sanitizeAdminState, writeAdminState } from "@/lib/server/admin-store";
import { calculateStorageUsage, setGlobalStorageQuota, withMediaWriteLock } from "@/lib/server/storage-quota";

export async function GET() {
  const sessionEmail = await getAdminSessionEmail();
  if (!sessionEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const state = await readAdminState();
  if (!state.users.some((user) => user.active && user.email.toLowerCase() === sessionEmail.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(calculateStorageUsage(state));
}

export async function PUT(request: Request) {
  const sessionEmail = await getAdminSessionEmail();
  if (!sessionEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { quotaBytes?: number | null };
  if (body.quotaBytes !== null && (typeof body.quotaBytes !== "number" || !Number.isSafeInteger(body.quotaBytes) || body.quotaBytes <= 0)) {
    return NextResponse.json({ error: "额度必须是正整数（字节），或选择不限额。" }, { status: 400 });
  }
  return withMediaWriteLock(async () => {
    const state = await readAdminState();
    const user = state.users.find((item) => item.email.toLowerCase() === sessionEmail.toLowerCase());
    if (!user?.active || user.role !== "super-admin") {
      return NextResponse.json({ error: "只有超级管理员可以设置全站存储额度。" }, { status: 403 });
    }
    await setGlobalStorageQuota(body.quotaBytes ?? null, calculateStorageUsage(state).mediaBytes);
    let savedState;
    try {
      savedState = await writeAdminState({ ...state, storageQuotaBytes: body.quotaBytes });
    } catch (error) {
      await setGlobalStorageQuota(state.storageQuotaBytes ?? null, calculateStorageUsage(state).mediaBytes);
      throw error;
    }
    return NextResponse.json({ state: sanitizeAdminState(savedState), usage: calculateStorageUsage(savedState) });
  });
}
