import { ButtonElement } from "../../elements/ButtonElement";
import { splash } from "../../icons";
import { vault$ } from "../../vault";
import { openModal } from "../../view";
import { AddDrawerModal } from "./AddDrawerModal";
import "./MainContentElement.css";
import { MainEntryElement } from "./MainEntryElement";

@tag("app-main-content")
export class MainContentElement extends HTMLElement {
  private control?: AbortController;

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    vault$.subscribe((vault) => {
      if (vault?.entries?.length)
        this.replaceChildren(
          ...vault.entries.map((entry, index) =>
            createElement(MainEntryElement, { entry, index })
          ),
          createElement("p", {
            innerText: `Showing ${vault.entries.length} entries`,
          })
        );
      else
        this.replaceChildren(
          createElement("div", { className: "empty" }, [
            createElement("div", {
              innerHTML: splash(256),
            }),
            createElement("p", {
              innerText: "Looks like you don't have any entries yet.",
            }),
            createElement(ButtonElement, {
              textContent: "Add your first entry",
              onclick: () => openModal(AddDrawerModal),
            }),
          ])
        );
    }, this.control);
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
  }
}
