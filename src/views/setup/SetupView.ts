import "./SetupView.css";
import { InputElement } from "../../elements/InputElement";
import { ButtonElement } from "../../elements/ButtonElement";
import { saveVault, secretCell, vaultCell } from "../../vault";
import { deriveKey } from "../../crypto";
import { updateView } from "../../view";
import { FingerprintView } from "../fingerprint/FingerprintView";

@tag("app-setup")
export class SetupView extends HTMLElement {
  private passcodeInput: InputElement;
  private passcodeInput2: InputElement;
  private continueButton: ButtonElement;

  constructor() {
    super();
    this.replaceChildren(
      createElement("h1", { textContent: "Setup Vault" }),
      createElement("p", {
        textContent:
          "Create a passcode which will be used to encrypt and decrypt your app data.",
      }),
      (this.passcodeInput = createElement(InputElement, {
        type: "password",
        label: "Passcode",
        onenter: this.continue.bind(this),
        oninput: () => {
          this.passcodeInput.error = "";
          this.passcodeInput2.error = "";
          this.continueButton.disabled = false;
        },
      })),
      (this.passcodeInput2 = createElement(InputElement, {
        type: "password",
        label: "Repeat passcode",
        onenter: this.continue.bind(this),
        oninput: () => {
          this.passcodeInput2.error = "";
          this.continueButton.disabled = false;
        },
      })),
      (this.continueButton = createElement(ButtonElement, {
        textContent: "Continue",
        onclick: this.continue.bind(this),
      }))
    );
  }

  private async continue() {
    if (!this.validate()) return;
    try {
      this.continueButton.loading = true;
      secretCell.value = await deriveKey(this.passcodeInput.value);
      vaultCell.value = {};
      await saveVault();
      await updateView({ viewConstructor: FingerprintView });
    } catch (error) {
      alert(error);
    } finally {
      this.continueButton.loading = false;
    }
  }

  private validate() {
    this.passcodeInput.error = "";
    this.passcodeInput2.error = "";
    if (this.passcodeInput.value.length < 8)
      this.passcodeInput.error = "Passcode must be at least 8 characters";
    if (this.passcodeInput.value !== this.passcodeInput2.value)
      this.passcodeInput2.error = "Passcodes do not match";
    const valid = !(this.passcodeInput.error || this.passcodeInput2.error);
    this.continueButton.disabled = !valid;
    return valid;
  }
}
