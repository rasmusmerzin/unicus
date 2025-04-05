import OTP from "otp";
import { clickFeedback } from "../../mixins/clickFeedback";
import { VaultEntry } from "../../vault";
import "./MainEntryElement.css";

@tag("app-main-entry")
export class MainEntryElement extends HTMLElement {
  private iconElement: HTMLElement;
  private nameElement: HTMLElement;
  private codeElement: HTMLElement;

  private timeout: any;
  private otp?: OTP;
  private code = "";
  #entry?: VaultEntry;
  get entry(): VaultEntry | undefined {
    return this.#entry;
  }
  set entry(entry: VaultEntry | undefined) {
    this.#entry = entry;
    this.otp =
      entry &&
      new OTP({
        name: this.getName(),
        keySize: entry.secret.length * 2,
        codeLength: entry.digits,
        secret: entry.secret,
        timeSlice: entry.type === "TOTP" ? entry.period : 0,
      });
    this.iconElement.innerText = entry
      ? this.getName().charAt(0).toUpperCase()
      : "";
    this.nameElement.textContent = this.getName(true);
    if (document.contains(this)) this.syncCode();
  }

  constructor() {
    super();
    this.replaceChildren(
      clickFeedback(
        createElement("button", {}, [
          (this.iconElement = createElement("div", { className: "icon" })),
          createElement("div", { className: "content" }, [
            (this.nameElement = createElement("div", { className: "name" })),
            (this.codeElement = createElement("div", { className: "code" })),
          ]),
        ])
      )
    );
  }

  connectedCallback() {
    this.syncCode();
  }

  disconnectedCallback() {
    clearTimeout(this.timeout);
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

  private getName(display = false): string {
    if (!this.entry) return "";
    let name = this.entry.issuer;
    if (this.entry.name) {
      if (name)
        name += display ? ` (${this.entry.name})` : `:${this.entry.name}`;
      else name = this.entry.name;
    }
    return name;
  }
}
