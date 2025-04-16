import { VaultEntry } from ".";

export function tryAcceptEntry(entry: Partial<VaultEntry>): VaultEntry | null {
  const uuid = entry.uuid || crypto.randomUUID();
  const name = entry.name || "";
  const issuer = entry.issuer || "";
  const secret = entry.secret || "";
  const hash = entry.hash || "SHA1";
  const digits = entry.digits || 6;
  const type = entry.type || "TOTP";
  const period = (entry as any).period || 30;
  const counter = (entry as any).counter || 0;
  if (!secret) return null;
  if (hash !== "SHA1") return null;
  if (!["TOTP", "HOTP"].includes(type)) return null;
  if (type === "TOTP")
    return { uuid, name, issuer, secret, hash, digits, type, period };
  else return { uuid, name, issuer, secret, hash, digits, type, counter };
}
