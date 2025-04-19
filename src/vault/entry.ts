import { VaultEntry } from ".";
import { encodeOtpUri } from "@merzin/otp/uri";
import { totp, hotp } from "@merzin/otp";

export function entryToCode(entry: VaultEntry): string {
  if (entry.type === "TOTP") return totp(entry);
  else if (entry.type === "HOTP") return hotp(entry);
  else throw new Error("Invalid OTP type");
}

export function entryIconUrl(entry: VaultEntry): string {
  let issuer = entry.issuer.trim() || entry.name.trim();
  issuer = issuer.replace(/\s+/g, "").toLowerCase();
  return "/icons/" + encodeURIComponent(issuer) + ".svg";
}

export async function saveEntryIcon(entry: VaultEntry) {
  const url = entryIconUrl(entry);
  const match = await caches.match(url);
  if (match) return;
  const response = await fetch(url);
  if (!response.ok) return;
  const cache = await caches.open("icons");
  cache.put(url, response);
}

export function entryToUri(entry: VaultEntry): string {
  return encodeOtpUri(entry);
}

export function entryDisplayName(entry: VaultEntry): string {
  const name = entry.name.trim();
  const issuer = entry.issuer.trim();
  if (issuer && name) return `${issuer} (${name})`;
  else return issuer || name;
}

export function entryColor(entry: VaultEntry): string {
  const value = entrySerializedName(entry);
  let hash = 0;
  for (let i = 0; i < value.length; i++)
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${hash % 360}, 85%, 35%)`;
}

export function entryFilterPredicate(search: string) {
  const words = search.toLowerCase().split(" ").filter(Boolean);
  return (entry: VaultEntry) => {
    const name = entry.name.toLowerCase();
    const issuer = entry.issuer.toLowerCase();
    return words.every((word) => name.includes(word) || issuer.includes(word));
  };
}

function entrySerializedName(entry: VaultEntry): string {
  return `${entry.issuer}:${entry.name}`;
}
