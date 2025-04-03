import { decryptData, encryptData, Encrypted } from "./crypto";

export interface Vault {}

export const SALT = "salt";

export const vaultCell: Cell<Vault | null> = { value: null };
export const secretCell: Cell<string | null> = { value: null };

export async function openVault(): Promise<Vault | null> {
  const encryptedVault = getEncryptedVault();
  if (!encryptedVault || !secretCell.value) return (vaultCell.value = null);
  const vaultData = await decryptData(secretCell.value, encryptedVault);
  return (vaultCell.value = JSON.parse(vaultData));
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

export function getEncryptedVault(): Encrypted | null {
  const data = localStorage.getItem("vault");
  return data ? JSON.parse(data) : null;
}

function setEncryptedVault(vault: Encrypted) {
  localStorage.setItem("vault", JSON.stringify(vault));
}
