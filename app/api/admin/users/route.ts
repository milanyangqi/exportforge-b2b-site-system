import { NextResponse } from "next/server";
import { getAdminSessionEmail, hashPassword } from "@/lib/server/auth";
import { readAdminState, sanitizeAdminState, writeAdminState } from "@/lib/server/admin-store";
import type { AdminUser, RoleKey } from "@/types/site";

const userManagerRoles = new Set<RoleKey>(["super-admin", "admin"]);
const roleOptions = new Set<RoleKey>(["super-admin", "admin", "editor", "sales", "viewer"]);

type CreateUserPayload = {
  name?: string;
  email?: string;
  role?: RoleKey;
  password?: string;
  allowedTabs?: string[];
  aiCredits?: number;
  articleImportEnabled?: boolean;
};

type ResetPasswordPayload = {
  userId?: string;
  password?: string;
};

export async function POST(request: Request) {
  const sessionEmail = await getAdminSessionEmail();
  if (!sessionEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await readAdminState();
  const currentUser = state.users.find((user) => user.email.toLowerCase() === sessionEmail.toLowerCase());
  if (!userManagerRoles.has(currentUser?.role ?? "viewer")) {
    return NextResponse.json({ error: "只有管理员可以新增用户。" }, { status: 403 });
  }

  const body = (await request.json()) as CreateUserPayload;
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const role = body.role && roleOptions.has(body.role) ? body.role : "viewer";
  const aiCredits = Number(body.aiCredits ?? 0);

  if (!name || !email || !password) {
    return NextResponse.json({ error: "请填写姓名、邮箱和初始密码。" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "请输入有效邮箱。" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "初始密码至少需要 8 位。" }, { status: 400 });
  }
  if (state.users.some((user) => user.email.toLowerCase() === email)) {
    return NextResponse.json({ error: "这个邮箱已经存在。" }, { status: 400 });
  }

  const newUser: AdminUser = {
    id: `u-${Date.now()}`,
    name,
    email,
    role,
    active: true,
    aiCredits: Number.isFinite(aiCredits) && aiCredits > 0 ? aiCredits : 0,
    allowedTabs: Array.isArray(body.allowedTabs) ? body.allowedTabs : undefined,
    articleImportEnabled: typeof body.articleImportEnabled === "boolean" ? body.articleImportEnabled : role === "super-admin" || role === "admin",
    passwordHash: hashPassword(password)
  };
  const savedState = await writeAdminState({
    ...state,
    users: [...state.users, newUser]
  });

  return NextResponse.json({ state: sanitizeAdminState(savedState) });
}

export async function PATCH(request: Request) {
  const sessionEmail = await getAdminSessionEmail();
  if (!sessionEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await readAdminState();
  const currentUser = state.users.find((user) => user.email.toLowerCase() === sessionEmail.toLowerCase());
  if (currentUser?.role !== "super-admin") {
    return NextResponse.json({ error: "只有超级管理员可以重置用户密码。" }, { status: 403 });
  }

  const body = (await request.json()) as ResetPasswordPayload;
  const userId = body.userId?.trim() ?? "";
  const password = body.password ?? "";

  if (!userId || password.length < 8) {
    return NextResponse.json({ error: "请选择用户并输入至少 8 位新密码。" }, { status: 400 });
  }

  const targetUser = state.users.find((user) => user.id === userId);
  if (!targetUser) {
    return NextResponse.json({ error: "用户不存在。" }, { status: 404 });
  }

  const savedState = await writeAdminState({
    ...state,
    users: state.users.map((user) => (
      user.id === userId
        ? { ...user, passwordHash: hashPassword(password) }
        : user
    ))
  });

  return NextResponse.json({ state: sanitizeAdminState(savedState) });
}
