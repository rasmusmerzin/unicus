import OTP from "otp";
import { VaultEntry } from ".";

export function entryToCode(entry: VaultEntry): string {
  const otp = new OTP({
    keySize: entry.secret.length * 2,
    codeLength: entry.digits,
    secret: entry.secret,
    timeSlice: entry.type === "TOTP" ? entry.period : 0,
  });
  if (entry.type === "TOTP") return otp.totp(Date.now());
  else if (entry.type === "HOTP") return otp.hotp(entry.counter);
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
  const type = entry.type.toLowerCase();
  const name = encodeURIComponent(entrySerializedName(entry));
  const { issuer, secret, digits } = entry;
  const algorithm = entry.hash;
  const properties: Record<string, any> = { secret, digits, algorithm, issuer };
  if (entry.type === "TOTP") properties.period = entry.period;
  else if (entry.type === "HOTP") properties.counter = entry.counter;
  const props = encodeUriProperties(properties);
  const uri = `otpauth://${type}/${name}${props}`;
  return uri;
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

function encodeUriProperties(record: Record<string, any>): string {
  return (
    "?" +
    Object.entries(record)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&")
  );
}

function entrySerializedName(entry: VaultEntry): string {
  return `${entry.issuer}:${entry.name}`;
}
