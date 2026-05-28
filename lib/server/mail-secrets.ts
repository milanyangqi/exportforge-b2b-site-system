import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const secretPrefix = "enc:v1:";

function getSecretKey() {
  const source = process.env.MAIL_SETTINGS_SECRET
    || process.env.SESSION_SECRET
    || process.env.INITIAL_ADMIN_PASSWORD
    || "exportforge-local-mail-settings-secret";
  return createHash("sha256").update(source).digest();
}

export function isEncryptedMailSecret(value?: string) {
  return Boolean(value?.startsWith(secretPrefix));
}

export function encryptMailSecret(value?: string) {
  const plainText = value?.trim() ?? "";
  if (!plainText) return "";
  if (isEncryptedMailSecret(plainText)) return plainText;

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getSecretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${secretPrefix}${Buffer.concat([iv, tag, encrypted]).toString("base64url")}`;
}

export function decryptMailSecret(value?: string) {
  const encryptedValue = value?.trim() ?? "";
  if (!encryptedValue) return "";
  if (!isEncryptedMailSecret(encryptedValue)) return encryptedValue;

  try {
    const payload = Buffer.from(encryptedValue.slice(secretPrefix.length), "base64url");
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", getSecretKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}
