import { vault$ } from "../../vault";
import "./MainContentElement.css";
import { MainEntryElement } from "./MainEntryElement";

@tag("app-main-content")
export class MainContentElement extends HTMLElement {
  private control?: AbortController;

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    vault$.subscribe((vault) => {
      if (vault?.entries)
        this.replaceChildren(
          ...vault.entries.map((entry) =>
            createElement(MainEntryElement, { entry })
          )
        );
    }, this.control);
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
  }
}
