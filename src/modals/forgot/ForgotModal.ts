import { CheckboxElement } from "../../elements/CheckboxElement";
import { FloatingModal } from "../../elements/FloatingModal";
import { clearVault } from "../../vault";
import { updateView } from "../../view";

export function ForgotModal() {
  let understandCheckbox: CheckboxElement;
  function onchange() {
    modal.getActionButton("Delete")!.disabled = !understandCheckbox.checked;
  }
  const modal = createElement(
    FloatingModal,
    {
      title: "Delete vault",
      actions: [
        { name: "Cancel" },
        {
          name: "Delete",
          onclick: () => {
            clearVault();
            setTimeout(updateView, 100, { direction: "backwards" });
          },
        },
      ],
    },
    [
      createElement("p", {
        style: { color: "var(--error)" },
        innerHTML:
          "Are you sure you want to delete your vault? " +
          "<b>This action cannot be undone.</b>",
      }),
      (understandCheckbox = createElement(CheckboxElement, {
        name: "understand",
        label: "I understand",
        onchange,
      })),
    ]
  );
  modal.getActionButton("Delete")!.disabled = true;
  return modal;
}
