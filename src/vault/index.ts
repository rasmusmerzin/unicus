import { OtpAlgorithm } from "@merzin/otp";
import { Subject } from "../Subject";
import { decryptData, deriveKey, encryptData, Encrypted } from "../crypto";
import { fingerprint } from "../fingerprint";
import { createAuditEntry } from "../audit";

export * from "./accept";
export * from "./entry";
export * from "./file";
export * from "./import";

export interface Vault {
  entries?: VaultEntry[];
}

export type VaultEntry = VaultEntryExt & {
  uuid: string;
  name: string;
  issuer: string;
  secret: string;
  algorithm: OtpAlgorithm;
  digits: number;
};

export type VaultEntryExt =
  | { type: "TOTP"; period: number }
  | { type: "HOTP"; counter: number };

export interface UpsertResult {
  overwriten: { current: VaultEntry; previous: VaultEntry }[];
  created: VaultEntry[];
  skipped: VaultEntry[];
}

export const vault$ = new Subject<Vault | null>(null);
export const secret$ = new Subject<string | null>(null);

if (import.meta.env.DEV) Object.assign(globalThis, { vault$, secret$ });

export function getVaultEntry(uuid: string): VaultEntry | null {
  const vault = vault$.current();
  return vault?.entries?.find((entry) => entry.uuid === uuid) || null;
}

export async function moveVaultEntry(originIndex: number, targetIndex: number) {
  if (originIndex === targetIndex) return;
  const current = vault$.current();
  if (!current) throw new Error("Vault is not initialized");
  const updated: Vault = JSON.parse(JSON.stringify(current));
  const { entries } = updated;
  const [entry] = entries!.splice(originIndex, 1);
  entries!.splice(targetIndex, 0, entry);
  try {
    vault$.next(updated);
    await saveVault();
  } catch (error) {
    vault$.next(current);
    throw error;
  }
}

export async function updateVaultEntry(entry: VaultEntry): Promise<boolean> {
  const current = vault$.current();
  if (!current) throw new Error("Vault is not initialized");
  const updated: Vault = JSON.parse(JSON.stringify(current));
  if (!updated.entries) return false;
  const existingIndex = updated.entries.findIndex((e) => e.uuid == entry.uuid);
  if (existingIndex < 0) return false;
  const previous = updated.entries[existingIndex];
  if (previous.secret !== entry.secret) entry.uuid = crypto.randomUUID();
  updated.entries[existingIndex] = entry;
  try {
    vault$.next(updated);
    await saveVault();
    return true;
  } catch (error) {
    vault$.next(current);
    throw error;
  }
}

export async function upsertVaultEntries(
  ...entries: VaultEntry[]
): Promise<UpsertResult> {
  const result: UpsertResult = {
    overwriten: [],
    created: [],
    skipped: [],
  };
  const current = vault$.current();
  if (!current) throw new Error("Vault is not initialized");
  const updated: Vault = JSON.parse(JSON.stringify(current));
  if (!updated.entries) result.created = updated.entries = [...entries];
  else {
    for (const entry of entries) {
      const existingIndex = updated.entries.findIndex(
        (e) => e.uuid == entry.uuid
      );
      if (existingIndex < 0) {
        const alike = getVaultEntryLike(entry);
        if (alike) result.skipped.push(entry);
        else {
          updated.entries.push(entry);
          result.created.push(entry);
        }
      } else {
        const previous = updated.entries[existingIndex];
        if (JSON.stringify(previous) === JSON.stringify(entry))
          result.skipped.push(entry);
        else {
          if (previous.secret !== entry.secret)
            entry.uuid = crypto.randomUUID();
          updated.entries[existingIndex] = entry;
          result.overwriten.push({ current: entry, previous });
        }
      }
    }
  }
  const modified = [
    ...result.created,
    ...result.overwriten.map(({ current }) => current),
  ].map(({ name, issuer }) => ({ name, issuer }));
  try {
    vault$.next(updated);
    await saveVault();
    if (modified.length)
      await createAuditEntry({ type: "import", entries: modified });
  } catch (error) {
    vault$.next(current);
    throw error;
  }
  return result;
}

export function getVaultEntryLike(
  entry: Omit<VaultEntry, "uuid">
): VaultEntry | null {
  const serialized = JSON.stringify({ ...entry, uuid: undefined });
  return (
    vault$
      .current()
      ?.entries?.find(
        (e) => serialized === JSON.stringify({ ...e, uuid: undefined })
      ) || null
  );
}

export async function deleteVaultEntry(...uuids: string[]) {
  if (!vault$.current()) throw new Error("Vault is not initialized");
  const current = vault$.current();
  const updated: Vault = JSON.parse(JSON.stringify(current));
  if (!updated.entries) return;
  const deleted = updated.entries
    .filter((entry) => uuids.includes(entry.uuid))
    .map(({ name, issuer }) => ({ name, issuer }));
  updated.entries = updated.entries.filter(
    (entry) => !uuids.includes(entry.uuid)
  );
  try {
    vault$.next(updated);
    await saveVault();
    if (deleted.length)
      await createAuditEntry({ type: "remove", entries: deleted });
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

export async function exportToFile(encrypted: boolean) {
  const fileName =
    "unicus-export-" +
    (encrypted ? "" : "plain-") +
    new Date()
      .toISOString()
      .substring(0, 19)
      .replace(/[-:]/g, "")
      .replace("T", "-") +
    ".json";
  const obj = encrypted ? getEncryptedVault() : vault$.current();
  if (!obj) throw new Error("Couldn't access vault");
  const dataUrl =
    "data:application/json," +
    (encrypted ? JSON.stringify(obj) : JSON.stringify(obj, null, 2));
  createElement("a", { href: dataUrl, download: fileName }).click();
  createAuditEntry({
    type: "export",
    entries: vault$.current()?.entries?.map(({ name, issuer }) => ({
      name,
      issuer,
    }))!,
  });
}

export function clearVault() {
  lockVault();
  localStorage.removeItem("vault");
  localStorage.removeItem("fingerprint");
}

function setEncryptedVault(vault: Encrypted) {
  localStorage.setItem("vault", JSON.stringify(vault));
}

function setFingerprintEncryptedSecret(secret: Encrypted) {
  localStorage.setItem("fingerprint", JSON.stringify(secret));
}
