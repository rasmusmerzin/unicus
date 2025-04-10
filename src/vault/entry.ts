import OTP from "otp";
import { VaultEntry } from ".";

export function entryToCode(entry: VaultEntry): string {
  const otp = entryToOtp(entry);
  if (entry.type === "TOTP") return otp.totp(Date.now());
  else if (entry.type === "HOTP") return otp.hotp(entry.counter);
  else throw new Error("Invalid OTP type");
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

export function entryFromUri(uri: string): Partial<VaultEntry> {
  const entry: Partial<VaultEntry> = {};
  const url = new URL(uri);
  if (url.protocol !== "otpauth:") throw new Error("Invalid OTP URI");
  const type = url.host.toUpperCase();
  if (!["TOTP", "HOTP"].includes(type)) throw new Error("Unsupported OTP type");
  let [issuer, ...rest] = decodeURIComponent(url.pathname.substring(1)).split(
    ":"
  );
  let name = rest.join(":");
  if (url.searchParams.has("issuer")) {
    if (!name) name = issuer;
    issuer = decodeURIComponent(url.searchParams.get("issuer")!);
  }
  const secret = decodeURIComponent(url.searchParams.get("secret") || "");
  const hash = decodeURIComponent(url.searchParams.get("algorithm") || "")
    .toUpperCase()
    .replace(/-/g, "");
  if (hash && hash !== "SHA1") throw new Error("Unsupported hash algorithm");
  const digits = decodeURIComponent(url.searchParams.get("digits") || "");
  const period = decodeURIComponent(url.searchParams.get("period") || "");
  const counter = decodeURIComponent(url.searchParams.get("counter") || "");
  entry.name = name;
  entry.issuer = issuer;
  entry.secret = secret;
  entry.type = type as VaultEntry["type"];
  if (digits) entry.digits = parseInt(digits);
  if (entry.type === "TOTP" && period) entry.period = parseInt(period);
  if (entry.type === "HOTP" && counter) entry.counter = parseInt(counter);
  return entry;
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

function encodeUriProperties(record: Record<string, any>): string {
  return (
    "?" +
    Object.entries(record)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&")
  );
}

function entryToOtp(entry: VaultEntry): OTP {
  return new OTP({
    keySize: entry.secret.length * 2,
    codeLength: entry.digits,
    secret: entry.secret,
    timeSlice: entry.type === "TOTP" ? entry.period : 0,
  });
}

function entrySerializedName(entry: VaultEntry): string {
  return `${entry.issuer}:${entry.name}`;
}
