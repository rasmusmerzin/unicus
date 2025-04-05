export function captureStyle(element: HTMLElement): () => void {
  const style = element.getAttribute("style");
  return function resetStyle() {
    if (style) element.setAttribute("style", style);
    else element.removeAttribute("style");
  };
}
