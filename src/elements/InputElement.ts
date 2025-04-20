import "./InputElement.css";
import { visibility, visibilityOff } from "../icons";

@tag("app-input")
export class InputElement extends HTMLElement {
  private labelElement: HTMLElement;
  private inputElement: HTMLInputElement;
  private errorElement: HTMLElement;
  private eyeElement: HTMLElement;
  private uid = crypto.randomUUID();

  transformer: ((value: string) => string) | null = null;
  onpasswordshow: (() => void) | null = null;

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
  }
  get disabled(): boolean {
    return this.inputElement.disabled;
  }
  set disabled(value: boolean) {
    this.inputElement.disabled = value;
    if (value) this.classList.add("disabled");
    else this.classList.remove("disabled");
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
    if (value === "password") {
      this.classList.add("password");
      this.append(this.eyeElement);
    } else {
      this.classList.remove("password");
      this.eyeElement.remove();
    }
  }

  constructor() {
    super();
    this.classList.add("empty");
    this.replaceChildren(
      (this.labelElement = createElement("label", { for: this.uid })),
      (this.inputElement = createElement("input", {
        id: this.uid,
        spellcheck: false,
        oninput: this.onInput.bind(this),
        onfocus: this.onFocus.bind(this),
        onblur: this.onBlur.bind(this),
        onkeydown: this.onKeydown.bind(this),
      })),
      (this.errorElement = createElement("div", { className: "error" }))
    );
    this.eyeElement = createElement("button", {
      tabindex: "-1",
      className: "eye",
      innerHTML: visibility(20),
      onclick: this.onEyeClick.bind(this),
    });
  }

  focus() {
    this.inputElement.focus();
  }
  blur() {
    this.inputElement.blur();
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") this.dispatchEvent(new SubmitEvent("submit"));
    else if (event.key === "Escape") this.blur();
  }
  private onInput(event: Event) {
    event.stopPropagation();
    this.dispatchEvent(this.ownEvent(event));
    if (this.transformer) {
      const { selectionStart, selectionEnd, value } = this.inputElement;
      const newValue = this.transformer(value);
      this.inputElement.value = newValue;
      const shift = newValue.length - value.length;
      this.inputElement.setSelectionRange(
        (selectionStart || 0) + shift,
        (selectionEnd || 0) + shift
      );
    }
    if (this.inputElement.value) this.classList.remove("empty");
    else this.classList.add("empty");
  }
  private onFocus(event: FocusEvent) {
    this.dispatchEvent(this.ownEvent(event));
    this.classList.add("focus");
  }
  private onBlur(event: Event) {
    this.dispatchEvent(this.ownEvent(event));
    this.classList.remove("focus");
  }
  private onEyeClick() {
    if (this.type !== "password") return;
    this.inputElement.type =
      this.inputElement.type === "password" ? "text" : "password";
    const visible = this.inputElement.type === "text";
    this.eyeElement.innerHTML = visible ? visibilityOff(20) : visibility(20);
    if (visible) this.onpasswordshow?.();
  }
  private ownEvent(event: Event) {
    const { constructor } = Object.getPrototypeOf(event);
    return Object.defineProperties(new constructor(event.type), {
      ...Object.getOwnPropertyDescriptors(event),
      target: { get: () => this },
    });
  }
}
