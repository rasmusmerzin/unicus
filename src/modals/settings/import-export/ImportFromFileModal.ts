import { FloatingModal } from "../../../elements/FloatingModal";
import { RadioElement } from "../../../elements/RadioElement";
import { closeAllModals } from "../../../view";
import { importFromFile, SourceType } from "../../../vault";

export function ImportFromFileModal() {
  let state = "unicus";
  function onchange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) state = target.value;
  }
  function onclick() {
    const fileInput = createElement("input", {
      type: "file",
      accept: "application/json",
      onchange,
    });
    fileInput.click();
    function onchange() {
      const [file] = fileInput.files || [];
      if (!file) return;
      importFromFile(state as SourceType, file)
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
    }
  }
  return createElement(
    FloatingModal,
    { title: "Import from file", actions: [{ name: "OK", onclick }] },
    [
      createElement(RadioElement, {
        name: "import-type",
        value: "unicus",
        label: "Unicus",
        checked: true,
        onchange,
      }),
      createElement(RadioElement, {
        name: "import-type",
        value: "aegis",
        label: "Aegis (unencrypted json)",
        onchange,
      }),
    ]
  );
}
