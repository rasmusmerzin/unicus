import { CheckboxElement } from "../../../elements/CheckboxElement";
import { FloatingModal } from "../../../elements/FloatingModal";
import { exportToFile } from "../../../vault";

export function ExportToFileModal() {
  let encryptCheckbox: CheckboxElement;
  let confirmationContainer: HTMLElement;
  let confirmationCheckbox: CheckboxElement;
  let modal: FloatingModal;
  function onclick() {
    exportToFile(encryptCheckbox.checked).catch(alert);
  }
  function onchange() {
    confirmationContainer.style.display = encryptCheckbox.checked ? "none" : "";
    if (encryptCheckbox.checked) confirmationCheckbox.checked = false;
    modal.getActionButton("OK")!.disabled =
      !encryptCheckbox.checked && !confirmationCheckbox.checked;
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
      (encryptCheckbox = createElement(CheckboxElement, {
        checked: true,
        name: "encrypt",
        label: "Encrypt vault",
        onchange,
      })),
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
          (confirmationCheckbox = createElement(CheckboxElement, {
            name: "confirmation",
            label: "I understand the risks",
            onchange,
          })),
        ]
      )),
    ]
  ));
}
