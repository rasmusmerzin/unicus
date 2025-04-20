import { database } from "./database";

export type AuditEntryLevel = 1 | 2 | 3;

export type AuditEntry = AuditEntryContent & {
  id: string;
  created: string;
  level: AuditEntryLevel;
};

export type AuditEntryContent =
  | {
      type: "setup" | "clear" | "failed-unlock";
    }
  | {
      type: "biometric";
      action: "enable" | "disable";
    }
  | {
      type: "unlock";
      subtype: "passcode" | "biometric";
    }
  | {
      type: "add" | "edit" | "view-secret" | "copy-code";
      uuid: string;
      name: string;
      issuer: string;
    }
  | {
      type: "share" | "delete";
      entries: { uuid: string; name: string; issuer: string }[];
    }
  | {
      type: "import" | "export";
      subtype: "file" | "qrcode";
      entries: { uuid: string; name: string; issuer: string }[];
      encrypted?: boolean;
    };

export async function getAuditEntries(
  level?: AuditEntryLevel
): Promise<AuditEntry[]> {
  const db = await database;
  let entries: AuditEntry[] = [];
  if (level) entries = await db.getAllFromIndex("audit", "level", level);
  else entries = await db.getAll("audit");
  return entries.sort((a, b) => {
    if (a.created < b.created) return 1;
    if (a.created > b.created) return -1;
    return 0;
  });
}

export async function storeAuditEntry(
  content: AuditEntryContent
): Promise<string> {
  const id = crypto.randomUUID();
  const created = new Date().toISOString();
  const level = auditEntryLevel(content);
  const entry: AuditEntry = { id, created, level, ...content };
  const db = await database;
  return db.put("audit", entry);
}

function auditEntryLevel(content: AuditEntryContent): AuditEntryLevel {
  if (content.type === "failed-unlock") return 2;
  if (content.type === "view-secret") return 2;
  if (content.type === "share") return 2;
  if (content.type === "export") return content.encrypted ? 2 : 3;
  return 1;
}
