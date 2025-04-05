import { MainView } from "./views/main/MainView";
import { SetupView } from "./views/setup/SetupView";
import { UnlockView } from "./views/unlock/UnlockView";
import { getEncryptedVault, secretCell, vaultCell } from "./vault";
import { captureStyle } from "./captureStyle";
import { userPrefersDarkMode } from "./env/theme";
import { updateTheme } from "./theme";

export interface OnMountedAsFirst {
  onMountedAsFirst(): any;
}

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

export async function updateView({
  force = true,
  hideModals = true,
  viewConstructor = getViewConstructor(),
  duration,
  direction,
}: {
  force?: boolean;
  hideModals?: boolean;
  viewConstructor?: Constructor<HTMLElement & Partial<OnMountedAsFirst>>;
  duration?: number;
  direction?: "forwards" | "backwards";
} = {}): Promise<HTMLElement> {
  if (hideModals) closeAllModals();
  const current = app.firstElementChild as HTMLElement;
  if (current instanceof viewConstructor && !force) return current;
  const next = new viewConstructor();
  if (current) await transitionView({ next, current, duration, direction });
  else {
    app.prepend(next);
    if (typeof next.onMountedAsFirst === "function") next.onMountedAsFirst();
  }
  return next;
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

async function transitionView({
  next,
  current,
  duration = 600,
  direction = "forwards",
}: {
  next: HTMLElement;
  current?: HTMLElement;
  duration?: number;
  direction?: "forwards" | "backwards";
}) {
  const resetBodyStyle = captureStyle(document.body);
  const resetNextStyle = captureStyle(next);
  const backgroundColor = userPrefersDarkMode() ? "#222" : "#ccc";
  document.body.style.pointerEvents = "none";
  document.body.style.transition = `background 100ms`;
  document.body.style.background = backgroundColor;
  updateTheme(backgroundColor);
  next.style.zIndex = "100";
  next.style.animation =
    direction === "forwards"
      ? `view-in ${duration}ms ease-in-out`
      : `view-in-reverse ${duration}ms ease-in-out`;
  if (current)
    current.style.animation =
      direction === "forwards"
        ? `view-out ${duration}ms ease-in-out forwards`
        : `view-out-reverse ${duration}ms ease-in-out forwards`;
  app.prepend(next);
  if (duration > 0) {
    setTimeout(() => {
      document.body.style.background = "";
      setTimeout(updateTheme, 50);
    }, duration - 100);
    await new Promise((resolve) => setTimeout(resolve, duration));
  }
  current?.remove();
  resetNextStyle();
  resetBodyStyle();
}
