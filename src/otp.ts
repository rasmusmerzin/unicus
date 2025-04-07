import OTP from "otp";
import { VaultEntry } from "./vault";

export function generateOtp(entry: VaultEntry): string {
  const otp = entryToOtp(entry);
  if (entry.type === "TOTP") return otp.totp(Date.now());
  else if (entry.type === "HOTP") return otp.hotp(entry.counter);
  else throw new Error("Invalid OTP type");
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

function entryToOtp(entry: VaultEntry): OTP {
  return new OTP({
    name: entrySerializedName(entry),
    keySize: entry.secret.length * 2,
    codeLength: entry.digits,
    secret: entry.secret,
    timeSlice: entry.type === "TOTP" ? entry.period : 0,
  });
}

function entrySerializedName(entry: VaultEntry): string {
  return `${entry.issuer}:${entry.name}`;
}
