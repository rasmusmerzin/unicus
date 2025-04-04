import "./UnlockView.css";
import { ButtonElement } from "../elements/ButtonElement";
import { InputElement } from "../elements/InputElement";
import { openVault, SALT, secretCell } from "../vault";
import { deriveKey } from "../crypto";
import { updateView } from "../view";

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
      })),
      (this.continueButton = createElement(ButtonElement, {
        textContent: "Continue",
        onclick: () => this.continue(),
      }))
    );
  }

  async continue() {
    try {
      this.continueButton.loading = true;
      secretCell.value = await deriveKey(this.passcodeInput.value, SALT);
      await openVault();
      updateView();
    } catch (error) {
      alert(error);
    } finally {
      this.continueButton.loading = false;
    }
  }
}
