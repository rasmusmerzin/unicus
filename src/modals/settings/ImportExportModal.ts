import "./ImportExportModal.css";
import { FloatingModal } from "../../elements/FloatingModal";
import { ModalHeader } from "../../elements/ModalHeader";
import { SettingsEntryElement } from "./SettingsEntryElement";
import { closeAllModals, openModal } from "../../view";
import { clickFeedback } from "../../mixins/clickFeedback";
import { exportToFile, importFromFile, SourceType } from "../../vault";

@tag("app-import-export-modal")
export class ImportExportModal extends HTMLElement {
  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "Import & Export" }),
      createElement("main", {}, [
        createElement(SettingsEntryElement, {
          name: "Import",
          description: "Import tokens from a file.",
          onclick: () => openModal(ImportFromFileModal),
        }),
        createElement(SettingsEntryElement, {
          name: "Export",
          description: "Export the vault to a file.",
          onclick: () => openModal(ExportToFileModal),
        }),
      ])
    );
  }
}

function ExportToFileModal() {
  const state: Record<string, boolean> = {};
  let confirmationContainer: HTMLElement;
  let confirmationButton: HTMLButtonElement;
  function onclick() {
    if (!state["confirmation"] && !state["encrypt"]) {
      alert("Please confirm you understand the risks.");
      throw new Error("User did not confirm");
    }
    exportToFile(state["encrypt"]).catch(alert);
  }
  function onchange() {
    confirmationContainer.style.display = state["encrypt"] ? "none" : "";
    if (state["encrypt"] && state["confirmation"]) confirmationButton.click();
  }
  return createElement(
    FloatingModal,
    {
      title: "Export to file",
      actions: [{ name: "OK", onclick }],
    },
    [
      createElement(
        "p",
        {},
        "This action will export the vault of Unicus' internal storage to a file."
      ),
      CheckboxInput({
        checked: true,
        name: "encrypt",
        display: "Encrypt vault",
        state,
        onchange,
      }),
      (confirmationContainer = createElement(
        "div",
        { style: { display: "none" } },
        [
          createElement("p", {
            style: { color: "var(--error)" },
            innerHTML:
              "You are about to export an unencrypted copy of your Unicus vault." +
              " <b>This is not recommended.</b>",
          }),
          (confirmationButton = CheckboxInput({
            name: "confirmation",
            display: "I understand the risks",
            state,
            onchange,
          })),
        ]
      )),
    ]
  );
}

function ImportFromFileModal() {
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

function CheckboxInput({
  checked,
  display,
  name,
  onchange,
  state,
}: {
  checked?: boolean;
  display: string;
  name: string;
  onchange?: () => any;
  state: Record<string, boolean>;
}) {
  let input: HTMLInputElement;
  state[name] = checked || false;
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
        onclick: (event: MouseEvent) => {
          if (!(event.target instanceof HTMLButtonElement)) return;
          state[name] = input.checked = !input.checked;
          onchange?.();
        },
      },
      [
        (input = createElement("input", {
          type: "checkbox",
          id: `checkbox-${name}`,
          checked,
          onchange: () => {
            state[name] = input.checked;
            onchange?.();
          },
        })),
        createElement("label", { for: `checkbox-${name}` }, display),
      ]
    )
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
