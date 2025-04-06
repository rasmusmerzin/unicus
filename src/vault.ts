import { decryptData, deriveKey, encryptData, Encrypted } from "./crypto";
import { fingerprint } from "./fingerprint";
import { Subject } from "./Subject";

export interface Vault {
  entries?: VaultEntry[];
}

export type VaultEntry = VaultEntryExt & {
  uuid: string;
  name: string;
  issuer: string;
  secret: string;
  hash: "SHA1" | "SHA256" | "SHA512";
  digits: number;
};

export type VaultEntryExt =
  | { type: "TOTP"; period: number }
  | { type: "HOTP"; counter: number };

export const vault$ = new Subject<Vault | null>(null);
export const secret$ = new Subject<string | null>(null);

if (import.meta.env.DEV)
  vault$.subscribe(
    (vault) => Object.assign(globalThis, { vault }),
    new AbortController()
  );

export async function addVaultEntry(entry: VaultEntry) {
  if (!vault$.current()) throw new Error("Vault is not initialized");
  const current = vault$.current();
  const updated = { ...current };
  if (!updated.entries) updated.entries = [entry];
  else updated.entries = [...updated.entries, entry];
  try {
    vault$.next(updated);
    await saveVault();
  } catch (error) {
    vault$.next(current);
    throw error;
  }
}

export async function openVault(): Promise<Vault | null> {
  const encryptedVault = getEncryptedVault();
  const secret = secret$.current();
  if (!encryptedVault || !secret) return vault$.next(null);
  const vaultData = await decryptData(secret, encryptedVault);
  return vault$.next(JSON.parse(vaultData));
}

export function lockVault() {
  vault$.next(null);
  secret$.next(null);
}

export async function saveVault() {
  const vault = vault$.current();
  const secret = secret$.current();
  if (!secret) throw new Error("Secret key is not set");
  if (!vault) throw new Error("Vault is empty");
  const encryptedVault = await encryptData(secret, JSON.stringify(vault));
  setEncryptedVault(encryptedVault);
}

export async function openSecretWithFingerprint(): Promise<string | null> {
  const encryptedSecret = getFingerprintEncryptedSecret();
  if (!encryptedSecret) return null;
  const fingerprintData = await fingerprint();
  if (!fingerprintData) return null;
  const fingerprintKey = await deriveKey(fingerprintData);
  return secret$.next(await decryptData(fingerprintKey, encryptedSecret));
}

export async function saveSecretWithFingerprint() {
  const secret = secret$.current();
  if (!secret) throw new Error("Secret key is not set");
  const fingerprintData = await fingerprint();
  if (!fingerprintData) throw new Error("Fingerprint data is not available");
  const fingerprintKey = await deriveKey(fingerprintData);
  const encryptedSecret = await encryptData(fingerprintKey, secret);
  setFingerprintEncryptedSecret(encryptedSecret);
}

export function getEncryptedVault(): Encrypted | null {
  const data = localStorage.getItem("vault");
  return data ? JSON.parse(data) : null;
}

export function getFingerprintEncryptedSecret(): Encrypted | null {
  const data = localStorage.getItem("fingerprint");
  return data ? JSON.parse(data) : null;
}

export function removeFingerprintEncryptedSecret() {
  localStorage.removeItem("fingerprint");
}

function setEncryptedVault(vault: Encrypted) {
  localStorage.setItem("vault", JSON.stringify(vault));
}

function setFingerprintEncryptedSecret(secret: Encrypted) {
  localStorage.setItem("fingerprint", JSON.stringify(secret));
}
