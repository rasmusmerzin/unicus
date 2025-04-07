import "./touchHoldFeedback.css";
import { captureStyle } from "../captureStyle";

export function touchHoldFeedback<E extends HTMLElement>(
  element: E,
  {
    color = "#fff",
    duration = 1000,
    moveCutoff = 8,
    size = 1,
  }: {
    color?: string;
    duration?: number;
    moveCutoff?: number;
    size?: number;
  } = {}
): E {
  let resetStyle: (() => void) | null = null;
  let feedbackElement: HTMLElement | null = null;
  let control: AbortController | null = null;
  let timeout: any;
  let start: { x: number; y: number } | null = null;

  element.addEventListener("touchstart", ontouchstart);

  function ontouchstart(event: TouchEvent) {
    cleanup();
    resetStyle = captureStyle(element);
    const [touch] = event.touches;
    start = { x: touch.clientX, y: touch.clientY };
    const style = getComputedStyle(element);
    if (style.position === "static") element.style.position = "relative";
    element.style.overflow = "hidden";
    feedbackElement = createFeedbackElement(event);
    element.appendChild(feedbackElement);
    timeout = setTimeout(cleanup, duration);
    control = new AbortController();
    element.addEventListener("contextmenu", cleanup, control);
    addEventListener("touchend", cleanup, control);
    addEventListener("touchcancel", cleanup, control);
    addEventListener(
      "touchmove",
      ({ touches: [touch] }) => {
        const distance = Math.sqrt(
          Math.pow(touch.clientX - start!.x, 2) +
            Math.pow(touch.clientY - start!.y, 2)
        );
        if (distance > moveCutoff) cleanup();
      },
      control
    );
    addEventListener("scroll", cleanup, {
      passive: true,
      capture: true,
      signal: control.signal,
    });
  }

  function createFeedbackElement(event: TouchEvent) {
    const [touch] = event.touches;
    const { top, left } = element.getBoundingClientRect();
    const width = `${size * 8}px`;
    return createElement("div", {
      style: {
        zIndex: "1",
        position: "absolute",
        top: `${touch.clientY - top}px`,
        left: `${touch.clientX - left}px`,
        transform: "translate(-50%, -50%)",
        width,
        height: width,
        background: color,
        borderRadius: "100%",
        animation: `touch-hold-feedback ${duration}ms ease-in forwards`,
        pointerEvents: "none",
      },
    });
  }

  function cleanup() {
    clearTimeout(timeout);
    if (resetStyle) {
      resetStyle();
      resetStyle = null;
    }
    if (control) {
      control.abort();
      control = null;
    }
    if (feedbackElement) {
      feedbackElement.remove();
      feedbackElement = null;
    }
  }

  return element;
}
