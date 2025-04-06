import "./SecuritySettingsModal.css";
import { ModalHeader } from "../../elements/ModalHeader";
import { SettingsEntryElement } from "./SettingsEntryElement";
import {
  getFingerprintEncryptedSecret,
  removeFingerprintEncryptedSecret,
  saveSecretWithFingerprint,
} from "../../vault";

@tag("app-security-settings-modal")
export class SecuritySettingsModal extends HTMLElement {
  private switchElement: SettingsEntryElement;

  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "Security" }),
      createElement("main", {}, [
        createElement(SettingsEntryElement, {
          disabled: true,
          name: "Change password",
          description: "Change the password used to encrypt your vault.",
        }),
        (this.switchElement = createElement(SettingsEntryElement, {
          type: "switch",
          value: !!getFingerprintEncryptedSecret(),
          name: "Biometric unlock",
          description: "Allow biometric unlock using fingerprint or face ID.",
          onclick: async () => {
            try {
              if (this.switchElement.value) await saveSecretWithFingerprint();
              else removeFingerprintEncryptedSecret();
            } finally {
              this.switchElement.value = !!getFingerprintEncryptedSecret();
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
