import { FloatingModal } from "../../../elements/FloatingModal";
import { clickFeedback } from "../../../mixins/clickFeedback";
import { exportToFile } from "../../../vault";

export function ExportToFileModal() {
  const state: Record<string, boolean> = {};
  let confirmationContainer: HTMLElement;
  let confirmationButton: HTMLButtonElement;
  let modal: FloatingModal;
  function onclick() {
    exportToFile(state["encrypt"]).catch(alert);
  }
  function onchange() {
    confirmationContainer.style.display = state["encrypt"] ? "none" : "";
    if (state["encrypt"] && state["confirmation"]) confirmationButton.click();
    modal.getActionButton("OK")!.disabled =
      !state["encrypt"] && !state["confirmation"];
  }
  return (modal = createElement(
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
  ));
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
