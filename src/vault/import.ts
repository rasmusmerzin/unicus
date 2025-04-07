import { upsertVaultEntry, VaultEntry } from ".";
import { decryptData, deriveKey, Encrypted } from "../crypto";
import { FloatingModal } from "../elements/FloatingModal";
import { InputElement } from "../elements/InputElement";
import { openModal } from "../view";

export type SourceType = "unicus" | "aegis";

export interface ImportResult {
  accepted: VaultEntry[];
  rejected: any[];
}

export async function importFromFile(
  sourceType: SourceType,
  source: File
): Promise<ImportResult> {
  const accepted = <VaultEntry[]>[];
  const rejected = <any[]>[];
  const data = await source.text();
  let obj = JSON.parse(data);
  if (sourceType === "aegis") {
    const { db } = obj;
    if (typeof db === "string")
      throw new Error("Encrypted Aegis file is not supported");
    const { entries } = db;
    for (const entry of entries) {
      const result = entryFromAegisObject(entry);
      if (result) accepted.push(result);
      else rejected.push(entry);
    }
  } else if (sourceType === "unicus") {
    if (typeof obj.iv === "string" && typeof obj.cipher === "string")
      obj = await decryptUnicusVault(obj);
    const { entries } = obj;
    for (const entry of entries) {
      const result = entryFromUnicusObject(entry);
      if (result) accepted.push(result);
      else rejected.push(entry);
    }
  } else throw new Error("Unsupported source type");
  await upsertVaultEntry(...accepted);
  return { accepted, rejected };
}

function entryFromAegisObject(entry: any): VaultEntry | null {
  const uuid =
    typeof entry.uuid === "string" ? entry.uuid : crypto.randomUUID();
  const name = typeof entry.name === "string" ? entry.name : "";
  const issuer = typeof entry.issuer === "string" ? entry.issuer : "";
  const secret =
    typeof entry.info?.secret === "string" ? entry.info.secret : "";
  const hash =
    typeof entry.info?.algo === "string"
      ? entry.info.algo.toUpperCase().replace(/-/g, "")
      : "";
  const digits = typeof entry.info?.digits === "number" ? entry.info.digits : 0;
  const type = typeof entry.type === "string" ? entry.type.toUpperCase() : "";
  const period =
    typeof entry.info?.period === "number" ? entry.info.period : undefined;
  const counter =
    typeof entry.info?.counter === "number" ? entry.info.counter : undefined;
  if (hash !== "SHA1") return null;
  if (!["TOTP", "HOTP"].includes(type)) return null;
  if (!secret) return null;
  if (!digits) return null;
  if (type === "TOTP" && !period) return null;
  if (type === "HOTP" && !counter) return null;
  return {
    uuid,
    name,
    issuer,
    secret,
    hash,
    digits,
    type,
    period,
    counter,
  };
}

function entryFromUnicusObject(entry: any): VaultEntry | null {
  const uuid =
    typeof entry.uuid === "string" ? entry.uuid : crypto.randomUUID();
  const name = typeof entry.name === "string" ? entry.name : "";
  const issuer = typeof entry.issuer === "string" ? entry.issuer : "";
  const secret = typeof entry.secret === "string" ? entry.secret : "";
  const hash =
    typeof entry.hash === "string"
      ? entry.hash.toUpperCase().replace(/-/g, "")
      : "";
  const digits = typeof entry.digits === "number" ? entry.digits : 0;
  const type = typeof entry.type === "string" ? entry.type.toUpperCase() : "";
  const period = typeof entry.period === "number" ? entry.period : undefined;
  const counter = typeof entry.counter === "number" ? entry.counter : undefined;
  if (hash !== "SHA1") return null;
  if (!["TOTP", "HOTP"].includes(type)) return null;
  if (!secret) return null;
  if (!digits) return null;
  if (type === "TOTP" && !period) return null;
  if (type === "HOTP" && !counter) return null;
  return {
    uuid,
    name,
    issuer,
    secret,
    hash,
    digits,
    type,
    period,
    counter,
  };
}

function decryptUnicusVault(encryptedVault: Encrypted): Promise<any> {
  return new Promise((resolve, reject) => {
    let modal: FloatingModal;
    const input = createElement(InputElement, {
      label: "Passcode",
      type: "password",
      oninput: () => {
        input.error = "";
        modal.getActionButton("OK")!.disabled = false;
      },
      onsubmit: onclick,
    });
    async function onclick() {
      try {
        const secretKey = await deriveKey(input.value);
        const vault = await decryptData(secretKey, encryptedVault);
        resolve(JSON.parse(vault));
      } catch (error) {
        input.error = "Wrong passcode";
        modal.getActionButton("OK")!.disabled = true;
        throw new Error("Wrong passcode");
      }
    }
    openModal(
      (modal = createElement(
        FloatingModal,
        {
          title: "Enter vault passcode",
          actions: [{ name: "OK", onclick }],
          ondisconnect: () => reject(new Error("Couldn't decrypt vault")),
        },
        input
      ))
    );
  });
}
