import OTP from "otp";
import { clickFeedback } from "../../mixins/clickFeedback";
import { VaultEntry } from "../../vault";
import "./MainEntryElement.css";
import { check, copy } from "../../icons";
import { MainView } from "./MainView";

@tag("app-main-entry")
export class MainEntryElement extends HTMLElement {
  private iconSpanElement: HTMLElement;
  private nameElement: HTMLElement;
  private codeElement: HTMLElement;

  private timeout: any;
  private otp?: OTP;
  private code = "";
  private control?: AbortController;

  #entry?: VaultEntry;
  get entry(): VaultEntry | undefined {
    return this.#entry;
  }
  set entry(entry: VaultEntry | undefined) {
    this.#entry = entry;
    this.otp =
      entry &&
      new OTP({
        name: this.getEntrySerializedName(),
        keySize: entry.secret.length * 2,
        codeLength: entry.digits,
        secret: entry.secret,
        timeSlice: entry.type === "TOTP" ? entry.period : 0,
      });
    this.iconSpanElement.innerText = entry
      ? this.getEntryDisplayName().charAt(0).toUpperCase()
      : "";
    this.nameElement.textContent = this.getEntryDisplayName();
    if (document.contains(this)) this.syncCode();
  }

  constructor() {
    super();
    this.replaceChildren(
      clickFeedback(
        createElement(
          "button",
          {
            onclick: this.onClick.bind(this),
            oncontextmenu: this.onContextmenu.bind(this),
          },
          [
            createElement("div", { className: "icon" }, [
              (this.iconSpanElement = createElement("span")),
              createElement("div", {
                className: "check",
                innerHTML: check(40),
              }),
              createElement("div", {
                className: "copy",
                innerHTML: copy(32),
              }),
            ]),
            createElement("div", { className: "content" }, [
              (this.nameElement = createElement("div", { className: "name" })),
              (this.codeElement = createElement("div", { className: "code" })),
            ]),
          ]
        ),
        { size: 2 }
      )
    );
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
      if (!this.code || this.classList.contains("active")) return;
      this.classList.add("active");
      setTimeout(() => this.classList.remove("active"), 600);
      navigator.clipboard.writeText(this.code);
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
    if (!this.otp || !this.entry) return;
    this.code = "";
    if (this.entry.type === "TOTP") {
      const now = Date.now();
      const period = this.entry.period * 1000;
      this.code = this.otp.totp(now);
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.syncCode(), period - (now % period));
    } else if (this.entry.type === "HOTP")
      this.code = this.otp.hotp(this.entry.counter);
    const breakpoint = Math.floor(this.entry.digits / 2);
    this.codeElement.textContent =
      this.code.substring(0, breakpoint) +
      " " +
      this.code.substring(breakpoint);
  }

  private getEntrySerializedName(): string {
    if (!this.entry) return "";
    const name = this.entry.name.trim();
    const issuer = this.entry.issuer.trim();
    return `${issuer}:${name}`;
  }

  private getEntryDisplayName(): string {
    if (!this.entry) return "";
    const name = this.entry.name.trim();
    const issuer = this.entry.issuer.trim();
    if (issuer && name) return `${issuer} (${name})`;
    else return issuer || name;
  }
}
