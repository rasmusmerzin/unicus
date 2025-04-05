import "./ModalHeader.css";
import { backArrow } from "../icons";
import { clickFeedback } from "../mixins/clickFeedback";

@tag("app-modal-header")
export class ModalHeader extends HTMLElement {
  niche: HTMLElement;
  private titleElement: HTMLElement;

  get title(): string {
    return this.titleElement.innerText;
  }
  set title(value: string) {
    this.titleElement.innerText = value;
  }

  constructor() {
    super();
    this.replaceChildren(
      clickFeedback(
        createElement("button", {
          innerHTML: backArrow(),
          onclick: () => history.back(),
        })
      ),
      (this.titleElement = createElement("h2")),
      (this.niche = createElement("div"))
    );
  }
}
