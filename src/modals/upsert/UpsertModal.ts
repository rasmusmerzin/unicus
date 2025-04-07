import "./UpsertModal.css";
import { InputElement } from "../../elements/InputElement";
import { ModalHeader } from "../../elements/ModalHeader";
import { deleteVaultEntry, upsertVaultEntry, VaultEntry } from "../../vault";
import { check, trash } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

@tag("app-upsert-modal")
export class UpsertModal extends HTMLElement {
  private headerElement: ModalHeader;
  private nameInput: InputElement;
  private issuerInput: InputElement;
  private secretInput: InputElement;
  private typeInput: InputElement;
  private hashInput: InputElement;
  private digitsInput: InputElement;
  private periodInput: InputElement;
  private counterInput: InputElement;
  private submitButton: HTMLButtonElement;

  get title(): string {
    return this.headerElement.title;
  }
  set title(value: string) {
    this.headerElement.title = value;
  }
  get deletable(): boolean {
    return this.classList.contains("deletable");
  }
  set deletable(value: boolean) {
    if (value) this.classList.add("deletable");
    else this.classList.remove("deletable");
  }

  uuid = crypto.randomUUID();
  get name(): string {
    return this.nameInput.value;
  }
  set name(value: string) {
    this.nameInput.value = value;
  }
  get issuer(): string {
    return this.issuerInput.value;
  }
  set issuer(value: string) {
    this.issuerInput.value = value;
  }
  get secret(): string {
    return this.secretInput.value;
  }
  set secret(value: string) {
    this.secretInput.value = value;
  }
  get type(): VaultEntry["type"] {
    return this.typeInput.value as VaultEntry["type"];
  }
  set type(value: VaultEntry["type"]) {
    this.typeInput.value = value;
  }
  get hash(): VaultEntry["hash"] {
    return this.hashInput.value as VaultEntry["hash"];
  }
  set hash(value: VaultEntry["hash"]) {
    this.hashInput.value = value;
  }
  get digits(): number {
    return parseInt(this.digitsInput.value);
  }
  set digits(value: number) {
    this.digitsInput.value = value.toString();
  }
  get period(): number {
    return parseInt(this.periodInput.value);
  }
  set period(value: number) {
    this.periodInput.value = value.toString();
  }
  get counter(): number {
    return parseInt(this.counterInput.value);
  }
  set counter(value: number) {
    this.counterInput.value = value.toString();
  }

  constructor() {
    super();
    this.replaceChildren(
      (this.headerElement = createElement(
        ModalHeader,
        { title: "Add new entry" },
        clickFeedback(
          (this.submitButton = createElement("button", {
            className: "trash",
            innerHTML: trash(),
            onclick: this.trash.bind(this),
          })),
          { size: 0.5 }
        ),
        clickFeedback(
          (this.submitButton = createElement("button", {
            innerHTML: check(28),
            onclick: this.submit.bind(this),
          })),
          { size: 0.5 }
        )
      )),
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

  private async trash() {
    try {
      await deleteVaultEntry(this.uuid);
      history.back();
    } catch (error) {
      alert(error);
    }
  }

  private async submit() {
    if (!this.validate()) return;
    try {
      await upsertVaultEntry(this.getVaultEntry());
      history.back();
    } catch (error) {
      alert(error);
    }
  }

  private getVaultEntry(): VaultEntry {
    const { uuid, name, issuer, secret, type, hash, digits, period, counter } =
      this;
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
