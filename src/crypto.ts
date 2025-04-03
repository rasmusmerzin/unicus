export interface Encrypted {
  iv: string;
  cipher: string;
}

export async function deriveKey(
  passcode: string,
  salt: string,
  iterations = 100000
) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passcode),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    128
  );
  return Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function encryptData(
  secretKey: string,
  data: string
): Promise<Encrypted> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
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
    iv: Array.from(iv).toString(),
    cipher: new Uint8Array(encrypted).join(","),
  };
}

export async function decryptData(
  secretKey: string,
  encryptedData: Encrypted
): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(encryptedData.iv.split(",").map(Number)),
    },
    key,
    new Uint8Array(encryptedData.cipher.split(",").map(Number))
  );
  return decoder.decode(decrypted);
}
