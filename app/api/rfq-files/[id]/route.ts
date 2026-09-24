import { Buffer } from "node:buffer";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { readAdminState, readStoredFile } from "@/lib/server/admin-store";

export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const email = await getAdminSessionEmail();
  if (!email) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const state = await readAdminState();
  if (!state.users.some((user) => user.active && user.email.toLowerCase() === email.toLowerCase())) return new Response("Forbidden", { status: 403 });
  if (!state.leads.some((lead) => lead.attachmentId === id)) return new Response("Not found", { status: 404 });
  const file = await readStoredFile(id);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(file.base64, "base64"), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
