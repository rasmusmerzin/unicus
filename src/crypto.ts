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
  return bufferToBase64(derivedBits);
}

export async function encryptData(
  secretKey: string,
  data: string
): Promise<Encrypted> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    "raw",
    await base64ToBuffer(secretKey),
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
    iv: await bufferToBase64(iv),
    cipher: await bufferToBase64(encrypted),
  };
}

export async function decryptData(
  secretKey: string,
  encryptedData: Encrypted
): Promise<string> {
  const decoder = new TextDecoder();
  const key = await crypto.subtle.importKey(
    "raw",
    await base64ToBuffer(secretKey),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: await base64ToBuffer(encryptedData.iv),
    },
    key,
    await base64ToBuffer(encryptedData.cipher)
  );
  return decoder.decode(decrypted);
}

export async function bufferToBase64(buffer: ArrayBuffer): Promise<string> {
  const base64Url = await blobToBase64Url(new Blob([buffer]));
  return base64Url.slice(base64Url.indexOf(",") + 1);
}

export async function base64ToBuffer(base64: string): Promise<ArrayBuffer> {
  const base64Url = `data:application/octet-stream;base64,${base64}`;
  const response = await fetch(base64Url);
  return response.arrayBuffer();
}

const blobToBase64Url = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
