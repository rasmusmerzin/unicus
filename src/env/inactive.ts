let timeout: any;

setTimeout(() => {
  addEventListener("keydown", registerInactiveTimeout);
  addEventListener("mousedown", registerInactiveTimeout);
  addEventListener("mousemove", registerInactiveTimeout);
  addEventListener("touchmove", registerInactiveTimeout);
  addEventListener("touchstart", registerInactiveTimeout);
  addEventListener("scroll", registerInactiveTimeout, {
    passive: true,
    capture: true,
  });
});

function registerInactiveTimeout() {
  clearTimeout(timeout);
  timeout = setTimeout(() => dispatchEvent(new Event("inactive")), 60 * 1000);
}
