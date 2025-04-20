import { AuditEntry } from "../../audit";
import {
  add,
  build,
  close,
  copy,
  edit,
  failedUnlock,
  fingerprint,
  input,
  lockOpen,
  output,
  share,
  trash,
  visibility,
} from "../../icons";
import "./AuditEntryElement.css";

const ICONS: Record<AuditEntry["type"], string> = {
  setup: build(),
  clear: close(),
  "failed-unlock": failedUnlock(),
  biometric: fingerprint(),
  unlock: lockOpen(),
  add: add(),
  edit: edit(),
  "view-secret": visibility(),
  "copy-code": copy(),
  share: share(),
  delete: trash(),
  import: input(),
  export: output(),
};

function entryTitle(entry: AuditEntry): string {
  switch (entry.type) {
    case "setup":
      return "Vault setup";
    case "clear":
      return "Vault cleared";
    case "failed-unlock":
      return "Failed unlock";
    case "biometric":
      return "Biometric";
    case "unlock":
      return "Vault unlocked";
    case "add":
      return "Entry added";
    case "edit":
      return "Entry edited";
    case "view-secret":
      return "Secret viewed";
    case "copy-code":
      return "Code copied";
    case "share":
      return (entry.entries.length === 1 ? "Entry" : "Entries") + " shared";
    case "delete":
      return (entry.entries.length === 1 ? "Entry" : "Entries") + " deleted";
    case "import":
      return "Entries imported";
    case "export":
      return "Vault exported";
  }
}

function entryDescription(entry: AuditEntry): string {
  switch (entry.type) {
    case "setup":
      return "Encrypted vault configured";
    case "clear":
      return "Vault was deleted";
    case "failed-unlock":
      return "Failed to unlock with passcode";
    case "biometric":
      return entry.action === "enable"
        ? "Biometric unlock enabled"
        : "Biometric unlock disabled";
    case "unlock":
      return entry.subtype === "passcode"
        ? "Unlocked with passcode"
        : "Unlocked with biometric";
    case "add":
      return "Added new entry";
    case "edit":
      return "Edited existing entry";
    case "view-secret":
      return "Viewed entry secret";
    case "copy-code":
      return "Entry OTP copied to clipboard";
    case "share":
      return entry.entries.length === 1
        ? "Viewed entry's QR code"
        : `Viewed ${entry.entries.length} entries' QR codes`;
    case "delete":
      return entry.entries.length === 1
        ? "Deleted an entry"
        : `Deleted ${entry.entries.length} entries`;
    case "import":
      return `${entry.entries.length} entries were imported from ${
        entry.subtype === "file" ? "file" : "QR code"
      }`;
    case "export":
      return entry.subtype === "file"
        ? `${entry.entries.length} entries were exported to file ${
            entry.encrypted ? "encrypted" : "unencrypted"
          }`
        : `${entry.entries.length} entries were exported to QR code(s)`;
  }
}

@tag("app-audit-entry")
export class AuditEntryElement extends HTMLElement {
  private iconElement: HTMLElement;
  private titleElement: HTMLElement;
  private descElement: HTMLElement;
  private detailsElement: HTMLElement;
  private timeElement: HTMLElement;

  set entry(entry: AuditEntry) {
    this.iconElement.innerHTML = ICONS[entry.type];
    this.titleElement.innerText = entryTitle(entry);
    this.descElement.innerText = entryDescription(entry);
    this.timeElement.innerText = entry.created;
    this.setAttribute("level", String(entry.level));
  }

  constructor() {
    super();
    this.replaceChildren(
      createElement("div", { class: "container" }, [
        (this.iconElement = createElement("div", { class: "icon" })),
        createElement("div", { class: "content" }, [
          (this.titleElement = createElement("div", { class: "title" })),
          (this.descElement = createElement("div", { class: "desc" })),
          (this.detailsElement = createElement("div", { class: "details" })),
          (this.timeElement = createElement("div", { class: "time" })),
        ]),
      ])
    );
  }
}
