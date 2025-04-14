const { virtualKeyboard } = navigator as any;

setTimeout(() => {
  if (!virtualKeyboard) return;
  virtualKeyboard.overlaysContent = true;
  virtualKeyboard.addEventListener("geometrychange", () => {
    const { height } = virtualKeyboard.boundingRect;
    document.documentElement.style.setProperty(
      "--keyboard-height",
      `${height}px`
    );
    if (!height && document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
  });
});
