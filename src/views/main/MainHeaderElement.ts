import { add, fingerprint, lock } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import { FingerprintModal } from "../../modals/fingerprint/FingerprintModal";
import { lockVault } from "../../vault";
import { openModal, updateView } from "../../view";
import "./MainHeaderElement.css";

@tag("app-main-header")
export class MainHeaderElement extends HTMLElement {
  private timerBarElement: HTMLElement;
  private animationFrame?: number;

  constructor() {
    super();
    this.replaceChildren(
      createElement("h2", { textContent: document.title }),
      createElement("div", { className: "actions" }, [
        clickFeedback(
          createElement("button", {
            innerHTML: add(32),
          }),
          { size: 0.5 }
        ),
        clickFeedback(
          createElement("button", {
            innerHTML: lock(),
            onclick: this.lock.bind(this),
          }),
          { size: 0.5 }
        ),
        clickFeedback(
          createElement("button", {
            innerHTML: fingerprint(),
            onclick: () => openModal(FingerprintModal),
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

  private lock() {
    lockVault();
    updateView({ direction: "backwards" });
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
