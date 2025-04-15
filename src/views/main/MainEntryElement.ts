import "./MainEntryElement.css";
import { MainView } from "./MainView";
import {
  VaultEntry,
  entryColor,
  entryDisplayName,
  entryIconUrl,
  entryToCode,
  saveEntryIcon,
} from "../../vault";
import { check, copy, drag } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import { touchHoldFeedback } from "../../mixins/touchHoldFeedback";
import { getInputMode } from "../../env";
import { MainContentElement } from "./MainContentElement";
import { settings$ } from "../../settings";

@tag("app-main-entry")
export class MainEntryElement extends HTMLElement {
  private iconSpanElement: HTMLElement;
  private iconImageElement: HTMLElement;
  private iconElement: HTMLElement;
  private nameElement: HTMLElement;
  private issuerElement: HTMLElement;
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
    this.issuerElement.textContent = entry?.issuer || "";
    this.nameElement.textContent = entry?.name || "";
    if (entry?.name && !entry.issuer) {
      this.issuerElement.textContent = entry.name;
      this.nameElement.textContent = "";
    }
    this.iconImageElement.style.background = entry
      ? `url(${entryIconUrl(entry)})`
      : "";
    if (entry && import.meta.env.PROD) saveEntryIcon(entry);
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
            (this.iconImageElement = createElement("div", {
              className: "image",
            })),
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
            createElement("div", { className: "identifier" }, [
              (this.issuerElement = createElement("span", {
                className: "issuer",
              })),
              (this.nameElement = createElement("span", { className: "name" })),
            ]),
            (this.codeElement = createElement("div", { className: "code" })),
          ]),
          createElement("div", { className: "drag", innerHTML: drag() }),
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
      this.updateDraggable();
    }, this.control);
    MainView.instance!.search$.subscribe(
      this.updateDraggable.bind(this),
      this.control
    );
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
    settings$.subscribe((settings) => {
      const { hideIcons, indicateExpiring, namePlacement } = settings;
      if (hideIcons) this.classList.add("hide-icon");
      else this.classList.remove("hide-icon");
      if (indicateExpiring) this.classList.add("indicate-expiring");
      else this.classList.remove("indicate-expiring");
      this.setAttribute("name-placement", namePlacement || "right");
    }, this.control);
  }

  disconnectedCallback() {
    clearTimeout(this.timeout);
    this.control?.abort();
    delete this.control;
  }

  private updateDraggable() {
    const selected = MainView.instance!.selected$.current();
    const search = MainView.instance!.search$.current();
    if (
      selected.length === 1 &&
      selected[0] === this.entry?.uuid &&
      search === null
    )
      this.classList.add("draggable");
    else this.classList.remove("draggable");
  }

  private onTouchstart(event: TouchEvent) {
    if (!this.classList.contains("draggable")) return;
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
    if (!this.classList.contains("draggable")) return;
    if (getInputMode() === "touch") return;
    const control = new AbortController();
    const parent = this.parentElement as MainContentElement;
    const { height } = this.getBoundingClientRect();
    const startY = event.clientY;
    const startScrollTop = parent.scrollTop;
    let started = false;
    let currentY = startY;
    let scrollTop = startScrollTop;
    const cleanup = () => {
      control.abort();
      this.style.pointerEvents = "";
      this.style.transform = "";
      this.style.transition = "";
      this.style.zIndex = "";
      MainView.instance!.dragging$.next(null);
    };
    const move = () => {
      const deltaY = currentY - startY + scrollTop - startScrollTop;
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
    const onmove = (event: MouseEvent) => {
      currentY = event.clientY;
      move();
    };
    const onscroll = () => {
      scrollTop = parent.scrollTop;
      move();
    };
    this.control?.signal.addEventListener("abort", cleanup, control);
    addEventListener("mouseup", cleanup, control);
    addEventListener("mousemove", onmove, control);
    parent.addEventListener("scroll", onscroll, {
      passive: true,
      capture: true,
      signal: control.signal,
    });
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
    this.classList.remove("error", "blink");
    this.codeElement.innerText = "";
    if (!this.entry) return;
    const code = entryToCode(this.entry);
    const breakpoint = Math.floor(this.entry.digits / 2);
    this.codeElement.textContent =
      code.substring(0, breakpoint) + " " + code.substring(breakpoint);
    if (this.entry.type === "TOTP") {
      const now = Date.now();
      const period = this.entry.period * 1000;
      const untilNext = period - (now % period);
      clearTimeout(this.timeout);
      setTimeout(() => this.classList.add("error"), untilNext - 5000);
      setTimeout(() => this.classList.add("blink"), untilNext - 3000);
      this.timeout = setTimeout(() => this.syncCode(), untilNext);
    }
  }
}
