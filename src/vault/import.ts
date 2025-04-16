import { FloatingModal } from "../elements/FloatingModal";
import { InputElement } from "../elements/InputElement";
import { tryAcceptEntry, UpsertResult, upsertVaultEntry, VaultEntry } from ".";
import { decryptData, deriveKey, Encrypted } from "../crypto";
import { openModal } from "../view";

export type SourceType = "unicus" | "aegis";

export interface ImportResult {
  accepted: VaultEntry[];
  rejected: any[];
  upsertResult: UpsertResult;
}

export function importResultMessage({
  accepted,
  rejected,
  upsertResult: { created, overwriten, skipped },
}: ImportResult): string {
  return [
    accepted.length &&
      `Successfully resolved ${accepted.length} entries of which ` +
        [
          created.length && `${created.length} were newly created`,
          overwriten.length && `${overwriten.length} were overwrites`,
          skipped.length && `${skipped.length} were skipped`,
        ]
          .filter(Boolean)
          .reduce(reduceComaAndJoin, "") +
        ".",
    rejected.length && `Failed to convert ${rejected.length} entries.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function importPartials(
  partials: Partial<VaultEntry>[]
): Promise<ImportResult> {
  const accepted = <VaultEntry[]>[];
  const rejected = <any[]>[];
  for (const partial of partials) {
    const result = tryAcceptEntry(partial);
    if (result) accepted.push(result);
    else rejected.push(partial);
  }
  const upsertResult = await upsertVaultEntry(...accepted);
  return { accepted, rejected, upsertResult };
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
  const upsertResult = await upsertVaultEntry(...accepted);
  return { accepted, rejected, upsertResult };
}

function reduceComaAndJoin<T>(
  state: string,
  current: T,
  index: number,
  list: T[]
): string {
  if (!state) return String(current);
  if (index === list.length - 1) return `${state} and ${current}`;
  return `${state}, ${current}`;
}

function entryFromAegisObject(entry: any): VaultEntry | null {
  const uuid = typeof entry.uuid === "string" ? entry.uuid : undefined;
  const name = typeof entry.name === "string" ? entry.name : "";
  const issuer = typeof entry.issuer === "string" ? entry.issuer : "";
  const secret =
    typeof entry.info?.secret === "string" ? entry.info.secret : "";
  const hash =
    typeof entry.info?.algo === "string"
      ? entry.info.algo.toUpperCase().replace(/-/g, "")
      : undefined;
  const digits =
    typeof entry.info?.digits === "number" ? entry.info.digits : undefined;
  const type =
    typeof entry.type === "string" ? entry.type.toUpperCase() : undefined;
  const period =
    typeof entry.info?.period === "number" ? entry.info.period : undefined;
  const counter =
    typeof entry.info?.counter === "number" ? entry.info.counter : undefined;
  return tryAcceptEntry({
    uuid,
    name,
    issuer,
    secret,
    hash,
    digits,
    type,
    period,
    counter,
  });
}

function entryFromUnicusObject(entry: any): VaultEntry | null {
  const uuid = typeof entry.uuid === "string" ? entry.uuid : undefined;
  const name = typeof entry.name === "string" ? entry.name : "";
  const issuer = typeof entry.issuer === "string" ? entry.issuer : "";
  const secret = typeof entry.secret === "string" ? entry.secret : "";
  const hash =
    typeof entry.hash === "string"
      ? entry.hash.toUpperCase().replace(/-/g, "")
      : undefined;
  const digits = typeof entry.digits === "number" ? entry.digits : undefined;
  const type =
    typeof entry.type === "string" ? entry.type.toUpperCase() : undefined;
  const period = typeof entry.period === "number" ? entry.period : undefined;
  const counter = typeof entry.counter === "number" ? entry.counter : undefined;
  return tryAcceptEntry({
    uuid,
    name,
    issuer,
    secret,
    hash,
    digits,
    type,
    period,
    counter,
  });
}

function decryptUnicusVault(encryptedVault: Encrypted): Promise<any> {
  return new Promise((resolve, reject) => {
    let modal: FloatingModal;
    let input: InputElement;
    openModal(
      (modal = createElement(
        FloatingModal,
        {
          title: "Enter vault passcode",
          actions: [{ name: "OK", onclick }],
          ondisconnect: () => reject(new Error("Couldn't decrypt vault")),
        },
        (input = createElement(InputElement, {
          label: "Passcode",
          type: "password",
          oninput,
          onsubmit: onclick,
        }))
      ))
    ).then(() => input.focus());
    function oninput() {
      input.error = "";
      modal.getActionButton("OK")!.disabled = false;
    }
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
  });
}
