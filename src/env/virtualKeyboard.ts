const { virtualKeyboard } = navigator as any;

setTimeout(() => {
  if (!virtualKeyboard) return;
  virtualKeyboard.overlaysContent = true;
  virtualKeyboard.addEventListener("geometrychange", () => {
    const height = `${virtualKeyboard.boundingRect.height}px`;
    document.documentElement.style.setProperty("--keyboard-height", height);
  });
});

export function getVirtualKeyboardHeight(): number {
  return virtualKeyboard?.boundingRect.height || 0;
}
