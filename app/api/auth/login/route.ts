import { NextResponse } from "next/server";
import { setAdminSession, verifyAdminUserPassword } from "@/lib/server/auth";
import { readAdminState } from "@/lib/server/admin-store";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const state = await readAdminState();
  const user = state.users.find((item) => item.active && item.email.toLowerCase() === body.email?.trim().toLowerCase());

  if (!body.email || !body.password || !user || !verifyAdminUserPassword(user, body.password)) {
    return NextResponse.json({ error: "Invalid admin email or password." }, { status: 401 });
  }

  await setAdminSession(user.email);
  return NextResponse.json({ ok: true });
}
