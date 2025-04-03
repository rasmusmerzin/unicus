import "./SetupView.css";
import { InputElement } from "./InputElement";
import { ButtonElement } from "./ButtonElement";

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
        oninput: () => this.validate(),
      })),
      (this.passcodeInput2 = createElement(InputElement, {
        type: "password",
        label: "Repeat passcode",
        oninput: () => this.validate(),
      })),
      (this.continueButton = createElement(ButtonElement, {
        textContent: "Continue",
        onclick: () => this.continue(),
      }))
    );
  }

  private continue() {
    if (!this.validate(true)) return;
    this.continueButton.loading = true;
    setTimeout(() => {
      this.continueButton.loading = false;
    }, 1000);
  }

  private validate(submit = false) {
    this.passcodeInput.error = "";
    this.passcodeInput2.error = "";
    if (
      (submit || this.passcodeInput.value) &&
      this.passcodeInput.value.length < 8
    )
      this.passcodeInput.error = "Passcode must be at least 8 characters";
    if (
      (submit || this.passcodeInput2.value) &&
      this.passcodeInput.value !== this.passcodeInput2.value
    )
      this.passcodeInput2.error = "Passcodes do not match";
    const valid = !(this.passcodeInput.error || this.passcodeInput2.error);
    this.continueButton.disabled = !valid;
    return valid;
  }
}
