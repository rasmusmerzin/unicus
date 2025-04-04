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
        oninput: () => {
          this.continueButton.disabled = false;
          this.passcodeInput.error = "";
        },
        onenter: this.continue.bind(this),
      })),
      (this.continueButton = createElement(ButtonElement, {
        textContent: "Continue",
        onclick: this.continue.bind(this),
      }))
    );
  }

  connectedCallback() {
    this.passcodeInput.focus();
  }

  async continue() {
    try {
      this.continueButton.loading = true;
      secretCell.value = await deriveKey(this.passcodeInput.value, SALT);
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
