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
  hash: "SHA1";
  digits: number;
};

export type VaultEntryExt =
  | { type: "TOTP"; period: number }
  | { type: "HOTP"; counter: number };

export type SourceType = "unicus" | "aegis";

export interface ImportResult {
  accepted: VaultEntry[];
  rejected: any[];
}

export const vault$ = new Subject<Vault | null>(null);
export const secret$ = new Subject<string | null>(null);

if (import.meta.env.DEV)
  vault$.subscribe(
    (vault) => Object.assign(globalThis, { vault }),
    new AbortController()
  );

export async function importEntries(
  sourceType: SourceType,
  source: File
): Promise<ImportResult> {
  const accepted = <VaultEntry[]>[];
  const rejected = <any[]>[];
  const data = await source.text();
  const obj = JSON.parse(data);
  if (sourceType === "aegis") {
    const { db } = obj;
    if (typeof db === "string")
      throw new Error("Encrypted Aegis file is not supported");
    const { entries } = db;
    for (const entry of entries) {
      const uuid =
        typeof entry.uuid === "string" ? entry.uuid : crypto.randomUUID();
      const name = typeof entry.name === "string" ? entry.name : "";
      const issuer = typeof entry.issuer === "string" ? entry.issuer : "";
      const secret =
        typeof entry.info?.secret === "string" ? entry.info.secret : "";
      const hash =
        typeof entry.info?.algo === "string"
          ? entry.info.algo.toUpperCase().replace(/-/g, "")
          : "";
      const digits =
        typeof entry.info?.digits === "number" ? entry.info.digits : 0;
      const type =
        typeof entry.type === "string" ? entry.type.toUpperCase() : "";
      const period =
        typeof entry.info?.period === "number" ? entry.info.period : undefined;
      const counter =
        typeof entry.info?.counter === "number"
          ? entry.info.counter
          : undefined;
      if (
        hash !== "SHA1" ||
        !["TOTP", "HOTP"].includes(type) ||
        !secret ||
        !digits
      ) {
        rejected.push(entry);
        continue;
      }
      if (type === "TOTP" && !period) {
        rejected.push(entry);
        continue;
      }
      if (type === "HOTP" && !counter) {
        rejected.push(entry);
        continue;
      }
      accepted.push({
        uuid,
        name,
        issuer,
        secret,
        hash,
        digits,
        type,
        period,
        counter,
      });
    }
  } else throw new Error("Unsupported source type");
  for (const entry of accepted) await upsertVaultEntry(entry);
  return { accepted, rejected };
}

export function getVaultEntry(uuid: string): VaultEntry | null {
  const vault = vault$.current();
  return vault?.entries?.find((entry) => entry.uuid === uuid) || null;
}

export async function upsertVaultEntry(entry: VaultEntry) {
  if (!vault$.current()) throw new Error("Vault is not initialized");
  const current = vault$.current();
  const updated: Vault = JSON.parse(JSON.stringify(current));
  if (!updated.entries) updated.entries = [entry];
  else {
    const existingIndex = updated.entries.findIndex(
      (e) => e.uuid == entry.uuid
    );
    if (existingIndex < 0) updated.entries.push(entry);
    else updated.entries[existingIndex] = entry;
  }
  try {
    vault$.next(updated);
    await saveVault();
  } catch (error) {
    vault$.next(current);
    throw error;
  }
}

export async function deleteVaultEntry(...uuids: string[]) {
  if (!vault$.current()) throw new Error("Vault is not initialized");
  const current = vault$.current();
  const updated: Vault = JSON.parse(JSON.stringify(current));
  if (!updated.entries) return;
  updated.entries = updated.entries.filter(
    (entry) => !uuids.includes(entry.uuid)
  );
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
