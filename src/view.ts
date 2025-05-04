import "./view.css";
import { MainView } from "./views/main/MainView";
import { SetupView } from "./views/setup/SetupView";
import { UnlockView } from "./views/unlock/UnlockView";
import { getEncryptedVault, secret$, vault$ } from "./vault";
import { getColorScheme } from "./theme";
import { updateThemeColor } from "./theme";

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
  addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (historyStack.length) history.back();
    }
  });
  addEventListener("popstate", onpopstate);
});

export function onback(handler: () => any): () => void {
  historyStack.push(handler);
  const level = historyStack.length;
  history.pushState({ level }, "", "");
  sessionStorage.setItem("level", level.toString());
  return () => historyStack.includes(handler) && history.back();
}

export function isModalOnTop(modal: HTMLElement) {
  const modals = historyStack.filter((entry) => entry instanceof HTMLElement);
  return modals[modals.length - 1] === modal;
}

export async function openModal(
  factory: Factory<HTMLElement, []>,
  { duration = 200 }: { duration?: number } = {}
) {
  document.body.style.pointerEvents = "none";
  const modal = resolveFactory(factory);
  historyStack.push(modal);
  const level = historyStack.length;
  modal.style.zIndex = `${1000 * level}`;
  modal.classList.add("opening");
  const capturedModalStyle = modal.getAttribute("style");
  app.append(modal);
  if (!elementHasAnimation(modal))
    modal.style.animation = `modal-in ${duration}ms ease-in-out`;
  else {
    modal.style.animationDelay = "0";
    modal.style.animationDuration = `${duration}ms`;
  }
  history.pushState({ level }, "", "");
  sessionStorage.setItem("level", level.toString());
  await new Promise((resolve) => setTimeout(resolve, duration));
  modal.classList.remove("opening");
  document.body.style.pointerEvents = "";
  if (capturedModalStyle) modal.setAttribute("style", capturedModalStyle);
  else modal.removeAttribute("style");
  disableNonActive();
}

export async function closeAllModals() {
  const level = historyStack.length;
  if (level) {
    history.go(-level);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

export async function updateView({
  force = false,
  viewConstructor = getViewConstructor(),
  duration,
  direction,
}: {
  force?: boolean;
  viewConstructor?: Constructor<HTMLElement & Partial<OnMountedAsFirst>>;
  duration?: number;
  direction?: "forwards" | "backwards";
} = {}): Promise<HTMLElement> {
  await closeAllModals();
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

let popstateSymbol = Symbol();
async function onpopstate(event: PopStateEvent) {
  const level = event.state?.level || 0;
  sessionStorage.setItem("level", level.toString());
  if (level > historyStack.length) history.go(historyStack.length - level);
  const symbol = (popstateSymbol = Symbol());
  document.body.style.pointerEvents = "none";
  let animating = false;
  while (historyStack.length > level) {
    const entry = historyStack.pop()!;
    if (typeof entry === "function") {
      try {
        await Promise.resolve(entry()).catch(console.error);
      } catch (error) {
        console.error(error);
      }
    } else {
      entry.classList.add("closing");
      if (!elementHasAnimation(entry))
        entry.style.animation = "modal-out 200ms ease-in-out forwards";
      else {
        entry.style.animationDelay = "0";
        entry.style.animationDuration = "200ms";
      }
      setTimeout(() => entry.remove(), 200);
      animating = true;
    }
  }
  enableActive();
  if (animating) await new Promise((resolve) => setTimeout(resolve, 200));
  if (popstateSymbol === symbol) document.body.style.pointerEvents = "";
}

function enableActive() {
  for (const element of getActiveElements()) element.style.display = "";
}

function disableNonActive() {
  const active = getActiveElements();
  const stack = [app.firstElementChild as HTMLElement, ...historyStack];
  for (const entry of stack) {
    if (!(entry instanceof HTMLElement)) continue;
    if (!active.includes(entry)) entry.style.display = "none";
  }
}

function getActiveElements(): HTMLElement[] {
  const active = <HTMLElement[]>[];
  const stack = [app.firstElementChild as HTMLElement, ...historyStack];
  for (let i = stack.length - 1; i >= 0; i--) {
    const entry = stack[i];
    if (!(entry instanceof HTMLElement)) continue;
    active.push(entry);
    const { backgroundColor } = getComputedStyle(entry);
    // check if background is without alpha
    if (backgroundColor.split("").filter((c) => c === ",").length < 3)
      return active;
  }
  return active;
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
  const capturedNextStyle = next.getAttribute("style");
  const backgroundColor = getColorScheme() === "dark" ? "#333" : "#ccc";
  document.body.style.pointerEvents = "none";
  document.body.style.transition = "background 100ms";
  document.body.style.background = backgroundColor;
  updateThemeColor(backgroundColor);
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
      setTimeout(updateThemeColor, 50);
    }, duration - 100);
    await new Promise((resolve) => setTimeout(resolve, duration));
  }
  current?.remove();
  if (capturedNextStyle) next.setAttribute("style", capturedNextStyle);
  else next.removeAttribute("style");
  document.body.style.pointerEvents = "";
  document.body.style.transition = "";
  document.body.style.background = "";
}

function resolveFactory<T, A extends any[] = any[]>(
  factory: Factory<T, A>,
  ...args: A
): T {
  if (typeof factory === "function") {
    if (isClass(factory)) return new (factory as any)(...args);
    else return (factory as any)(...args);
  }
  return factory;
}

function isClass(obj: any) {
  return (
    typeof obj === "function" &&
    Object.toString.call(obj).substring(0, 5) === "class"
  );
}
