import { FloatingModal } from "../../../elements/FloatingModal";
import { clickFeedback } from "../../../mixins/clickFeedback";
import { closeAllModals } from "../../../view";
import { importFromFile, SourceType } from "../../../vault";

export function ImportFromFileModal() {
  const state = { value: "" };
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
      importFromFile(state.value as SourceType, file)
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
      RadioInput({
        group: "import-type",
        value: "unicus",
        display: "Unicus",
        checked: true,
        state,
      }),
      RadioInput({
        group: "import-type",
        value: "aegis",
        display: "Aegis (unencrypted json)",
        state,
      }),
    ]
  );
}

function RadioInput({
  checked,
  display,
  group,
  state,
  value,
}: {
  checked?: boolean;
  display: string;
  group: string;
  state: { value: string };
  value: string;
}) {
  let input: HTMLInputElement;
  if (checked) state.value = value;
  return clickFeedback(
    createElement(
      "button",
      {
        tabIndex: -1,
        style: {
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: "16px",
          padding: "0 8px",
          height: "40px",
        },
        onclick: () => {
          input.checked = true;
          state.value = value;
        },
      },
      [
        (input = createElement("input", {
          type: "radio",
          id: `${group}-${value}`,
          name: group,
          value,
          checked,
          onchange: () => input.checked && (state.value = value),
        })),
        createElement("label", { for: `${group}-${value}` }, display),
      ]
    )
  );
}
