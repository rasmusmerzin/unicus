import { MainView } from "./views/MainView";
import { SetupView } from "./views/SetupView";
import { UnlockView } from "./views/UnlockView";
import { getEncryptedVault, secretCell, vaultCell } from "./vault";

const app = document.getElementById("app")!;

export function updateView() {
  const constructor = getViewConstructor();
  const current = app.firstElementChild;
  if (current instanceof constructor) return;
  app.replaceChildren(new constructor());
}

function getViewConstructor(): Constructor<HTMLElement> {
  if (!getEncryptedVault()) return SetupView;
  if (!secretCell.value || !vaultCell.value) return UnlockView;
  return MainView;
}
