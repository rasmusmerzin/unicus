import "./MainView.css";
import { MainHeaderElement } from "./MainHeaderElement";

@tag("app-main")
export class MainView extends HTMLElement {
  constructor() {
    super();
    this.replaceChildren(createElement(MainHeaderElement));
  }
}
