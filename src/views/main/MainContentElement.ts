import "./MainContentElement.css";
import { AddDrawerModal } from "./AddDrawerModal";
import { ButtonElement } from "../../elements/ButtonElement";
import { MainEntryElement } from "./MainEntryElement";
import { openModal } from "../../view";
import { splash } from "../../icons";
import { vault$, VaultEntry } from "../../vault";

@tag("app-main-content")
export class MainContentElement extends HTMLElement {
  private control?: AbortController;

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    vault$.subscribe(this.render.bind(this), this.control);
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
  }

  private render() {
    const vault = vault$.current();
    if (!vault) return;
    else if (vault.entries?.length) this.renderEntries(vault.entries);
    else this.renderSplash();
  }

  private renderEntries(entries: VaultEntry[]) {
    this.replaceChildren(
      ...entries.map((entry, index) =>
        createElement(MainEntryElement, { entry, index })
      ),
      createElement("p", {
        innerText: `Showing ${entries.length} entries`,
      })
    );
  }

  private renderSplash() {
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
  }
}
