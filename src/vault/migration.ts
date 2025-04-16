import { VaultEntry } from ".";
import { base32, base64 } from "rfc4648";
import { load, Type } from "protobufjs";

let MIGRATION_PROTO: Type | undefined;
setTimeout(async () => {
  const root = await load("otpauth-migration.proto");
  MIGRATION_PROTO = root.lookupType("MigrationPayload");
});

const ALGORITHM = [undefined, "SHA1", "SHA256", "SHA512", "MD5"];
const DIGIT_COUNT = [undefined, 6, 8];
const OTP_TYPE = [undefined, "HOTP", "TOTP"];

interface MigrationPayload {
  batchId?: number;
  batchIndex?: number;
  batchSize?: number;
  version?: number;
  otpParameters?: OtpParameters[];
}

interface OtpParameters {
  secret?: Uint8Array;
  name?: string;
  issuer?: string;
  algorithm?: number;
  digits?: number;
  type?: number;
  counter?: number;
}

export function entriesFromUri(uri: string): Partial<VaultEntry>[] {
  const url = new URL(uri);
  if (url.protocol === "otpauth:") return [entryFromUri(uri)];
  else if (url.protocol === "otpauth-migration:") {
    if (!MIGRATION_PROTO) throw new Error("Migration proto not loaded");
    const dataBase64 = decodeURIComponent(url.searchParams.get("data") || "");
    if (!dataBase64) throw new Error("Empty migration data");
    const data = base64.parse(dataBase64);
    const decoded = MIGRATION_PROTO.decode(data) as MigrationPayload;
    return decoded.otpParameters!.map(
      (param) =>
        ({
          secret: param.secret
            ? base32.stringify(param.secret!, { pad: false })
            : undefined,
          name: param.name,
          issuer: param.issuer,
          hash: ALGORITHM[param.algorithm || 0] as VaultEntry["hash"],
          digits: DIGIT_COUNT[param.digits || 0],
          type: OTP_TYPE[param.type || 0] as VaultEntry["type"],
          counter: param.counter,
        } satisfies Partial<VaultEntry>)
    );
  } else throw new Error("Invalid OTP URI");
}

function entryFromUri(uri: string): Partial<VaultEntry> {
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
