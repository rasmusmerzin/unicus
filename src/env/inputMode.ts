export type InputMode = "keyboard" | "mouse" | "touch";

setTimeout(() => {
  addEventListener("keydown", enterKeyboardMode);
  addEventListener("mousemove", enterMouseMode);
  addEventListener("touchstart", enterTouchMode);
  addEventListener("touchmove", enterTouchMode);
});

export function getInputMode(): InputMode | null {
  return document.documentElement.getAttribute(
    "input-mode"
  ) as InputMode | null;
}

function enterKeyboardMode() {
  document.documentElement.setAttribute("input-mode", "keyboard");
}

function enterMouseMode() {
  document.documentElement.setAttribute("input-mode", "mouse");
}

function enterTouchMode() {
  document.documentElement.setAttribute("input-mode", "touch");
}
