import "./SecuritySettingsModal.css";
import { ModalHeader } from "../../elements/ModalHeader";
import { SettingsEntryElement } from "./SettingsEntryElement";
import {
  getFingerprintEncryptedSecret,
  removeFingerprintEncryptedSecret,
  saveSecretWithFingerprint,
  saveVault,
  secret$,
} from "../../vault";
import { FloatingModal } from "../../elements/FloatingModal";
import { InputElement } from "../../elements/InputElement";
import { openModal } from "../../view";
import { deriveKey } from "../../crypto";

@tag("app-security-settings-modal")
export class SecuritySettingsModal extends HTMLElement {
  private fingerprintElement: SettingsEntryElement;

  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "Security" }),
      createElement("main", {}, [
        createElement(SettingsEntryElement, {
          name: "Change password",
          description: "Change the password used to encrypt your vault.",
          onclick: () =>
            openModal(ChangePasswordModal(this.fingerprintElement)),
        }),
        (this.fingerprintElement = createElement(SettingsEntryElement, {
          type: "switch",
          value: !!getFingerprintEncryptedSecret(),
          name: "Biometric unlock",
          description: "Allow biometric unlock using fingerprint or face ID.",
          onclick: async () => {
            try {
              if (this.fingerprintElement.value)
                await saveSecretWithFingerprint();
              else removeFingerprintEncryptedSecret();
            } finally {
              this.fingerprintElement.value = !!getFingerprintEncryptedSecret();
            }
          },
        })),
        createElement(SettingsEntryElement, {
          disabled: true,
          name: "Password reminder",
          description:
            "Show a biweekly reminder to enter your password, so that you don't forget it.",
        }),
        createElement(SettingsEntryElement, {
          disabled: true,
          name: "Auto lock",
          description:
            "Automatically lock the app after navigating away from it or after a period of inactivity.",
        }),
      ])
    );
  }
}

function ChangePasswordModal(fingerprintElement: SettingsEntryElement) {
  let modalElement: FloatingModal;
  let passcodeInput: InputElement;
  let passcodeInput2: InputElement;
  async function onclick() {
    if (!validate())
      throw new Error(passcodeInput.error || passcodeInput2.error);
    const previousSecret = secret$.current();
    const fingerprintSecret = getFingerprintEncryptedSecret();
    try {
      modalElement.getActionButton("OK")!.disabled = true;
      secret$.next(await deriveKey(passcodeInput.value));
      await saveVault();
      removeFingerprintEncryptedSecret();
      fingerprintElement.value = false;
    } catch (error) {
      secret$.next(previousSecret);
      alert(error);
    } finally {
      modalElement.getActionButton("OK")!.disabled = false;
    }
    setTimeout(async () => {
      try {
        if (fingerprintSecret) await saveSecretWithFingerprint();
      } finally {
        fingerprintElement.value = !!getFingerprintEncryptedSecret();
      }
    });
  }
  function validate() {
    passcodeInput.error = "";
    passcodeInput2.error = "";
    if (passcodeInput.value.length < 8)
      passcodeInput.error = "Passcode must be at least 8 characters";
    if (passcodeInput.value !== passcodeInput2.value)
      passcodeInput2.error = "Passcodes do not match";
    const valid = !(passcodeInput.error || passcodeInput2.error);
    modalElement.getActionButton("OK")!.disabled = !valid;
    return valid;
  }
  return (modalElement = createElement(
    FloatingModal,
    {
      title: "Change password",
      actions: [{ name: "Cancel" }, { name: "OK", onclick }],
    },
    [
      createElement("p", {}, [
        "This will change the password used to encrypt your vault. ",
        createElement("strong", {}, "Make sure to remember it!"),
      ]),
      (passcodeInput = createElement(InputElement, {
        type: "password",
        label: "New password",
        oninput() {
          passcodeInput.error = "";
          passcodeInput2.error = "";
          modalElement.getActionButton("OK")!.disabled = false;
        },
      })),
      (passcodeInput2 = createElement(InputElement, {
        type: "password",
        label: "Confirm new password",
        oninput() {
          passcodeInput2.error = "";
          modalElement.getActionButton("OK")!.disabled = !!passcodeInput.error;
        },
      })),
    ]
  ));
}
