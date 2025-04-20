import "./FingerprintView.css";
import { ButtonElement } from "../../elements/ButtonElement";
import { fingerprint } from "../../icons";
import { saveSecretWithFingerprint } from "../../vault";
import { storeAuditEntry } from "../../audit";
import { updateView } from "../../view";

@tag("app-fingerprint")
export class FingerprintView extends HTMLElement {
  constructor() {
    super();
    this.replaceChildren(
      createElement("div", { className: "icon", innerHTML: fingerprint(64) }),
      createElement("h1", { textContent: "Setup Fingerprint" }),
      createElement("p", {
        textContent:
          "Use your fingerprint to unlock your vault. This will not replace your passcode.",
      }),
      createElement(ButtonElement, {
        textContent: "Continue",
        onclick: this.setupFingerprint.bind(this),
      }),
      createElement("button", {
        textContent: "Skip",
        onclick: () => updateView(),
      })
    );
  }

  private async setupFingerprint() {
    try {
      await saveSecretWithFingerprint();
      storeAuditEntry({ type: "biometric", action: "enable" });
      await updateView();
    } catch (error) {
      alert(error);
    }
  }
}
