import { AuditEntry } from "./audit";
import { DBSchema, openDB } from "idb";

interface Database extends DBSchema {
  audit: {
    key: string;
    value: AuditEntry;
    indexes: {
      created: string;
    };
  };
}

export const database = openDB<Database>("unicus", 1, {
  upgrade(db, _oldVersion, _newVersion, transaction) {
    if (!db.objectStoreNames.contains("audit"))
      db.createObjectStore("audit", { keyPath: "id" });
    const auditStore = transaction.objectStore("audit");
    if (!auditStore.indexNames.contains("created"))
      auditStore.createIndex("created", "created");
  },
});
