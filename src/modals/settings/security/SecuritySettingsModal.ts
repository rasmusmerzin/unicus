import "./SecuritySettingsModal.css";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { ModalHeader } from "../../../elements/ModalHeader";
import { SettingsEntryElement } from ".././SettingsEntryElement";
import {
  getFingerprintEncryptedSecret,
  removeFingerprintEncryptedSecret,
  saveSecretWithFingerprint,
} from "../../../vault";
import { openModal } from "../../../view";
import { settings$ } from "../../../settings";
import { AutoLockModal } from "./AutoLockModal";

@tag("app-security-settings-modal")
export class SecuritySettingsModal extends HTMLElement {
  private fingerprintElement: SettingsEntryElement;
  private autoLockElement: SettingsEntryElement;
  private control?: AbortController;

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
        (this.autoLockElement = createElement(SettingsEntryElement, {
          name: "Auto lock",
          onclick: () => openModal(AutoLockModal),
        })),
        createElement(SettingsEntryElement, {
          disabled: true,
          name: "Password reminder",
          description:
            "Show a biweekly reminder to enter your password, so that you don't forget it.",
        }),
      ])
    );
  }

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    settings$.subscribe((settings) => {
      const { lockOnBackground, lockOnInactivity } = settings;
      if (!lockOnBackground && !lockOnInactivity)
        this.autoLockElement.description = "Never";
      else
        this.autoLockElement.description =
          "When " +
          [
            lockOnBackground ? "app is in the background" : null,
            lockOnInactivity ? "inactive for a minute" : null,
          ]
            .filter(Boolean)
            .join(", ");
    }, this.control);
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
  }
}
