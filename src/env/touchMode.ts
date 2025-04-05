setTimeout(() => {
  addEventListener("keydown", exitTouchMode);
  addEventListener("keypress", exitTouchMode);
  addEventListener("keyup", exitTouchMode);
  addEventListener("touchcancel", enterTouchMode);
  addEventListener("touchend", enterTouchMode);
  addEventListener("touchmove", enterTouchMode);
  addEventListener("touchstart", enterTouchMode);
});

function enterTouchMode() {
  document.documentElement.setAttribute("touch", "true");
}

function exitTouchMode() {
  document.documentElement.removeAttribute("touch");
}

export function isTouchMode(): boolean {
  return document.documentElement.hasAttribute("touch");
}
