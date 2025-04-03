import "./SetupView.css";
import { InputElement } from "../elements/InputElement";
import { ButtonElement } from "../elements/ButtonElement";
import { SALT, saveVault, secretCell, vaultCell } from "../vault";
import { deriveKey } from "../crypto";
import { updateView } from "../main";

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
        oninput: () => (this.passcodeInput.error = ""),
      })),
      (this.passcodeInput2 = createElement(InputElement, {
        type: "password",
        label: "Repeat passcode",
        oninput: () => (this.passcodeInput2.error = ""),
      })),
      (this.continueButton = createElement(ButtonElement, {
        textContent: "Continue",
        onclick: () => this.continue(),
      }))
    );
  }

  private async continue() {
    if (!this.validate()) return;
    try {
      this.continueButton.loading = true;
      secretCell.value = await deriveKey(this.passcodeInput.value, SALT);
      vaultCell.value = {};
      await saveVault();
      updateView();
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
    return valid;
  }
}
