import { MainView } from "./views/main/MainView";
import { SetupView } from "./views/setup/SetupView";
import { UnlockView } from "./views/unlock/UnlockView";
import { getEncryptedVault, secretCell, vaultCell } from "./vault";

const app = document.getElementById("app")!;
const modalStack = <HTMLElement[]>[];

setTimeout(() => {
  const level = Number(sessionStorage.getItem("level"));
  if (level) {
    sessionStorage.removeItem("level");
    history.go(-level);
  }
  addEventListener("popstate", (event) => {
    const level = event.state?.level || 0;
    if (level > modalStack.length) history.go(modalStack.length - level);
    while (modalStack.length > level) modalStack.pop()!.remove();
    sessionStorage.setItem("level", level.toString());
  });
});

export function updateView() {
  closeAllModals();
  const constructor = getViewConstructor();
  const current = app.firstElementChild;
  if (current instanceof constructor) return;
  app.replaceChildren(new constructor());
}

export function openModal(constructor: Constructor<HTMLElement>) {
  const element = new constructor();
  modalStack.push(element);
  const level = modalStack.length;
  element.style.zIndex = `${1000 + level}`;
  app.append(element);
  history.pushState({ level }, "", "");
  sessionStorage.setItem("level", level.toString());
}

export function closeAllModals() {
  const level = modalStack.length;
  if (level) history.go(-level);
}

function getViewConstructor(): Constructor<HTMLElement> {
  if (!getEncryptedVault()) return SetupView;
  if (!secretCell.value || !vaultCell.value) return UnlockView;
  return MainView;
}
