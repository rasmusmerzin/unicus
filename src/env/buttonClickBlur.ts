setTimeout(() => {
  addEventListener("click", blurActiveButton);
  addEventListener("contextmenu", blurActiveButton);
});

function blurActiveButton() {
  if (document.activeElement instanceof HTMLButtonElement)
    document.activeElement.blur();
}
