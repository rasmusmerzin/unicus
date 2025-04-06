import { MainView } from "./views/main/MainView";
import { SetupView } from "./views/setup/SetupView";
import { UnlockView } from "./views/unlock/UnlockView";
import { getEncryptedVault, secret$, vault$ } from "./vault";
import { captureStyle } from "./captureStyle";
import { userPrefersDarkMode } from "./theme";
import { updateTheme } from "./theme";

export interface OnMountedAsFirst {
  onMountedAsFirst(): any;
}

const app = document.getElementById("app")!;
const historyStack = <(HTMLElement | (() => any))[]>[];

setTimeout(() => {
  const level = Number(sessionStorage.getItem("level"));
  if (level) {
    sessionStorage.removeItem("level");
    history.go(-level);
  }
  addEventListener("popstate", async (event) => {
    const level = event.state?.level || 0;
    sessionStorage.setItem("level", level.toString());
    if (level > historyStack.length) history.go(historyStack.length - level);
    document.body.style.pointerEvents = "none";
    document.body.style.overflow = "hidden";
    let animating = false;
    while (historyStack.length > level) {
      const entry = historyStack.pop()!;
      if (typeof entry === "function") {
        entry();
        continue;
      }
      entry.classList.add("closing");
      if (!elementHasAnimation(entry))
        entry.style.animation = "modal-out 200ms ease-in-out forwards";
      else {
        entry.style.animationDelay = "0";
        entry.style.animationDuration = `200ms`;
      }
      setTimeout(() => entry.remove(), 200);
      animating = true;
    }
    if (animating) await new Promise((resolve) => setTimeout(resolve, 200));
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
  });
});

export function onback(handler: () => any): () => void {
  historyStack.push(handler);
  const level = historyStack.length;
  history.pushState({ level }, "", "");
  sessionStorage.setItem("level", level.toString());
  return () => historyStack.includes(handler) && history.back();
}

export async function openModal(
  constructor: HTMLElement | Constructor<HTMLElement>,
  { duration = 200 }: { duration?: number } = {}
) {
  document.body.style.pointerEvents = "none";
  document.body.style.overflow = "hidden";
  const modal =
    constructor instanceof HTMLElement ? constructor : new constructor();
  historyStack.push(modal);
  const level = historyStack.length;
  modal.style.zIndex = `${1000 * level}`;
  modal.classList.add("opening");
  const resetModalStyle = captureStyle(modal);
  if (!elementHasAnimation(modal))
    modal.style.animation = `modal-in ${duration}ms ease-in-out`;
  else {
    modal.style.animationDelay = "0";
    modal.style.animationDuration = `${duration}ms`;
  }
  app.append(modal);
  history.pushState({ level }, "", "");
  sessionStorage.setItem("level", level.toString());
  await new Promise((resolve) => setTimeout(resolve, duration));
  modal.classList.remove("opening");
  document.body.style.pointerEvents = "";
  document.body.style.overflow = "";
  resetModalStyle();
}

export async function closeAllModals() {
  const level = historyStack.length;
  if (level) {
    history.go(-level);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

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
  if (hideModals) await closeAllModals();
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

function elementHasAnimation(element: HTMLElement): boolean {
  return !["", "none"].includes(getComputedStyle(element).animationName);
}

function getViewConstructor(): Constructor<HTMLElement> {
  if (!getEncryptedVault()) return SetupView;
  if (!secret$.current() || !vault$.current()) return UnlockView;
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
  const resetNextStyle = captureStyle(next);
  const backgroundColor = userPrefersDarkMode() ? "#333" : "#ccc";
  document.body.style.pointerEvents = "none";
  document.body.style.overflow = "hidden";
  document.body.style.transition = "background 100ms";
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
  document.body.style.pointerEvents = "";
  document.body.style.overflow = "";
  document.body.style.transition = "";
  document.body.style.background = "";
}
