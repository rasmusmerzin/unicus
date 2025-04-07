import "./ModalHeader.css";
import { backArrow } from "../icons";
import { clickFeedback } from "../mixins/clickFeedback";

@tag("app-modal-header")
export class ModalHeader extends HTMLElement {
  private actionsElement: HTMLElement;
  private titleElement: HTMLElement;

  get niche(): HTMLElement {
    return this.actionsElement;
  }
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
        }),
        { size: 0.5 }
      ),
      (this.titleElement = createElement("h2")),
      (this.actionsElement = createElement("div"))
    );
  }
}
