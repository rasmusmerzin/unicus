import "./FingerprintView.css";
import { ButtonElement } from "../../elements/ButtonElement";
import { fingerprint } from "../../icons";
import {
  getFingerprintEncryptedSecret,
  removeFingerprintEncryptedSecret,
  saveSecretWithFingerprint,
} from "../../vault";

@tag("app-fingerprint")
export class FingerprintView extends HTMLElement {
  connectedCallback() {
    if (getFingerprintEncryptedSecret()) this.renderManageView();
    else this.renderSetupView();
  }

  private renderSetupView() {
    this.replaceChildren(
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
    this.replaceChildren(
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
}
