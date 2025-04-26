import { FileType, entriesFromFile } from "../../../vault";
import { ImportModal } from "../../import/ImportModal";
import { SelectModal } from "../../../elements/SelectModal";
import { openModal } from "../../../view";

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
            setTimeout(openModal, 100, createElement(ImportModal, { entries }));
          } catch (error) {
            alert(error);
          }
        },
      }).click(),
  });
}
