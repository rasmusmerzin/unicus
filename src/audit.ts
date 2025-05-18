import { database } from "./database";
import {
  add,
  construction,
  download,
  nolock,
  share,
  trash,
  unlock,
} from "./icons";
import { entryDisplayName } from "./vault";

export type AuditEntry = AuditEntryContent & {
  id: string;
  created: string;
};

export type AuditEntryContent =
  | { type: "setup" | "unlock" | "failed_unlock" }
  | {
      type: "import" | "export" | "share" | "remove";
      entries: { name: string; issuer: string }[];
    };

export async function getAllAuditEntries() {
  const db = await database;
  return db.getAllFromIndex("audit", "created");
}

export async function createAuditEntry(content: AuditEntryContent) {
  const db = await database;
  const id = crypto.randomUUID();
  const created = new Date().toISOString();
  const entry: AuditEntry = { id, created, ...content };
  return db.put("audit", entry);
}

export function auditEntryIcon(entry: AuditEntry): string {
  switch (entry.type) {
    case "setup":
      return construction();
    case "unlock":
      return unlock();
    case "failed_unlock":
      return nolock();
    case "import":
      return add();
    case "export":
      return download();
    case "share":
      return share();
    case "remove":
      return trash();
  }
}

export function auditEntryTitle(entry: AuditEntry): string {
  switch (entry.type) {
    case "setup":
      return "Vault setup";
    case "unlock":
      return "Vault unlocked";
    case "failed_unlock":
      return "Failed vault unlock";
    case "import":
      return `Imported ${entry.entries.length} entries`;
    case "export":
      return `Exported ${entry.entries.length} entries`;
    case "share":
      return `Shared ${entry.entries.length} entries`;
    case "remove":
      return `Removed ${entry.entries.length} entries`;
  }
}

export function auditEntryDescription(entry: AuditEntry): string | string[] {
  switch (entry.type) {
    case "setup":
      return "The vault was setup";
    case "unlock":
      return "The vault was unlocked";
    case "failed_unlock":
      return "Failed to unlock the vault";
    case "import":
    case "export":
    case "share":
    case "remove":
      return entry.entries.map(entryDisplayName);
  }
}

export function auditEntryDate(entry: AuditEntry): string {
  // TODO: Use a better date format
  const date = new Date(entry.created);
  return date.toLocaleString("default");
}
