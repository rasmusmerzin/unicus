import { AuditEntry } from "./audit";
import { DBSchema, openDB } from "idb";

interface Database extends DBSchema {
  audit: {
    key: string;
    value: AuditEntry;
    indexes: {
      level: number;
    };
  };
}

export const database = openDB<Database>("unicus", 1, {
  upgrade(db, _oldVersion, _newVersion, transaction) {
    if (!db.objectStoreNames.contains("audit"))
      db.createObjectStore("audit", { keyPath: "id" });
    const audit = transaction.objectStore("audit");
    if (!audit.indexNames.contains("level"))
      audit.createIndex("level", "level");
  },
});
