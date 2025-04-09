import "./ImportExportModal.css";
import { ImportFromFileModal } from "./ImportFromFileModal";
import { ModalHeader } from "../../../elements/ModalHeader";
import { SettingsEntryElement } from "../SettingsEntryElement";
import { openModal } from "../../../view";
import { ExportToFileModal } from "./ExportToFileModal";

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
