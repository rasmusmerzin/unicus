import { CheckboxElement } from "../../elements/CheckboxElement";
import { ModalHeader } from "../../elements/ModalHeader";
import { check } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import {
  entryDisplayName,
  importPartials,
  importResultMessage,
  VaultEntry,
} from "../../vault";
import "./ImportModal.css";

@tag("app-import-modal")
export class ImportModal extends HTMLElement {
  private mainElement: HTMLElement;

  #entries: Partial<VaultEntry>[] = [];
  get entries() {
    return this.#entries;
  }
  set entries(entries: Partial<VaultEntry>[]) {
    this.#entries = entries;
    this.mainElement.replaceChildren(
      ...entries.map((entry) =>
        createElement(CheckboxElement, {
          label: entryDisplayName(entry),
          checked: true,
        })
      )
    );
  }

  constructor() {
    super();
    this.replaceChildren(
      createElement(
        ModalHeader,
        { title: "Import entries" },
        clickFeedback(
          createElement("button", {
            innerHTML: check(28),
            onclick: this.submit.bind(this),
          }),
          { size: 0.5 }
        )
      ),
      (this.mainElement = createElement("main"))
    );
  }

  private async submit() {
    const entries = this.getSelectedEntries();
    history.back();
    try {
      const importResult = await importPartials(entries);
      alert(importResultMessage(importResult));
    } catch (error) {
      alert(error);
    }
  }

  private getSelectedEntries(): Partial<VaultEntry>[] {
    return this.entries.filter((_entry, index) => {
      const checkbox = this.mainElement.children[index] as CheckboxElement;
      return checkbox.checked;
    });
  }
}
