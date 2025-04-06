import "./MainHeaderElement.css";
import { MainView } from "./MainView";
import { ManualAddModal } from "../../modals/manual-add/ManualAddModal";
import { SettingsModal } from "../../modals/settings/SettingsModal";
import { add, close, copy, edit, lock, qr, settings, trash } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import { generateOtp } from "../../otp";
import { lockVault, vault$ } from "../../vault";
import { openModal, updateView } from "../../view";

@tag("app-main-header")
export class MainHeaderElement extends HTMLElement {
  private timerBarElement: HTMLElement;
  private animationFrame?: number;
  private control?: AbortController;

  constructor() {
    super();
    this.replaceChildren(
      createElement("h2", { textContent: document.title }),
      createElement("div", { className: "actions" }, [
        clickFeedback(
          createElement("button", {
            innerHTML: add(32),
            onclick: () => openModal(ManualAddModal),
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
            innerHTML: settings(),
            onclick: () => openModal(SettingsModal),
          }),
          { size: 0.5 }
        ),
      ]),
      createElement("div", { className: "selection" }, [
        clickFeedback(
          createElement("button", {
            innerHTML: close(28),
            onclick: () => history.back(),
          }),
          { size: 0.5 }
        ),
        createElement("div", { className: "actions" }, [
          clickFeedback(
            createElement("button", {
              className: "edit",
              innerHTML: edit(),
              disabled: true,
            }),
            { size: 0.5 }
          ),
          clickFeedback(
            createElement("button", {
              className: "copy",
              innerHTML: copy(),
              onclick: this.copy.bind(this),
            }),
            { size: 0.5 }
          ),
          clickFeedback(
            createElement("button", {
              innerHTML: trash(),
              disabled: true,
            }),
            { size: 0.5 }
          ),
          clickFeedback(
            createElement("button", {
              innerHTML: qr(),
              disabled: true,
            }),
            { size: 0.5 }
          ),
        ]),
      ]),
      (this.timerBarElement = createElement("div", {
        className: "timer-bar",
      }))
    );
  }

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    MainView.instance!.selected$.subscribe((selected) => {
      if (selected.length) this.classList.add("selected");
      else this.classList.remove("selected");
      if (selected.length > 1) this.classList.add("multiple");
      else this.classList.remove("multiple");
    }, this.control);
    cancelAnimationFrame(this.animationFrame!);
    this.animateFrame();
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
    cancelAnimationFrame(this.animationFrame!);
  }

  private copy() {
    const vault = vault$.current();
    const [uuid] = MainView.instance!.selected$.current();
    const entry = vault!.entries!.find((entry) => entry.uuid === uuid);
    const code = generateOtp(entry!);
    if (code) navigator.clipboard.writeText(code);
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
