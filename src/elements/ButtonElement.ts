import "./ButtonElement.css";
import { spinner } from "../icons";
import { clickFeedback } from "../mixins/click-feedback";

@tag("app-button")
export class ButtonElement extends HTMLElement {
  private buttonElement: HTMLButtonElement;

  get textContent(): string | null {
    return this.buttonElement.textContent;
  }
  set textContent(value: string | null) {
    this.buttonElement.textContent = value;
  }
  set onclick(value: (event: MouseEvent) => void) {
    this.buttonElement.onclick = value;
  }

  #loading = false;
  get loading(): boolean {
    return this.#loading;
  }
  set loading(value: boolean) {
    if (this.#loading === value) return;
    this.#loading = value;
    if (value) this.classList.add("loading");
    else this.classList.remove("loading");
    this.buttonElement.disabled = this.#disabled || this.#loading;
  }

  #disabled = false;
  get disabled(): boolean {
    return this.#disabled;
  }
  set disabled(value: boolean) {
    if (this.#disabled === value) return;
    this.#disabled = value;
    if (value) this.classList.add("disabled");
    else this.classList.remove("disabled");
    this.buttonElement.disabled = this.#disabled || this.#loading;
  }

  constructor() {
    super();
    this.replaceChildren(
      (this.buttonElement = clickFeedback(createElement("button"))),
      createElement("div", { className: "loader", innerHTML: spinner(16) })
    );
  }
}
