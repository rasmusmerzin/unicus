export type InputMode = "keyboard" | "mouse" | "touch";

setTimeout(() => {
  addEventListener("keydown", enterKeyboardMode);
  addEventListener("mousedown", enterMouseMode);
  addEventListener("mousemove", enterMouseMode);
  addEventListener("touchmove", enterTouchMode);
  addEventListener("touchstart", enterTouchMode);
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
  if (getInputMode() === "touch") return;
  document.documentElement.setAttribute("input-mode", "mouse");
}

function enterTouchMode() {
  document.documentElement.setAttribute("input-mode", "touch");
}
