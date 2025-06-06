import "./FloatingModal.css";
import { clickFeedback } from "../mixins/clickFeedback";

export interface Action {
  name: string;
  onclick?: (event: MouseEvent) => any;
}

@tag("app-floating-modal")
export class FloatingModal extends HTMLElement {
  private mainElement: HTMLElement;
  private contentElement: HTMLElement;
  private headerElement: HTMLElement;
  private actionsElement: HTMLElement;

  get niche(): HTMLElement {
    return this.contentElement;
  }
  get title(): string {
    return this.headerElement.innerText;
  }
  set title(value: string) {
    this.headerElement.innerText = value;
  }
  get innerText(): string {
    return this.contentElement.innerText;
  }
  set innerText(value: string) {
    this.contentElement.innerText = value;
  }
  get innerHTML(): string {
    return this.contentElement.innerHTML;
  }
  set innerHTML(value: string) {
    this.contentElement.innerHTML = value;
  }
  get textContent(): string | null {
    return this.contentElement.textContent;
  }
  set textContent(value: string | null) {
    this.contentElement.textContent = value;
  }
  get actions(): Action[] {
    return Array.from(this.actionsElement.childNodes, (node: any) => ({
      name: node.innerText,
      onclick: node.onclick,
    }));
  }
  set actions(value: Action[]) {
    this.actionsElement.replaceChildren(
      ...value.map((action) =>
        clickFeedback(
          createElement("button", {
            className: action.name.toLowerCase().replace(/\s+/g, "-"),
            innerText: action.name,
            async onclick(event: MouseEvent) {
              await action.onclick?.(event);
              history.back();
            },
          })
        )
      )
    );
  }
  #ondisconnect: (() => any) | null = null;
  get ondisconnect(): (() => any) | null {
    return this.#ondisconnect;
  }
  set ondisconnect(value: (() => any) | null) {
    this.#ondisconnect = value;
  }

  constructor() {
    super();
    this.replaceChildren(
      (this.mainElement = createElement("main", {}, [
        (this.headerElement = createElement("h2", { className: "header" })),
        (this.contentElement = createElement("div", { className: "content" })),
        (this.actionsElement = createElement("div", { className: "actions" })),
      ]))
    );
    this.actions = [{ name: "OK" }];
    this.addEventListener("click", this.onClick.bind(this));
  }

  getActionButton(name: string): HTMLButtonElement | null {
    const className = `button.${name.toLowerCase().replace(/\s+/g, "-")}`;
    return this.actionsElement.querySelector(className);
  }

  disconnectedCallback() {
    this.ondisconnect?.();
  }

  private onClick(event: MouseEvent) {
    if (this.mainElement.contains(event.target as Node)) return;
    history.back();
  }
}
