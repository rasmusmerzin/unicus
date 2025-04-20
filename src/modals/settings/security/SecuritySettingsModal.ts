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
import { storeAuditEntry } from "../../../audit";

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
              if (this.fingerprintElement.value) {
                await saveSecretWithFingerprint();
                storeAuditEntry({ type: "biometric", action: "enable" });
              } else {
                removeFingerprintEncryptedSecret();
                storeAuditEntry({ type: "biometric", action: "disable" });
              }
            } finally {
              this.fingerprintElement.value = !!getFingerprintEncryptedSecret();
            }
          },
        })),
        (this.autoLockElement = createElement(SettingsEntryElement, {
          name: "Auto lock",
          onclick: () => openModal(AutoLockModal),
        })),
      ])
    );
  }

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    settings$.subscribe(this.render.bind(this), this.control);
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
  }

  private render() {
    const { lockOnBackground, lockOnInactivity } = settings$.current();
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
  }
}
