import { FloatingModal } from "../elements/FloatingModal";
import { InputElement } from "../elements/InputElement";
import { VaultEntry } from ".";
import { decryptData, deriveKey, Encrypted } from "../crypto";
import { openModal } from "../view";

export type FileType = "unicus" | "aegis";

export async function entriesFromFile(
  sourceType: FileType,
  source: File
): Promise<Partial<VaultEntry>[]> {
  const accepted = <Partial<VaultEntry>[]>[];
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
    }
  } else if (sourceType === "unicus") {
    if (typeof obj.iv === "string" && typeof obj.cipher === "string")
      obj = await decryptUnicusVault(obj);
    const { entries } = obj;
    for (const entry of entries) {
      const result = entryFromUnicusObject(entry);
      if (result) accepted.push(result);
    }
  } else throw new Error("Unsupported source type");
  return accepted;
}

function entryFromAegisObject(entry: any): Partial<VaultEntry> | null {
  const uuid = typeof entry.uuid === "string" ? entry.uuid : undefined;
  const name = typeof entry.name === "string" ? entry.name : "";
  const issuer = typeof entry.issuer === "string" ? entry.issuer : "";
  const secret =
    typeof entry.info?.secret === "string" ? entry.info.secret : "";
  const algorithm =
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
  return {
    uuid,
    name,
    issuer,
    secret,
    algorithm,
    digits,
    type,
    period,
    counter,
  };
}

function entryFromUnicusObject(entry: any): Partial<VaultEntry> | null {
  const uuid = typeof entry.uuid === "string" ? entry.uuid : undefined;
  const name = typeof entry.name === "string" ? entry.name : "";
  const issuer = typeof entry.issuer === "string" ? entry.issuer : "";
  const secret = typeof entry.secret === "string" ? entry.secret : "";
  const algorithm =
    typeof entry.algorithm === "string"
      ? entry.algorithm.toUpperCase().replace(/-/g, "")
      : typeof entry.hash === "string"
      ? entry.hash.toUpperCase().replace(/-/g, "")
      : undefined;
  const digits = typeof entry.digits === "number" ? entry.digits : undefined;
  const type =
    typeof entry.type === "string" ? entry.type.toUpperCase() : undefined;
  const period = typeof entry.period === "number" ? entry.period : undefined;
  const counter = typeof entry.counter === "number" ? entry.counter : undefined;
  return {
    uuid,
    name,
    issuer,
    secret,
    algorithm,
    digits,
    type,
    period,
    counter,
  };
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
          onsubmit() {
            onclick();
            history.back();
          },
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
