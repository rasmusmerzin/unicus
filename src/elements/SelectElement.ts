import "./SelectElement.css";

@tag("app-select")
export class SelectElement extends HTMLElement {
  private labelElement: HTMLElement;
  private selectElement: HTMLSelectElement;
  private errorElement: HTMLElement;
  private uid = crypto.randomUUID();

  get label(): string {
    return this.labelElement.innerText;
  }
  set label(value: string) {
    this.labelElement.innerText = value;
  }
  get name(): string {
    return this.selectElement.name;
  }
  set name(value: string) {
    this.selectElement.name = value;
  }
  get disabled(): boolean {
    return this.selectElement.disabled;
  }
  set disabled(value: boolean) {
    this.selectElement.disabled = value;
    if (value) this.classList.add("disabled");
    else this.classList.remove("disabled");
  }
  get value(): string {
    return this.selectElement.value;
  }
  set value(value: string) {
    if (this.selectElement.value === value) return;
    this.selectElement.value = value;
    this.onChange();
  }
  get error(): string {
    return this.errorElement.innerText;
  }
  set error(value: string) {
    this.errorElement.innerText = value;
    if (value) this.classList.add("error");
    else this.classList.remove("error");
  }
  get options(): { value: string; label?: string }[] {
    return Array.from(
      this.selectElement.querySelectorAll("option"),
      (child) => ({
        value: child.value,
        label: child.innerText === child.value ? undefined : child.innerText,
      })
    );
  }
  set options(value: { value: string; label?: string }[]) {
    const options = value.map(({ value, label }) =>
      createElement("option", { value }, label || value)
    );
    this.selectElement.replaceChildren(...options);
    this.onChange();
  }

  constructor() {
    super();
    this.classList.add("empty");
    this.replaceChildren(
      (this.labelElement = createElement("label", { for: this.uid })),
      (this.selectElement = createElement("select", {
        id: this.uid,
        onblur: this.onBlur.bind(this),
        onchange: this.onChange.bind(this),
        onfocus: this.onFocus.bind(this),
      })),
      (this.errorElement = createElement("div", { className: "error" }))
    );
  }

  private onBlur() {
    this.classList.remove("focus");
  }
  private onFocus() {
    this.classList.add("focus");
  }
  private onChange(event?: Event) {
    event?.stopPropagation();
    this.dispatchEvent(new CustomEvent("change", { bubbles: true }));
    if (this.value) this.classList.remove("empty");
    else this.classList.add("empty");
  }
}
