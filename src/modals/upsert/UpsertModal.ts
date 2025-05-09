import "./UpsertModal.css";
import { FloatingModal } from "../../elements/FloatingModal";
import { InputElement } from "../../elements/InputElement";
import { ModalHeader } from "../../elements/ModalHeader";
import { SelectElement } from "../../elements/SelectElement";
import { check, trash } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import { deleteVaultEntry, upsertVaultEntry, VaultEntry } from "../../vault";
import { openModal } from "../../view";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

@tag("app-upsert-modal")
export class UpsertModal extends HTMLElement {
  private headerElement: ModalHeader;
  private nameInput: InputElement;
  private issuerInput: InputElement;
  private secretInput: InputElement;
  private typeSelect: SelectElement;
  private algorithmSelect: SelectElement;
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

  uuid: string = crypto.randomUUID();
  get name(): string {
    return this.nameInput.value.trim();
  }
  set name(value: string) {
    this.nameInput.value = value;
  }
  get issuer(): string {
    return this.issuerInput.value.trim();
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
    return this.typeSelect.value as VaultEntry["type"];
  }
  set type(value: VaultEntry["type"]) {
    this.typeSelect.value = value;
    this.syncType();
  }
  get algorithm(): VaultEntry["algorithm"] {
    return this.algorithmSelect.value as VaultEntry["algorithm"];
  }
  set algorithm(value: VaultEntry["algorithm"]) {
    this.algorithmSelect.value = value;
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
          name: "otp-name",
          onsubmit: this.submit.bind(this),
        })),
        (this.issuerInput = createElement(InputElement, {
          label: "Issuer",
          name: "otp-issuer",
          onsubmit: this.submit.bind(this),
        })),
        (this.secretInput = createElement(InputElement, {
          label: "Secret",
          name: "otp-secret",
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
          (this.typeSelect = createElement(SelectElement, {
            label: "Type",
            name: "otp-type",
            options: [{ value: "TOTP" }, { value: "HOTP" }],
            oninput: this.syncType.bind(this),
          })),
          (this.algorithmSelect = createElement(SelectElement, {
            label: "Algorithm",
            name: "otp-algorithm",
            options: [
              { value: "SHA1" },
              { value: "SHA256" },
              { value: "SHA512" },
              { value: "MD5" },
            ],
          })),
        ]),
        createElement("div", {}, [
          (this.periodInput = createElement(InputElement, {
            className: "period",
            label: "Period",
            name: "otp-period",
            type: "number",
            value: "30",
            onsubmit: this.submit.bind(this),
            oninput: this.onInputClearError.bind(this),
          })),
          (this.counterInput = createElement(InputElement, {
            className: "counter",
            label: "Counter",
            name: "otp-counter",
            type: "number",
            value: "0",
            onsubmit: this.submit.bind(this),
            oninput: this.onInputClearError.bind(this),
          })),
          (this.digitsInput = createElement(InputElement, {
            label: "Digits",
            name: "otp-digits",
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
    this.setAttribute("type", this.typeSelect.value);
  }

  private trash() {
    const modal = createElement(FloatingModal, {
      title: "Delete entry",
      innerHTML:
        "<p>Are you sure you want to delete this entry?</p>" +
        "<p><i>Note: This action does not disable 2FA.</i></p>",
      actions: [
        { name: "Cancel" },
        {
          name: "OK",
          onclick: () =>
            deleteVaultEntry(this.uuid)
              .then(() => history.back())
              .catch(alert),
        },
      ],
    });
    openModal(modal);
  }

  private submit() {
    if (!this.validate()) return;
    upsertVaultEntry(this.getVaultEntry())
      .then(() => history.back())
      .catch(alert);
  }

  private getVaultEntry(): VaultEntry {
    const {
      uuid,
      name,
      issuer,
      secret,
      type,
      algorithm,
      digits,
      period,
      counter,
    } = this;
    if (type === "TOTP")
      return { uuid, name, issuer, secret, algorithm, digits, type, period };
    else if (type === "HOTP")
      return { uuid, name, issuer, secret, algorithm, digits, type, counter };
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
    else if (this.secretInput.value.length < 16)
      this.secretInput.error = "Secret must be at least 16 characters";
    if (!this.digitsInput.value) this.digitsInput.error = "Digits is required";
    if (this.typeSelect.value === "TOTP") {
      if (!this.periodInput.value)
        this.periodInput.error = "Period is required";
      else if (!(parseInt(this.periodInput.value) > 0))
        this.periodInput.error = "Period must be greater than 0";
    } else if (this.typeSelect.value === "HOTP") {
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
