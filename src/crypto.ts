import { base64 } from "rfc4648";

export interface Encrypted {
  iv: string;
  cipher: string;
}

export async function deriveKey(
  passcode: string,
  salt = "",
  {
    iterations = 100000,
    bytes = 256,
  }: {
    iterations?: number;
    bytes?: 128 | 256;
  } = {}
): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passcode),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations, hash: "SHA-256" },
    keyMaterial,
    bytes
  );
  return base64.stringify(new Uint8Array(derivedBits));
}

export async function encryptData(
  secretKey: string,
  data: string
): Promise<Encrypted> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    "raw",
    base64.parse(secretKey),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(data)
  );
  return {
    iv: base64.stringify(iv),
    cipher: base64.stringify(new Uint8Array(encrypted)),
  };
}

export async function decryptData(
  secretKey: string,
  encryptedData: Encrypted
): Promise<string> {
  const decoder = new TextDecoder();
  const key = await crypto.subtle.importKey(
    "raw",
    base64.parse(secretKey),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64.parse(encryptedData.iv),
    },
    key,
    base64.parse(encryptedData.cipher)
  );
  return decoder.decode(decrypted);
}
