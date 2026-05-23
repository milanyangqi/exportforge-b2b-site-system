import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { preserveUserPasswordHashes, readAdminState, sanitizeAdminState, writeAdminState } from "@/lib/server/admin-store";
import type { AdminState } from "@/types/site";

export async function GET() {
  if (!await getAdminSessionEmail()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(sanitizeAdminState(await readAdminState()));
}

export async function PUT(request: Request) {
  if (!await getAdminSessionEmail()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = (await request.json()) as AdminState;
  const existingState = await readAdminState();
  const nextState = preserveUserPasswordHashes(state, existingState);
  return NextResponse.json(sanitizeAdminState(await writeAdminState(nextState)));
}
