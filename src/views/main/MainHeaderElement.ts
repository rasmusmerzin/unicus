import { add, lock, settings } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import "./MainHeaderElement.css";

@tag("app-main-header")
export class MainHeaderElement extends HTMLElement {
  private timerBarElement: HTMLElement;
  private animationFrame?: number;

  constructor() {
    super();
    this.replaceChildren(
      createElement("h1", { textContent: document.title }),
      createElement("div", { className: "actions" }, [
        clickFeedback(
          createElement("button", {
            className: "add",
            innerHTML: add(32),
          }),
          { size: 0.5 }
        ),
        clickFeedback(
          createElement("button", {
            className: "lock",
            innerHTML: lock(24),
          }),
          { size: 0.5 }
        ),
        clickFeedback(
          createElement("button", {
            className: "settings",
            innerHTML: settings(24),
          }),
          { size: 0.5 }
        ),
      ]),
      (this.timerBarElement = createElement("div", {
        className: "timer-bar",
      }))
    );
  }

  connectedCallback() {
    cancelAnimationFrame(this.animationFrame!);
    this.animateFrame();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.animationFrame!);
  }

  private animateFrame() {
    this.animationFrame = requestAnimationFrame(this.animateFrame.bind(this));
    const now = Date.now();
    const period = 30 * 1000;
    const start = now - (now % period);
    const progress = (now - start) / period;
    this.timerBarElement.style.width = `${(1 - progress) * 100}%`;
  }
}
