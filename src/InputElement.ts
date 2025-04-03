import "./InputElement.css";
import { visibility, visibilityOff } from "./icons";

@tag("app-input")
export class InputElement extends HTMLElement {
  private labelElement: HTMLElement;
  private inputElement: HTMLInputElement;
  private errorElement: HTMLElement;
  private eyeElement: HTMLElement;

  get label(): string {
    return this.labelElement.innerText;
  }
  set label(value: string) {
    this.labelElement.innerText = value;
  }
  get value(): string {
    return this.inputElement.value;
  }
  set value(value: string) {
    this.inputElement.value = value;
    if (value) this.classList.remove("empty");
    else this.classList.add("empty");
  }
  get placeholder(): string {
    return this.inputElement.placeholder;
  }
  set placeholder(value: string) {
    this.inputElement.placeholder = value;
    if (value) this.classList.add("placeholder");
    else this.classList.remove("placeholder");
  }
  set oninput(value: (event: Event) => void) {
    this.inputElement.oninput = (event) => {
      this.onInput();
      value(event);
    };
  }
  get error(): string {
    return this.errorElement.innerText;
  }
  set error(value: string) {
    this.errorElement.innerText = value;
    if (value) this.classList.add("error");
    else this.classList.remove("error");
  }

  #type = "";
  get type(): string {
    return this.#type;
  }
  set type(value: string) {
    if (this.#type === value) return;
    this.#type = value;
    this.inputElement.type = value;
    if (value === "password") this.classList.add("password");
    else this.classList.remove("password");
  }

  constructor() {
    super();
    this.classList.add("empty");
    this.replaceChildren(
      (this.labelElement = createElement("label")),
      (this.inputElement = createElement("input", {
        oninput: () => this.onInput(),
        onfocus: () => this.onFocus(),
        onblur: () => this.onBlur(),
      })),
      (this.errorElement = createElement("div", { className: "error" })),
      (this.eyeElement = createElement("button", {
        tabindex: "-1",
        className: "eye",
        innerHTML: visibility(20),
        onclick: () => this.onEyeClick(),
      }))
    );
  }

  private onInput() {
    if (this.inputElement.value) this.classList.remove("empty");
    else this.classList.add("empty");
  }
  private onFocus() {
    this.classList.add("focus");
  }
  private onBlur() {
    this.classList.remove("focus");
  }
  private onEyeClick() {
    if (this.type !== "password") return;
    this.inputElement.type =
      this.inputElement.type === "password" ? "text" : "password";
    this.eyeElement.innerHTML =
      this.inputElement.type === "password"
        ? visibility(20)
        : visibilityOff(20);
  }
}
