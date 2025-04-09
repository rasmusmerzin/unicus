import { deriveKey } from "../../../crypto";
import { FloatingModal } from "../../../elements/FloatingModal";
import { InputElement } from "../../../elements/InputElement";
import {
  removeFingerprintEncryptedSecret,
  saveVault,
  secret$,
} from "../../../vault";
import { SettingsEntryElement } from "../SettingsEntryElement";

export function ChangePasswordModal(fingerprintElement: SettingsEntryElement) {
  let modalElement: FloatingModal;
  let passcodeInput: InputElement;
  let passcodeInput2: InputElement;
  async function onclick() {
    if (!validate())
      throw new Error(passcodeInput.error || passcodeInput2.error);
    const previousSecret = secret$.current();
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
    setTimeout(() => alert("Password changed!"), 100);
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
        onsubmit: () => modalElement.getActionButton("OK")!.click(),
        oninput() {
          passcodeInput.error = "";
          passcodeInput2.error = "";
          modalElement.getActionButton("OK")!.disabled = false;
        },
      })),
      (passcodeInput2 = createElement(InputElement, {
        type: "password",
        label: "Confirm new password",
        onsubmit: () => modalElement.getActionButton("OK")!.click(),
        oninput() {
          passcodeInput2.error = "";
          modalElement.getActionButton("OK")!.disabled = !!passcodeInput.error;
        },
      })),
    ]
  ));
}
