import { decryptData, deriveKey, encryptData, Encrypted } from "./crypto";
import { fingerprint } from "./fingerprint";

export interface Vault {
  entries?: VaultEntry[];
}

export type VaultEntry = VaultEntryHead &
  (VaultEntryTotpData | VaultEntryHotpData);

export interface VaultEntryHead {
  uuid: string;
  name: string;
  issuer: string;
}

export interface VaultEntryTotpData {
  type: "totp";
  secret: string;
  digits: number;
  period: number;
}

export interface VaultEntryHotpData {
  type: "hotp";
  secret: string;
  digits: number;
  counter: number;
}

export const vaultCell: Cell<Vault | null> = { value: null };
export const secretCell: Cell<string | null> = { value: null };

export async function openVault(): Promise<Vault | null> {
  const encryptedVault = getEncryptedVault();
  if (!encryptedVault || !secretCell.value) return (vaultCell.value = null);
  const vaultData = await decryptData(secretCell.value, encryptedVault);
  return (vaultCell.value = JSON.parse(vaultData));
}

export function lockVault() {
  vaultCell.value = null;
  secretCell.value = null;
}

export async function saveVault() {
  if (!secretCell.value) throw new Error("Secret key is not set");
  if (!vaultCell.value) throw new Error("Vault is empty");
  const encryptedVault = await encryptData(
    secretCell.value,
    JSON.stringify(vaultCell.value)
  );
  setEncryptedVault(encryptedVault);
}

export async function openSecretWithFingerprint(): Promise<string | null> {
  const encryptedSecret = getFingerprintEncryptedSecret();
  if (!encryptedSecret) return null;
  const fingerprintData = await fingerprint();
  if (!fingerprintData) return null;
  const fingerprintKey = await deriveKey(fingerprintData);
  return (secretCell.value = await decryptData(
    fingerprintKey,
    encryptedSecret
  ));
}

export async function saveSecretWithFingerprint() {
  if (!secretCell.value) throw new Error("Secret key is not set");
  const fingerprintData = await fingerprint();
  if (!fingerprintData) throw new Error("Fingerprint data is not available");
  const fingerprintKey = await deriveKey(fingerprintData);
  const encryptedSecret = await encryptData(fingerprintKey, secretCell.value);
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
