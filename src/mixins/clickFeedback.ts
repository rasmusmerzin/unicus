import "./clickFeedback.css";

export function clickFeedback<E extends HTMLElement>(
  element: E,
  {
    duration = 400,
    color = "#fff",
  }: {
    duration?: number;
    color?: string;
  } = {}
): E {
  element.addEventListener("click", onclick);
  let activated = false;
  let originalPosition = "";
  let originalOverflow = "";
  let feedbackElement: HTMLElement | null = null;
  let timeout: any;
  function onclick(event: MouseEvent) {
    if (activated) cleanup();
    clearTimeout(timeout);
    activated = true;
    originalPosition = element.style.position;
    originalOverflow = element.style.overflow;
    const style = getComputedStyle(element);
    if (style.position === "static") element.style.position = "relative";
    element.style.overflow = "hidden";
    feedbackElement = createFeedbackElement(event);
    element.appendChild(feedbackElement);
    setTimeout(cleanup, duration);
  }
  function createFeedbackElement(event: MouseEvent) {
    const { top, left } = element.getBoundingClientRect();
    return createElement("div", {
      style: {
        zIndex: "1",
        position: "absolute",
        top: `${event.clientY - top}px`,
        left: `${event.clientX - left}px`,
        transform: "translate(-50%, -50%)",
        width: "8px",
        height: "8px",
        background: color,
        borderRadius: "100%",
        animation: `click-feedback ${duration}ms ease-in forwards`,
        pointerEvents: "none",
      },
    });
  }
  function cleanup() {
    activated = false;
    element.style.position = originalPosition;
    element.style.overflow = originalOverflow;
    if (feedbackElement) {
      feedbackElement.remove();
      feedbackElement = null;
    }
  }
  return element;
}
