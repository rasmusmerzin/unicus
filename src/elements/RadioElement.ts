import "./RadioElement.css";
import { clickFeedback } from "../mixins/clickFeedback";

@tag("app-radio")
export class RadioElement extends HTMLElement {
  private buttonElement: HTMLButtonElement;
  private inputElement: HTMLInputElement;
  private labelElement: HTMLLabelElement;

  get label(): string {
    return this.labelElement.innerText;
  }
  set label(value: string) {
    this.labelElement.innerText = value;
  }
  get name(): string {
    return this.inputElement.name;
  }
  set name(value: string) {
    this.inputElement.name = value;
    this.inputElement.id = `${value}-${this.inputElement.value}`;
    this.labelElement.setAttribute("for", this.inputElement.id);
  }
  get value(): string {
    return this.inputElement.value;
  }
  set value(value: string) {
    this.inputElement.value = value;
    this.inputElement.id = `${this.inputElement.name}-${value}`;
    this.labelElement.setAttribute("for", this.inputElement.id);
  }
  get checked(): boolean {
    return this.inputElement.checked;
  }
  set checked(value: boolean) {
    this.inputElement.checked = value;
  }
  get onchange(): ((event: Event) => any) | null {
    return this.inputElement.onchange;
  }
  set onchange(value: ((event: Event) => any) | null) {
    this.inputElement.onchange = value;
  }

  constructor() {
    super();
    this.replaceChildren(
      clickFeedback(
        (this.buttonElement = createElement(
          "button",
          {
            tabIndex: -1,
            onclick: (event) => {
              if (event.target !== this.buttonElement) return;
              this.inputElement.checked = true;
              this.inputElement.dispatchEvent(new Event("change"));
            },
          },
          [
            (this.inputElement = createElement("input", { type: "radio" })),
            (this.labelElement = createElement("label")),
          ]
        ))
      )
    );
  }
}
