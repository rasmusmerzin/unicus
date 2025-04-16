import "./ImportExportModal.css";
import { ExportToFileModal } from "./ExportToFileModal";
import { ExportToQrCodeModal } from "./ExportToQrCodeModal";
import { ImportFromFileModal } from "./ImportFromFileModal";
import { ModalHeader } from "../../../elements/ModalHeader";
import { SettingsEntryElement } from "../SettingsEntryElement";
import { openModal } from "../../../view";
import { vault$ } from "../../../vault";

@tag("app-import-export-modal")
export class ImportExportModal extends HTMLElement {
  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "Import & Export" }),
      createElement("main", {}, [
        createElement(SettingsEntryElement, {
          name: "Import from file",
          description: "Import tokens from a file.",
          onclick: () => openModal(ImportFromFileModal),
        }),
        createElement(SettingsEntryElement, {
          name: "Export to file",
          description: "Export the vault to a file.",
          disabled: !vault$.current()?.entries?.length,
          onclick: () => openModal(ExportToFileModal),
        }),
        createElement(SettingsEntryElement, {
          name: "Export to QR Code",
          description: "Export the vault to migration QR codes.",
          disabled: !vault$.current()?.entries?.length,
          onclick: () => openModal(ExportToQrCodeModal),
        }),
      ])
    );
  }
}
