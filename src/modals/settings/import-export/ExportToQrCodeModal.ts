import "./ExportToQrCodeModal.css";
import encodeQR from "qr";
import { ModalHeader } from "../../../elements/ModalHeader";
import { chevronLeft, chevronRight } from "../../../icons";
import { clickFeedback } from "../../../mixins/clickFeedback";
import { entriesToMigrationUris, vault$ } from "../../../vault";
import { storeAuditEntry } from "../../../audit";

@tag("app-export-to-qr-code-modal")
export class ExportToQrCodeModal extends HTMLElement {
  private mainElement: HTMLElement;
  private indexElement: HTMLElement;
  private backwardButton: HTMLButtonElement;
  private forwardButton: HTMLButtonElement;
  private control?: AbortController;

  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "Migration QR Code" }),
      createElement("div", { className: "header" }, [
        createElement("p", {
          innerText:
            "Scan these QR codes with Unicus, Aegis or Google Authenticator to migrate your entries.",
        }),
        createElement("p", {
          innerText:
            "Included entries are the ones with types TOTP or HOTP, hash algorithms SHA1, SHA256, SHA512 or MD5 and digits 6 or 8. TOTP entries with period other than 30 seconds are ignored.",
        }),
      ]),
      (this.mainElement = createElement("main")),
      createElement("div", { className: "footer" }, [
        (this.backwardButton = clickFeedback(
          createElement("button", {
            innerHTML: chevronLeft(),
            onclick: this.scrollBackward.bind(this),
          }),
          { size: 0.5 }
        )),
        (this.indexElement = createElement("div", { className: "index" })),
        (this.forwardButton = clickFeedback(
          createElement("button", {
            innerHTML: chevronRight(),
            onclick: this.scrollForward.bind(this),
          }),
          { size: 0.5 }
        )),
      ])
    );
  }

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    this.mainElement.addEventListener("scroll", this.onScroll.bind(this), {
      passive: true,
      signal: this.control.signal,
    });
    const entries = vault$.current()?.entries || [];
    this.mainElement.replaceChildren(
      ...entriesToMigrationUris(entries).map(QrCodeCard)
    );
    this.onScroll();
    storeAuditEntry({
      type: "export",
      subtype: "qrcode",
      entries: entries.map(({ uuid, name, issuer }) => ({
        uuid,
        name,
        issuer,
      })),
    });
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
  }

  private scrollBackward() {
    const { width } = this.mainElement.getBoundingClientRect();
    this.mainElement.scrollBy({ left: -width });
  }

  private scrollForward() {
    const { width } = this.mainElement.getBoundingClientRect();
    this.mainElement.scrollBy({ left: width });
  }

  private onScroll() {
    this.renderCard();
    this.updateFooter();
  }

  private renderCard() {
    const { width } = this.mainElement.getBoundingClientRect();
    const { scrollLeft, children } = this.mainElement;
    const index = Math.ceil(scrollLeft / width);
    const child = children[index];
    const anchor = child?.querySelector("a");
    if (!anchor) return;
    if (!anchor.innerHTML) anchor.innerHTML = encodeQR(anchor.href, "svg");
  }

  private updateFooter() {
    const { width } = this.mainElement.getBoundingClientRect();
    const { scrollLeft, children } = this.mainElement;
    const index = Math.round(scrollLeft / width);
    this.indexElement.innerText = `${index + 1} / ${children.length} QR Codes`;
    this.backwardButton.disabled = index === 0;
    this.forwardButton.disabled = index === children.length - 1;
  }
}

function QrCodeCard(uri: string) {
  return createElement("div", { className: "card" }, [
    createElement("a", { href: uri, className: "img" }),
  ]);
}
