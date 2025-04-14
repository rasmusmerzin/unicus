import { closeAllModals } from "../../../view";
import { importFromFile, SourceType } from "../../../vault";
import { SelectModal } from "../../../elements/SelectModal";

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
            .then(async ({ accepted, rejected }) => {
              await closeAllModals();
              alert(
                [
                  accepted.length
                    ? `Successfully imported ${accepted.length} entries.`
                    : "",
                  rejected.length
                    ? `Failed to import ${rejected.length} entries.`
                    : "",
                ]
                  .filter((s) => s)
                  .join("\n")
              );
            })
            .catch(alert);
        },
      }).click(),
  });
}
