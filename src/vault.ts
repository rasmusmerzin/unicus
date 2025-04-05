import { decryptData, deriveKey, encryptData, Encrypted } from "./crypto";
import { fingerprint } from "./fingerprint";

export interface Vault {
  entries?: VaultEntry[];
}

export interface VaultEntry {
  uuid: string;
  name: string;
  issuer: string;
  secret: string;
  digits: number;
  period: number;
}

let vault: Vault | null = null;
let secret: string | null = null;

export function getSecret(): string | null {
  return secret;
}

export function setSecret(value: string | null) {
  return (secret = value);
}

export function getVault(): Vault | null {
  return vault;
}

export function setVault(value: Vault | null) {
  return (vault = value);
}

export async function openVault(): Promise<Vault | null> {
  const encryptedVault = getEncryptedVault();
  if (!encryptedVault || !secret) return (vault = null);
  const vaultData = await decryptData(secret, encryptedVault);
  return (vault = JSON.parse(vaultData));
}

export function lockVault() {
  vault = null;
  secret = null;
}

export async function saveVault() {
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
  return (secret = await decryptData(fingerprintKey, encryptedSecret));
}

export async function saveSecretWithFingerprint() {
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
