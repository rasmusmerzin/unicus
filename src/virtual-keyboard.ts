const { virtualKeyboard } = navigator as any;

setTimeout(() => {
  if (!virtualKeyboard) return;
  virtualKeyboard.overlaysContent = false;
  virtualKeyboard.addEventListener("keyboardchange", () => {
    const height = `${virtualKeyboard.boundingRect.height}px`;
    document.documentElement.style.setProperty("--keyboard-height", height);
  });
});
