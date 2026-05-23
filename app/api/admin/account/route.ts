import { NextResponse } from "next/server";
import { getAdminSessionEmail, hashPassword, setAdminSession, verifyAdminUserPassword } from "@/lib/server/auth";
import { readAdminState, sanitizeAdminState, writeAdminState } from "@/lib/server/admin-store";
import type { AdminUser } from "@/types/site";

type AccountPayload = {
  user?: Pick<AdminUser, "name" | "email" | "jobTitle" | "phone" | "avatarUrl">;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export async function PUT(request: Request) {
  const sessionEmail = await getAdminSessionEmail();
  if (!sessionEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as AccountPayload;
  const state = await readAdminState();
  const currentUser = state.users.find((user) => user.email.toLowerCase() === sessionEmail.toLowerCase()) ?? state.users[0];
  if (!currentUser) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const nextEmail = body.user?.email?.trim() || currentUser.email;
  const emailChanged = nextEmail.toLowerCase() !== currentUser.email.toLowerCase();
  const wantsPasswordChange = Boolean(body.newPassword || body.confirmPassword);

  if (emailChanged || wantsPasswordChange) {
    if (!body.currentPassword || !verifyAdminUserPassword(currentUser, body.currentPassword)) {
      return NextResponse.json({ error: "当前密码不正确。" }, { status: 400 });
    }
  }

  if (wantsPasswordChange) {
    if (body.newPassword !== body.confirmPassword) {
      return NextResponse.json({ error: "两次输入的新密码不一致。" }, { status: 400 });
    }
    if (!body.newPassword || body.newPassword.length < 8) {
      return NextResponse.json({ error: "新密码至少需要 8 位。" }, { status: 400 });
    }
  }

  const emailUsed = state.users.some((user) => user.id !== currentUser.id && user.email.toLowerCase() === nextEmail.toLowerCase());
  if (emailUsed) {
    return NextResponse.json({ error: "这个邮箱已经被其他用户使用。" }, { status: 400 });
  }

  const nextUser: AdminUser = {
    ...currentUser,
    name: body.user?.name?.trim() || currentUser.name,
    email: nextEmail,
    jobTitle: body.user?.jobTitle ?? "",
    phone: body.user?.phone ?? "",
    avatarUrl: body.user?.avatarUrl
  };

  if (wantsPasswordChange && body.newPassword) {
    nextUser.passwordHash = hashPassword(body.newPassword);
  } else if (emailChanged && body.currentPassword && !nextUser.passwordHash) {
    nextUser.passwordHash = hashPassword(body.currentPassword);
  }

  const nextState = {
    ...state,
    users: state.users.map((user) => (user.id === currentUser.id ? nextUser : user))
  };
  const savedState = await writeAdminState(nextState);

  await setAdminSession(nextUser.email);
  return NextResponse.json({
    state: sanitizeAdminState(savedState),
    user: sanitizeAdminState(savedState).users.find((user) => user.id === nextUser.id)
  });
}
