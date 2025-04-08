import "./DrawerModal.css";

@tag("app-drawer-modal")
export class DrawerModal extends HTMLElement {
  private mainElement: HTMLElement;
  private headerElement: HTMLElement;
  private contentElement: HTMLElement;

  get niche(): HTMLElement {
    return this.contentElement;
  }
  get title(): string {
    return this.headerElement.innerText;
  }
  set title(value: string) {
    this.headerElement.innerText = value;
  }

  constructor() {
    super();
    this.replaceChildren(
      (this.mainElement = createElement("main", {}, [
        (this.headerElement = createElement("h3", { className: "header" })),
        (this.contentElement = createElement("div", { className: "content" })),
      ]))
    );
    this.addEventListener("click", this.onClick.bind(this));
  }

  private onClick(event: MouseEvent) {
    if (this.mainElement.contains(event.target as Node)) return;
    history.back();
  }
}
