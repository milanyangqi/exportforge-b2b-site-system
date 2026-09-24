import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { buildStoredFileUrl, deleteStoredFile, readAdminState, readStoredFile, sanitizeAdminState, writeAdminState, writeStoredFile } from "@/lib/server/admin-store";
import { StorageQuotaExceededError, withMediaWriteLock, withStorageMutationReservation } from "@/lib/server/storage-quota";
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

  return withMediaWriteLock(async () => {
    const state = await readAdminState();
    const user = state.users.find((item) => item.email.toLowerCase() === sessionEmail.toLowerCase());
    if (!user?.active) return NextResponse.json({ error: "当前账号不可用。" }, { status: 403 });
    const id = `file-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const name = sanitizeFileName(file.name);
    const mimeType = file.type || "application/octet-stream";
    const createdAt = new Date().toISOString();
    const uploadedFile: UploadedFile = {
      id, name, mimeType, size: file.size,
      url: buildStoredFileUrl(id), storageKey: id, createdAt, enabled: true
    };
    const nextState = { ...state, uploadedFiles: [uploadedFile, ...state.uploadedFiles] };
    try {
      return await withStorageMutationReservation(state, nextState, async () => {
        const arrayBuffer = await file.arrayBuffer();
        try {
          await writeStoredFile({ id, name, mimeType, size: file.size, base64: Buffer.from(arrayBuffer).toString("base64"), createdAt });
          const savedState = await writeAdminState(nextState);
          return NextResponse.json({ file: uploadedFile, state: sanitizeAdminState(savedState) });
        } catch (error) {
          await deleteStoredFile(id);
          throw error;
        }
      });
    } catch (error) {
      if (error instanceof StorageQuotaExceededError) return NextResponse.json({ error: error.message }, { status: 413 });
      throw error;
    }
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

  return withMediaWriteLock(async () => {
    const state = await readAdminState();
    const file = state.uploadedFiles.find((item) => item.id === id);
    if (!file || !file.storageKey) return NextResponse.json({ error: "只能删除已上传的媒体文件。" }, { status: 404 });
    const nextState = { ...state, uploadedFiles: state.uploadedFiles.filter((item) => item.id !== id) };
    return withStorageMutationReservation(state, nextState, async () => {
      const priorFile = await readStoredFile(file.storageKey!);
      await deleteStoredFile(file.storageKey!);
      try {
        const savedState = await writeAdminState(nextState);
        return NextResponse.json({ state: sanitizeAdminState(savedState) });
      } catch (error) {
        if (priorFile) await writeStoredFile(priorFile);
        throw error;
      }
    });
  });
}
