import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { buildStoredFileUrl, deleteStoredFile, readAdminState, sanitizeAdminState, writeAdminState, writeStoredFile } from "@/lib/server/admin-store";
import type { UploadedFile } from "@/types/site";

const maxUploadSize = 8 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "-").trim() || "upload.bin";
}

export async function POST(request: Request) {
  const sessionEmail = await getAdminSessionEmail();

  if (!sessionEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请选择要上传的文件。" }, { status: 400 });
  }

  if (file.size > maxUploadSize) {
    return NextResponse.json({ error: "文件不能超过 8MB。后续可接入 R2/S3 扩展大文件存储。" }, { status: 413 });
  }

  const id = `file-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const name = sanitizeFileName(file.name);
  const mimeType = file.type || "application/octet-stream";
  const arrayBuffer = await file.arrayBuffer();
  const createdAt = new Date().toISOString();

  await writeStoredFile({
    id,
    name,
    mimeType,
    size: file.size,
    base64: Buffer.from(arrayBuffer).toString("base64"),
    createdAt
  });

  const uploadedFile: UploadedFile = {
    id,
    name,
    mimeType,
    size: file.size,
    url: buildStoredFileUrl(id),
    storageKey: id,
    createdAt,
    enabled: true
  };
  const state = await readAdminState();
  const savedState = await writeAdminState({
    ...state,
    uploadedFiles: [uploadedFile, ...state.uploadedFiles]
  });

  return NextResponse.json({
    file: uploadedFile,
    state: sanitizeAdminState(savedState)
  });
}

export async function DELETE(request: Request) {
  const sessionEmail = await getAdminSessionEmail();

  if (!sessionEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing file id." }, { status: 400 });
  }

  await deleteStoredFile(id);
  const state = await readAdminState();
  const savedState = await writeAdminState({
    ...state,
    uploadedFiles: state.uploadedFiles.filter((file) => file.id !== id)
  });

  return NextResponse.json({ state: sanitizeAdminState(savedState) });
}
