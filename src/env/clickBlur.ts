setTimeout(() => {
  addEventListener("click", blurActiveElement);
});

function blurActiveElement() {
  setTimeout(() => {
    const { activeElement } = document;
    if (!activeElement) return;
    if (activeElement instanceof HTMLButtonElement) return activeElement.blur();
    if (
      activeElement instanceof HTMLInputElement &&
      ["checkbox", "radio"].includes(activeElement.type)
    )
      return activeElement.blur();
  });
}
