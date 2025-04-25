import "./SettingsModal.css";
import { ImportExportModal } from "./import-export/ImportExportModal";
import { ModalHeader } from "../../elements/ModalHeader";
import { SecuritySettingsModal } from "./security/SecuritySettingsModal";
import { brush, construction, info, key, receipt } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import { openModal } from "../../view";
import { AppearanceModal } from "./appearance/AppearanceModal";
import { AboutModal } from "./about/AboutModal";

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
          description:
            "Adjust the theme and other settings that affect the appearance of the app.",
          modalConstructor: AppearanceModal,
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
          description:
            "Import backups of Unicus or other authentication apps. Create manual exports of your Unicus vault.",
          modalConstructor: ImportExportModal,
        }),
        Entry({
          icon: receipt(),
          name: "Audit log",
          disabled: true,
          description:
            "Find a list of all actions taken in the app, including logins, exports and other sensitive actions.",
        }),
        Entry({
          icon: info(),
          name: "About",
          description:
            "Learn more about Unicus, including the version number and other information.",
          modalConstructor: AboutModal,
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
