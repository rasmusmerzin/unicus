import "./UnlockView.css";
import { ButtonElement } from "../../elements/ButtonElement";
import { InputElement } from "../../elements/InputElement";
import {
  getFingerprintEncryptedSecret,
  openSecretWithFingerprint,
  openVault,
  secretCell,
} from "../../vault";
import { deriveKey } from "../../crypto";
import { updateView } from "../../view";
import { clickFeedback } from "../../mixins/clickFeedback";
import { fingerprint } from "../../icons";

@tag("app-unlock")
export class UnlockView extends HTMLElement {
  private passcodeInput: InputElement;
  private continueButton: ButtonElement;

  constructor() {
    super();
    this.replaceChildren(
      createElement("h1", { textContent: "Unlock Vault" }),
      (this.passcodeInput = createElement(InputElement, {
        type: "password",
        label: "Passcode",
        onenter: this.continue.bind(this),
        oninput: () => {
          this.continueButton.disabled = false;
          this.passcodeInput.error = "";
        },
      })),
      (this.continueButton = createElement(ButtonElement, {
        textContent: "Continue",
        onclick: this.continue.bind(this),
      }))
    );
    if (getFingerprintEncryptedSecret())
      this.append(
        clickFeedback(
          createElement("button", {
            className: "fingerprint",
            innerHTML: fingerprint(32),
            onclick: this.promptFingerprint.bind(this),
          })
        )
      );
  }

  connectedCallback() {
    this.passcodeInput.focus();
    this.promptFingerprint();
  }

  private async promptFingerprint() {
    if (!getFingerprintEncryptedSecret()) return;
    const secret = await openSecretWithFingerprint();
    if (!secret) return;
    await openVault();
    updateView();
  }

  private async continue() {
    try {
      this.continueButton.loading = true;
      secretCell.value = await deriveKey(this.passcodeInput.value);
      await openVault();
      updateView();
    } catch (error) {
      this.continueButton.disabled = true;
      this.passcodeInput.error = "Invalid passcode";
    } finally {
      this.continueButton.loading = false;
    }
  }
}
