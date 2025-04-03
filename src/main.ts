import "./style.css";
import "./virtual-keyboard";
import "./create-element";
import "./tag";
import { SetupView } from "./views/SetupView";
import { getEncryptedVault, secretCell, vaultCell } from "./vault";
import { HTMLElementConstructor } from "./create-element";
import { MainView } from "./views/MainView";
import { UnlockView } from "./views/UnlockView";

const app = document.getElementById("app")!;

updateView();

export function updateView() {
  const constructor = getViewConstructor();
  const current = app.firstElementChild;
  if (current instanceof constructor) return;
  app.replaceChildren(new constructor());
}

function getViewConstructor(): HTMLElementConstructor {
  if (!getEncryptedVault()) return SetupView;
  if (!secretCell.value || !vaultCell.value) return UnlockView;
  return MainView;
}
