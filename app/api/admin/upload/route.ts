import {getMediaBucket,mediaPublicUrl} from "@/lib/server/r2-media";
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

  const state = await readAdminState();
  const user = state.users.find(u=>u.email.toLowerCase()===sessionEmail.toLowerCase());
  if(!user?.active || (user.role!=="super-admin" && !(user.allowedTabs??state.rolePermissions?.[user.role]?.allowedTabs??[]).includes("files"))) return NextResponse.json({error:"Forbidden"},{status:403});
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

  if(!["image/jpeg","image/png","image/webp","image/gif","application/pdf","text/plain"].includes(mimeType)) return NextResponse.json({error:"仅支持 JPG、PNG、WebP、GIF、PDF 和 TXT 文件"},{status:415});
  const bucket=await getMediaBucket();
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",arrayBuffer)),b=>b.toString(16).padStart(2,"0")).join("");
  const extension=({"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif","application/pdf":"pdf","text/plain":"txt"} as Record<string,string>)[mimeType];
  const storageKey=`uploads/${digest.slice(0,24)}-${id}.${extension}`;
  if(bucket) await bucket.put(storageKey,arrayBuffer,{httpMetadata:{contentType:mimeType,cacheControl:"public, max-age=31536000, immutable"}});
  else await writeStoredFile({
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
    url: bucket?mediaPublicUrl(storageKey):buildStoredFileUrl(id),
    storageKey: bucket?storageKey:id,
    storageProvider: bucket?"r2":"kv",
    createdAt,
    enabled: true
  };
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

  const state=await readAdminState();
  const user=state.users.find(u=>u.email.toLowerCase()===sessionEmail.toLowerCase());
  if(!user?.active || (user.role!=="super-admin" && !(user.allowedTabs??state.rolePermissions?.[user.role]?.allowedTabs??[]).includes("files"))) return NextResponse.json({error:"Forbidden"},{status:403});
  const file=state.uploadedFiles.find(f=>f.id===id);
  if(file?.storageProvider==="r2"&&file.storageKey){
    if(state.products.some(p=>p.imageUrl===file.url||p.thumbnailUrl===file.url||p.gallery?.some(im=>im.url===file.url)||p.shades?.some(im=>im.url===file.url))) return NextResponse.json({error:"图片正在被产品引用，请先解除关联"},{status:409});
    await (await getMediaBucket())?.delete(file.storageKey);
  } else await deleteStoredFile(id);
  const savedState = await writeAdminState({
    ...state,
    uploadedFiles: state.uploadedFiles.filter((file) => file.id !== id)
  });

  return NextResponse.json({ state: sanitizeAdminState(savedState) });
}
