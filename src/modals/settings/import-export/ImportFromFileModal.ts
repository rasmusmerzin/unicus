import { SelectModal } from "../../../elements/SelectModal";
import {
  FileType,
  entriesFromFile,
  importPartials,
  importResultMessage,
} from "../../../vault";

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
        async onchange(event: Event) {
          const input = event.target as HTMLInputElement;
          const [file] = input.files || [];
          if (!file) return;
          try {
            const entries = await entriesFromFile(value as FileType, file);
            const importResult = await importPartials(entries);
            alert(importResultMessage(importResult));
          } catch (error) {
            alert(error);
          }
        },
      }).click(),
  });
}
