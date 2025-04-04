const control = new AbortController();

setTimeout(() => {
  addEventListener("touchstart", enterTouchMode, control);
  addEventListener("touchend", enterTouchMode, control);
  addEventListener("touchend", enterTouchMode, control);
  addEventListener("touchcancel", enterTouchMode, control);
});

function enterTouchMode() {
  control.abort();
  document.documentElement.setAttribute("touch", "true");
}
