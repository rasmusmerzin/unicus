import { SelectModal } from "../../../elements/SelectModal";
import { closeAllModals } from "../../../view";
import {
  importFromFile,
  importResultMessage,
  SourceType,
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
        onchange: (event: Event) => {
          const input = event.target as HTMLInputElement;
          const [file] = input.files || [];
          if (!file) return;
          importFromFile(value as SourceType, file)
            .then(async (result) => {
              await closeAllModals();
              alert(importResultMessage(result));
            })
            .catch(alert);
        },
      }).click(),
  });
}
