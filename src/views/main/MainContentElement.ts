import { getVault } from "../../vault";
import "./MainContentElement.css";
import { MainEntryElement } from "./MainEntryElement";

@tag("app-main-content")
export class MainContentElement extends HTMLElement {
  constructor() {
    super();
    const { entries } = getVault() || {};
    if (entries)
      this.replaceChildren(
        ...entries.map((entry) => createElement(MainEntryElement, { entry }))
      );
  }
}
