import { InputElement } from "../../elements/InputElement";
import { ModalHeader } from "../../elements/ModalHeader";
import { check } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import { addVaultEntry, VaultEntry } from "../../vault";
import { updateView } from "../../view";
import "./ManualAddModal.css";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

@tag("app-manual-add-modal")
export class ManualAddModal extends HTMLElement {
  private nameInput: InputElement;
  private issuerInput: InputElement;
  private secretInput: InputElement;
  private typeInput: InputElement;
  private hashInput: InputElement;
  private digitsInput: InputElement;
  private periodInput: InputElement;
  private counterInput: InputElement;
  private submitButton: HTMLButtonElement;

  constructor() {
    super();
    this.replaceChildren(
      createElement(
        ModalHeader,
        { title: "Add new entry" },
        clickFeedback(
          (this.submitButton = createElement("button", {
            innerHTML: check(28),
            onclick: this.submit.bind(this),
          }))
        )
      ),
      createElement("main", {}, [
        (this.nameInput = createElement(InputElement, {
          label: "Name",
          onsubmit: this.submit.bind(this),
        })),
        (this.issuerInput = createElement(InputElement, {
          label: "Issuer",
          onsubmit: this.submit.bind(this),
        })),
        (this.secretInput = createElement(InputElement, {
          label: "Secret",
          type: "password",
          onsubmit: this.submit.bind(this),
          oninput: this.onInputClearError.bind(this),
          transformer: (value: string) =>
            value
              .toUpperCase()
              .split("")
              .filter((c) => BASE32.includes(c))
              .join(""),
        })),
        createElement("div", {}, [
          (this.typeInput = createElement(InputElement, {
            type: "select",
            label: "Type",
            value: "TOTP",
            disabled: true,
            oninput: this.syncType.bind(this),
          })),
          (this.hashInput = createElement(InputElement, {
            type: "select",
            label: "Hash",
            value: "SHA1",
            disabled: true,
          })),
        ]),
        createElement("div", {}, [
          (this.periodInput = createElement(InputElement, {
            className: "period",
            label: "Period",
            type: "number",
            value: "30",
            onsubmit: this.submit.bind(this),
            oninput: this.onInputClearError.bind(this),
          })),
          (this.counterInput = createElement(InputElement, {
            className: "counter",
            label: "Counter",
            type: "number",
            value: "0",
            onsubmit: this.submit.bind(this),
            oninput: this.onInputClearError.bind(this),
          })),
          (this.digitsInput = createElement(InputElement, {
            label: "Digits",
            type: "number",
            value: "6",
            onsubmit: this.submit.bind(this),
            oninput: this.onInputClearError.bind(this),
          })),
        ]),
      ])
    );
    this.syncType();
  }

  private syncType() {
    this.setAttribute("type", this.typeInput.value);
  }

  private async submit() {
    if (!this.validate()) return;
    try {
      await addVaultEntry(this.getVaultEntry());
      await updateView({ force: true, duration: 0 });
    } catch (error) {
      alert(error);
    }
  }

  private getVaultEntry(): VaultEntry {
    const uuid = crypto.randomUUID();
    const name = this.nameInput.value.trim();
    const issuer = this.issuerInput.value.trim();
    const secret = this.secretInput.value;
    const hash = this.hashInput.value as VaultEntry["hash"];
    const digits = parseInt(this.digitsInput.value);
    const type = this.typeInput.value as VaultEntry["type"];
    const period = parseInt(this.periodInput.value);
    const counter = parseInt(this.counterInput.value);
    if (type === "TOTP")
      return { uuid, name, issuer, secret, hash, digits, type, period };
    else if (type === "HOTP")
      return { uuid, name, issuer, secret, hash, digits, type, counter };
    else throw new Error("Invalid type");
  }

  private onInputClearError(event: Event) {
    if (event.target instanceof InputElement) event.target.error = "";
    this.submitButton.disabled = this.hasErrors();
  }

  private validate() {
    this.secretInput.error =
      this.digitsInput.error =
      this.periodInput.error =
      this.counterInput.error =
        "";
    if (!this.secretInput.value) this.secretInput.error = "Secret is required";
    else if (![16, 32].includes(this.secretInput.value.length))
      this.secretInput.error = "Secret must be 16 or 32 characters";
    if (!this.digitsInput.value) this.digitsInput.error = "Digits is required";
    if (this.typeInput.value === "TOTP") {
      if (!this.periodInput.value)
        this.periodInput.error = "Period is required";
      else if (!(parseInt(this.periodInput.value) > 0))
        this.periodInput.error = "Period must be greater than 0";
    } else if (this.typeInput.value === "HOTP") {
      if (!this.counterInput.value)
        this.counterInput.error = "Counter is required";
      else if (!(parseInt(this.counterInput.value) >= 0))
        this.counterInput.error = "Counter must be not negative";
    }
    return !(this.submitButton.disabled = this.hasErrors());
  }

  private hasErrors() {
    return !!(
      this.secretInput.error ||
      this.digitsInput.error ||
      this.periodInput.error ||
      this.counterInput.error
    );
  }
}
