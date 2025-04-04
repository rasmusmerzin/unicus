setTimeout(() => {
  addEventListener("click", blurActiveButton);
});

function blurActiveButton() {
  if (document.activeElement instanceof HTMLButtonElement)
    document.activeElement.blur();
}
