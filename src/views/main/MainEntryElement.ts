import "./MainEntryElement.css";
import { MainView } from "./MainView";
import {
  VaultEntry,
  entryColor,
  entryDisplayName,
  entryToCode,
} from "../../vault";
import { check, copy } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import { touchHoldFeedback } from "../../mixins/touchHoldFeedback";

@tag("app-main-entry")
export class MainEntryElement extends HTMLElement {
  private iconSpanElement: HTMLElement;
  private iconElement: HTMLElement;
  private nameElement: HTMLElement;
  private codeElement: HTMLElement;
  private timeout: any;
  private control?: AbortController;

  #entry?: VaultEntry;
  get entry(): VaultEntry | undefined {
    return this.#entry;
  }
  set entry(entry: VaultEntry | undefined) {
    this.#entry = entry;
    const displayName = entry ? entryDisplayName(entry) : "";
    this.iconElement.style.background = entry ? entryColor(entry) : "";
    this.iconSpanElement.innerText = entry ? displayName.charAt(0) : "";
    this.nameElement.textContent = displayName;
    if (document.contains(this)) this.syncCode();
  }

  constructor() {
    super();
    let button;
    this.replaceChildren(
      (button = createElement(
        "button",
        {
          onclick: this.onClick.bind(this),
          oncontextmenu: this.onContextmenu.bind(this),
        },
        [
          (this.iconElement = createElement("div", { className: "icon" }, [
            (this.iconSpanElement = createElement("span")),
            createElement("div", {
              className: "check",
              innerHTML: check(40),
            }),
            createElement("div", {
              className: "copy",
              innerHTML: copy(32),
            }),
          ])),
          createElement("div", { className: "content" }, [
            (this.nameElement = createElement("div", { className: "name" })),
            (this.codeElement = createElement("div", { className: "code" })),
          ]),
        ]
      ))
    );
    clickFeedback(button, { size: 2, contextmenu: true });
    touchHoldFeedback(button, { size: 2 });
  }

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    MainView.instance!.selected$.subscribe((selected) => {
      if (selected.includes(this.entry?.uuid!)) this.classList.add("selected");
      else this.classList.remove("selected");
    }, this.control);
    this.syncCode();
  }

  disconnectedCallback() {
    clearTimeout(this.timeout);
    this.control?.abort();
    delete this.control;
  }

  private onClick() {
    if (MainView.instance?.selected$.current().length) this.toggle();
    else {
      const code = this.entry && entryToCode(this.entry);
      if (!code || this.classList.contains("active")) return;
      this.classList.add("active");
      setTimeout(() => this.classList.remove("active"), 600);
      navigator.clipboard.writeText(code);
    }
  }

  private onContextmenu(event: Event) {
    event.preventDefault();
    this.toggle();
  }

  private toggle() {
    MainView.instance!.selected$.update((selected) => {
      if (selected.includes(this.entry?.uuid!))
        return selected.filter((uuid) => uuid !== this.entry?.uuid);
      else return [...selected, this.entry?.uuid!];
    });
  }

  private syncCode() {
    this.codeElement.innerText = "";
    if (!this.entry) return;
    const code = entryToCode(this.entry);
    const breakpoint = Math.floor(this.entry.digits / 2);
    this.codeElement.textContent =
      code.substring(0, breakpoint) + " " + code.substring(breakpoint);
    if (this.entry.type === "TOTP") {
      const now = Date.now();
      const period = this.entry.period * 1000;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.syncCode(), period - (now % period));
    }
  }
}
