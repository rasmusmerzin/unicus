import { ModalHeader } from "../../elements/ModalHeader";
import { brush, construction, key, receipt, touch } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import { openModal } from "../../view";
import { SecuritySettingsModal } from "./SecuritySettingsModal";
import "./SettingsModal.css";

@tag("app-settings-modal")
export class SettingsModal extends HTMLElement {
  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "Settings" }),
      createElement("main", {}, [
        Entry({
          icon: brush(),
          name: "Appearance",
          disabled: true,
          description:
            "Adjust the theme, primary color and other settings that affect the appearance of the app.",
        }),
        Entry({
          icon: touch(),
          name: "Behavior",
          disabled: true,
          description:
            "Customize how the app behaves, including keyboard shortcuts and other settings.",
        }),
        Entry({
          icon: key(),
          name: "Security",
          description:
            "Configure encryption, biometric authentication, auto lock and other security settings.",
          modalConstructor: SecuritySettingsModal,
        }),
        Entry({
          icon: construction(),
          name: "Import & Export",
          disabled: true,
          description:
            "Import backups of Unicus or other authentication apps. Create manual exports of your Unicus vault.",
        }),
        Entry({
          icon: receipt(),
          name: "Audit log",
          disabled: true,
          description:
            "Find a list of all actions taken in the app, including logins, exports and other sensitive actions.",
        }),
      ])
    );
  }
}

function Entry({
  description = "",
  disabled = false,
  icon = "",
  name,
  modalConstructor,
}: {
  description?: string;
  disabled?: boolean;
  icon?: string;
  name: string;
  modalConstructor?: Constructor<HTMLElement>;
}) {
  return clickFeedback(
    createElement(
      "button",
      {
        disabled,
        onclick: modalConstructor && (() => openModal(modalConstructor)),
      },
      [
        createElement("div", { className: "icon", innerHTML: icon }),
        createElement("div", { className: "info" }, [
          createElement("div", { className: "name", textContent: name }),
          createElement("div", {
            className: "description",
            textContent: description,
          }),
        ]),
      ]
    ),
    { size: 2 }
  );
}
