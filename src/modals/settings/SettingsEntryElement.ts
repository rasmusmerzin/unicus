import { SwitchElement } from "../../elements/SwitchElement";
import { clickFeedback } from "../../mixins/clickFeedback";
import "./SettingsEntryElement.css";

@tag("app-settings-entry")
export class SettingsEntryElement extends HTMLElement {
  private buttonElement: HTMLButtonElement;
  private nameElement: HTMLElement;
  private descriptionElement: HTMLElement;
  private switchElement: SwitchElement;

  get disabled(): boolean {
    return this.buttonElement.disabled;
  }
  set disabled(value: boolean) {
    this.buttonElement.disabled = value;
    this.switchElement.disabled = value;
  }
  get name(): string {
    return this.nameElement.innerText;
  }
  set name(value: string) {
    this.nameElement.innerText = value;
  }
  get description(): string {
    return this.descriptionElement.innerText;
  }
  set description(value: string) {
    this.descriptionElement.innerText = value;
  }
  get value(): boolean {
    return this.switchElement.value;
  }
  set value(value: boolean) {
    this.switchElement.value = value;
  }
  #type = "";
  get type(): string {
    return this.#type;
  }
  set type(value: string) {
    this.#type = value;
    if (value === "switch") this.buttonElement.append(this.switchElement);
    else this.switchElement.remove();
  }

  constructor() {
    super();
    this.replaceChildren(
      (this.buttonElement = clickFeedback(
        createElement("button", { onclick: this.onClick.bind(this) }, [
          createElement("div", { className: "info" }, [
            (this.nameElement = createElement("div", { className: "name" })),
            (this.descriptionElement = createElement("div", {
              className: "description",
            })),
          ]),
        ]),
        { size: 2 }
      ))
    );
    this.switchElement = createElement(SwitchElement);
  }

  private onClick(event: MouseEvent) {
    if (this.type === "switch") {
      if (event.target instanceof HTMLInputElement) return;
      else this.switchElement.value = !this.switchElement.value;
    }
  }
}
