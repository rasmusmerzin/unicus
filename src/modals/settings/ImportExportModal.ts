import "./ImportExportModal.css";
import { ModalHeader } from "../../elements/ModalHeader";
import { SettingsEntryElement } from "./SettingsEntryElement";

@tag("app-import-export-modal")
export class ImportExportModal extends HTMLElement {
  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "Import & Export" }),
      createElement("main", {}, [
        createElement(SettingsEntryElement, {
          name: "Import",
          disabled: true,
          description: "Import tokens from a file.",
        }),
        createElement(SettingsEntryElement, {
          name: "Export",
          disabled: true,
          description: "Export the vault to a file.",
        }),
      ])
    );
  }
}
