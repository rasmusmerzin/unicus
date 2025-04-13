import "./SwitchElement.css";

@tag("app-switch")
export class SwitchElement extends HTMLElement {
  private inputElement: HTMLInputElement;

  get disabled(): boolean {
    return this.inputElement.disabled;
  }
  set disabled(value: boolean) {
    this.inputElement.disabled = value;
    if (value) this.classList.add("disabled");
    else this.classList.remove("disabled");
  }
  get value(): boolean {
    return this.inputElement.checked;
  }
  set value(value: boolean) {
    this.inputElement.checked = value;
    if (value) this.classList.add("checked");
    else this.classList.remove("checked");
  }

  constructor() {
    super();
    this.replaceChildren(
      (this.inputElement = createElement("input", {
        type: "checkbox",
        onchange: this.onChange.bind(this),
      }))
    );
  }

  private onChange() {
    if (this.value) this.classList.add("checked");
    else this.classList.remove("checked");
    this.dispatchEvent(new Event("change"));
  }
}
