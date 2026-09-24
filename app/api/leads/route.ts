import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { readAdminState, writeAdminState, writeStoredFile } from "@/lib/server/admin-store";
import type { LeadPayload } from "@/types/site";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedExtensions = new Set(["step", "stp", "stl", "3mf", "obj", "igs", "iges", "pdf", "zip"]);
const maxFileBytes = 8 * 1024 * 1024;
const maxRequestBytes = 12 * 1024 * 1024;
const field = (form: FormData, key: string) => String(form.get(key) ?? "").trim().slice(0, key === "message" ? 4000 : 300);

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxRequestBytes) return NextResponse.json({ error: "Request exceeds the 12 MB limit." }, { status: 413 });
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  const payload: LeadPayload = {
    fullName: field(form, "fullName"), company: field(form, "company"), productType: field(form, "productType"),
    quantity: field(form, "quantity"), email: field(form, "email"), whatsapp: field(form, "whatsapp"),
    destination: field(form, "destination"), workpieceMaterial: field(form, "workpieceMaterial"),
    message: field(form, "message"), locale: field(form, "locale") === "zh" ? "zh" : "en", sourcePath: field(form, "sourcePath")
  };
  if (!payload.fullName || !payload.productType || !payload.quantity || !payload.email || !emailPattern.test(payload.email)) {
    return NextResponse.json({ error: "Name, email, part and quantity are required." }, { status: 400 });
  }
  const cadFile = form.get("cadFile");
  let attachmentId: string | undefined;
  let attachmentName: string | undefined;
  if (cadFile instanceof File && cadFile.size > 0) {
    const extension = cadFile.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedExtensions.has(extension)) return NextResponse.json({ error: "Unsupported CAD file type." }, { status: 400 });
    if (cadFile.size > maxFileBytes) return NextResponse.json({ error: "CAD file exceeds 8 MB." }, { status: 413 });
    attachmentId = `rfq-${crypto.randomUUID()}`;
    attachmentName = cadFile.name.replace(/[\\/:*?"<>|]/g, "-").slice(0, 160) || `drawing.${extension}`;
    await writeStoredFile({ id: attachmentId, name: attachmentName, mimeType: "application/octet-stream", size: cadFile.size, base64: Buffer.from(await cadFile.arrayBuffer()).toString("base64"), createdAt: new Date().toISOString() });
  }
  const lead = { ...payload, attachmentId, attachmentName, id: crypto.randomUUID(), status: "new" as const, createdAt: new Date().toISOString() };
  const state = await readAdminState();
  await writeAdminState({ ...state, leads: [lead, ...state.leads] });
  return NextResponse.json({ ok: true, id: lead.id });
}
