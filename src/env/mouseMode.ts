setTimeout(() => {
  addEventListener("keydown", exitMouseMode);
  addEventListener("keypress", exitMouseMode);
  addEventListener("keyup", exitMouseMode);
  addEventListener("mousedown", enterMouseMode);
  addEventListener("mousemove", enterMouseMode);
  addEventListener("mouseup", enterMouseMode);
});

function enterMouseMode() {
  document.documentElement.setAttribute("mouse", "true");
}

function exitMouseMode() {
  document.documentElement.removeAttribute("mouse");
}

export function isMouseMode(): boolean {
  return document.documentElement.hasAttribute("mouse");
}
