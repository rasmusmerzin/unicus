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
import { getInputMode } from "../../env";

@tag("app-main-entry")
export class MainEntryElement extends HTMLElement {
  private iconSpanElement: HTMLElement;
  private iconElement: HTMLElement;
  private nameElement: HTMLElement;
  private codeElement: HTMLElement;
  private timeout: any;
  private control?: AbortController;

  index = 0;
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
          onmousedown: this.onMousedown.bind(this),
          ontouchstart: this.onTouchstart.bind(this),
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
    MainView.instance!.dragging$.subscribe((dragging) => {
      if (!dragging) return (this.style.transform = "");
      const { height } = this.getBoundingClientRect();
      const { originIndex, targetIndex } = dragging;
      if (this.index === originIndex) return;
      if (this.index < originIndex && this.index >= targetIndex)
        this.style.transform = `translateY(${height}px)`;
      else if (this.index > originIndex && this.index <= targetIndex)
        this.style.transform = `translateY(-${height}px)`;
      else this.style.transform = "";
    }, this.control);
    this.syncCode();
  }

  disconnectedCallback() {
    clearTimeout(this.timeout);
    this.control?.abort();
    delete this.control;
  }

  private onTouchstart(event: TouchEvent) {
    const selected = MainView.instance!.selected$.current();
    if (selected.length !== 1 || selected[0] !== this.entry!.uuid) return;
    this.parentElement!.style.overflow = "hidden";
    let started = false;
    const startY = event.touches[0].clientY;
    const control = new AbortController();
    const { height } = this.getBoundingClientRect();
    const cleanup = () => {
      control.abort();
      this.style.pointerEvents = "";
      this.style.transform = "";
      this.style.transition = "";
      this.style.zIndex = "";
      this.parentElement!.style.overflow = "";
      MainView.instance!.dragging$.next(null);
    };
    const move = (event: TouchEvent) => {
      const deltaY = event.touches[0].clientY - startY;
      if (!started && Math.abs(deltaY) < 8) return;
      started = true;
      this.style.pointerEvents = "none";
      this.style.transform = `translateY(${deltaY}px)`;
      this.style.transition = "none";
      this.style.zIndex = "10";
      const originIndex = this.index;
      const targetIndex = Math.round((this.index * height + deltaY) / height);
      const dragging = MainView.instance!.dragging$.current();
      if (dragging?.targetIndex !== targetIndex)
        MainView.instance!.dragging$.next({ originIndex, targetIndex });
    };
    this.control?.signal.addEventListener("abort", cleanup, control);
    addEventListener("touchend", cleanup, control);
    addEventListener("touchcancel", cleanup, control);
    addEventListener("touchmove", move, control);
  }

  private onMousedown(event: MouseEvent) {
    if (getInputMode() === "touch") return;
    let started = false;
    const startY = event.clientY;
    const control = new AbortController();
    const { height } = this.getBoundingClientRect();
    const cleanup = () => {
      control.abort();
      this.style.pointerEvents = "";
      this.style.transform = "";
      this.style.transition = "";
      this.style.zIndex = "";
      MainView.instance!.dragging$.next(null);
    };
    const move = (event: MouseEvent) => {
      const deltaY = event.clientY - startY;
      if (!started && Math.abs(deltaY) < 8) return;
      started = true;
      this.style.pointerEvents = "none";
      this.style.transform = `translateY(${deltaY}px)`;
      this.style.transition = "none";
      this.style.zIndex = "10";
      const originIndex = this.index;
      const targetIndex = Math.round((this.index * height + deltaY) / height);
      const dragging = MainView.instance!.dragging$.current();
      if (dragging?.targetIndex !== targetIndex)
        MainView.instance!.dragging$.next({ originIndex, targetIndex });
    };
    this.control?.signal.addEventListener("abort", cleanup, control);
    addEventListener("mouseup", cleanup, control);
    addEventListener("mousemove", move, control);
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
