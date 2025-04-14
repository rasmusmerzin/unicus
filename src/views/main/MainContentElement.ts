import "./MainContentElement.css";
import { AddDrawerModal } from "./AddDrawerModal";
import { ButtonElement } from "../../elements/ButtonElement";
import { MainEntryElement } from "./MainEntryElement";
import { openModal } from "../../view";
import { splash } from "../../icons";
import { vault$, VaultEntry } from "../../vault";
import { MainView } from "./MainView";

@tag("app-main-content")
export class MainContentElement extends HTMLElement {
  private control?: AbortController;

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    vault$.subscribe(this.render.bind(this), this.control);
    MainView.instance!.search$.subscribe(this.render.bind(this), this.control);
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
  }

  private render() {
    const vault = vault$.current();
    const search = MainView.instance!.search$.current();
    if (!vault) return;
    else if (vault.entries?.length) {
      let filtered = vault.entries;
      if (search)
        filtered = vault.entries.filter(this.entryFilterPredicate(search));
      this.renderEntries(filtered);
    } else this.renderSplash();
  }

  private entryFilterPredicate(search: string) {
    const words = search.toLowerCase().split(" ").filter(Boolean);
    return (entry: VaultEntry) => {
      const name = entry.name.toLowerCase();
      const issuer = entry.issuer.toLowerCase();
      return words.every(
        (word) => name.includes(word) || issuer.includes(word)
      );
    };
  }

  private renderEntries(entries: VaultEntry[]) {
    this.replaceChildren(
      ...entries.map((entry, index) =>
        createElement(MainEntryElement, { entry, index })
      ),
      createElement("p", {
        className: "count",
        innerText: `Showing ${entries.length} entries`,
      })
    );
  }

  private renderSplash() {
    this.replaceChildren(
      createElement("div", { className: "splash" }, [
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
