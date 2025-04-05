import "./FingerprintModal.css";
import { ButtonElement } from "../../elements/ButtonElement";
import { ModalHeader } from "../../elements/ModalHeader";
import { fingerprint } from "../../icons";
import {
  getFingerprintEncryptedSecret,
  removeFingerprintEncryptedSecret,
  saveSecretWithFingerprint,
} from "../../vault";

@tag("app-fingerprint-modal")
export class FingerprintModal extends HTMLElement {
  private mainElement: HTMLElement;

  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader),
      (this.mainElement = createElement("main"))
    );
  }

  connectedCallback() {
    if (getFingerprintEncryptedSecret()) this.renderManageView();
    else this.renderSetupView();
  }

  private renderSetupView() {
    this.fadeIn();
    this.mainElement.replaceChildren(
      createElement("div", { className: "icon", innerHTML: fingerprint(64) }),
      createElement("h1", { textContent: "Setup Fingerprint" }),
      createElement("p", {
        textContent:
          "Use your fingerprint to unlock your vault. This will not replace your passcode.",
      }),
      createElement(ButtonElement, {
        textContent: "Continue",
        onclick: this.setupFingerprint.bind(this),
      }),
      createElement("button", {
        textContent: "Cancel",
        onclick: () => history.back(),
      })
    );
  }

  private renderManageView() {
    this.fadeIn();
    this.mainElement.replaceChildren(
      createElement("div", { className: "icon", innerHTML: fingerprint(64) }),
      createElement("h1", { textContent: "Fingerprint Configured" }),
      createElement("p", {
        textContent:
          "Fingerprint has been configured. You can now use it to unlock your vault.",
      }),
      createElement(ButtonElement, {
        textContent: "Remove Fingerprint",
        color: "var(--error)",
        onclick: this.removeFingerprint.bind(this),
      }),
      createElement("button", {
        textContent: "Close",
        onclick: () => history.back(),
      })
    );
  }

  private async setupFingerprint() {
    try {
      await saveSecretWithFingerprint();
      this.renderManageView();
    } catch (error) {
      alert(error);
    }
  }

  private removeFingerprint() {
    removeFingerprintEncryptedSecret();
    this.renderSetupView();
  }

  private fadeIn() {
    this.mainElement.style.opacity = "0";
    this.mainElement.style.animation = "none";
    setTimeout(() => {
      this.mainElement.style.opacity = "";
      this.mainElement.style.animation = "fade-in 300ms";
    }, 10);
  }
}
