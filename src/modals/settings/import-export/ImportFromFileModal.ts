import { SelectModal } from "../../../elements/SelectModal";
import { closeAllModals } from "../../../view";
import {
  importFromFile,
  importResultMessage,
  SourceType,
} from "../../../vault";
import { storeAuditEntry } from "../../../audit";

export function ImportFromFileModal() {
  return SelectModal({
    title: "Import from file",
    group: "import-type",
    entries: [
      { value: "unicus", label: "Unicus" },
      { value: "aegis", label: "Aegis (unencrypted json)" },
    ],
    onsubmit: (value) =>
      createElement("input", {
        type: "file",
        accept: "application/json",
        onchange: async (event: Event) => {
          const input = event.target as HTMLInputElement;
          const [file] = input.files || [];
          if (!file) return;
          try {
            const result = await importFromFile(value as SourceType, file);
            const { created, overwriten } = result.upsertResult;
            if (created.length || overwriten.length) {
              const entries = [
                ...created,
                ...overwriten.map(({ current }) => current),
              ].map(({ uuid, name, issuer }) => ({ uuid, name, issuer }));
              storeAuditEntry({ type: "import", subtype: "file", entries });
            }
            await closeAllModals();
            alert(importResultMessage(result));
          } catch (error) {
            alert(error);
          }
        },
      }).click(),
  });
}
