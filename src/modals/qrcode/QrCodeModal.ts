import "./QrCodeModal.css";
import encodeQR from "qr";
import { ButtonElement } from "../../elements/ButtonElement";
import { ModalHeader } from "../../elements/ModalHeader";
import { VaultEntry, entryToUri } from "../../vault";
import { chevronLeft, chevronRight } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";

@tag("app-qr-code-modal")
export class QrCodeModal extends HTMLElement {
  private mainElement: HTMLElement;
  private indexElement: HTMLElement;
  private backwardButton: HTMLButtonElement;
  private forwardButton: HTMLButtonElement;
  private control?: AbortController;

  set entries(entries: VaultEntry[]) {
    this.mainElement.replaceChildren(...entries.map(QrCodeCard));
    this.mainElement.scrollTo({ left: 0, behavior: "instant" });
    if (document.contains(this)) this.onScroll();
  }

  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "QR Code" }),
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
    addEventListener("keydown", this.onKeydown.bind(this), this.control);
    this.onScroll();
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") this.scrollBackward();
    else if (event.key === "ArrowRight") this.scrollForward();
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

function QrCodeCard(entry: VaultEntry) {
  let button: ButtonElement;
  const uri = entryToUri(entry);
  return createElement("div", { className: "card" }, [
    createElement("a", { href: uri, className: "img" }),
    createElement("h2", { className: "issuer", innerText: entry.issuer }),
    createElement("div", { className: "name", innerText: entry.name }),
    (button = createElement(ButtonElement, {
      textContent: "Copy URI",
      async onclick() {
        const start = Date.now();
        try {
          button.loading = true;
          await navigator.clipboard.writeText(uri);
        } finally {
          await new Promise((r) => setTimeout(r, 400 - (Date.now() - start)));
          button.loading = false;
        }
      },
    })),
  ]);
}
