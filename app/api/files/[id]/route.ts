import { Buffer } from "node:buffer";
import { readStoredFile } from "@/lib/server/admin-store";

export const dynamic = "force-dynamic";

function encodeHeaderFilename(name: string) {
  return encodeURIComponent(name).replace(/['()]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const file = await readStoredFile(id);

  if (!file) {
    return new Response("File not found", { status: 404 });
  }

  return new Response(Buffer.from(file.base64, "base64"), {
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Length": String(file.size),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeHeaderFilename(file.name)}`,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
