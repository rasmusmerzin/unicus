import "./clickFeedback.css";

export function clickFeedback<E extends HTMLElement>(
  element: E,
  {
    duration = 400,
    color = "#fff",
    size = 1,
    contextmenu = false,
  }: {
    duration?: number;
    color?: string;
    size?: number;
    contextmenu?: boolean;
  } = {}
): E {
  let capturedStyle: string | null | undefined;
  let feedbackElement: HTMLElement | null = null;
  let timeout: any;

  element.addEventListener("click", onclick);
  if (contextmenu) element.addEventListener("contextmenu", onclick);

  function onclick(event: MouseEvent) {
    cleanup();
    capturedStyle = element.getAttribute("style");
    const style = getComputedStyle(element);
    if (style.position === "static") element.style.position = "relative";
    element.style.overflow = "hidden";
    feedbackElement = createFeedbackElement(event);
    element.appendChild(feedbackElement);
    timeout = setTimeout(cleanup, duration);
  }

  function createFeedbackElement(event: MouseEvent) {
    const { top, left } = element.getBoundingClientRect();
    const width = `${size * 8}px`;
    return createElement("div", {
      style: {
        zIndex: "1",
        position: "absolute",
        top: `${event.clientY - top}px`,
        left: `${event.clientX - left}px`,
        transform: "translate(-50%, -50%)",
        width,
        height: width,
        background: color,
        borderRadius: "100%",
        animation: `click-feedback ${duration}ms ease-in forwards`,
        pointerEvents: "none",
      },
    });
  }

  function cleanup() {
    clearTimeout(timeout);
    if (capturedStyle !== undefined) {
      if (capturedStyle) element.setAttribute("style", capturedStyle);
      else element.removeAttribute("style");
      capturedStyle = undefined;
    }
    if (feedbackElement) {
      feedbackElement.remove();
      feedbackElement = null;
    }
  }

  return element;
}
