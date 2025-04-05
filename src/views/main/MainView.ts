import "./MainView.css";
import { MainHeaderElement } from "./MainHeaderElement";
import { MainContentElement } from "./MainContentElement";

@tag("app-main")
export class MainView extends HTMLElement {
  constructor() {
    super();
    this.replaceChildren(
      createElement(MainHeaderElement),
      createElement(MainContentElement)
    );
  }
}
