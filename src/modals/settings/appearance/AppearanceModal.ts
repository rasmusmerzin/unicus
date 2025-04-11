import { ModalHeader } from "../../../elements/ModalHeader";
import { settings$ } from "../../../settings";
import { openModal } from "../../../view";
import { SettingsEntryElement } from "../SettingsEntryElement";
import "./AppearanceModal.css";
import { ThemeSelectModal } from "./ThemeSelectModal";

@tag("app-appearance-modal")
export class AppearanceModal extends HTMLElement {
  private themeEntry: SettingsEntryElement;
  private control?: AbortController;

  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "Appearance" }),
      (this.themeEntry = createElement(SettingsEntryElement, {
        name: "Theme",
        onclick: () => openModal(ThemeSelectModal),
      }))
    );
  }

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    settings$.subscribe(this.render.bind(this), this.control);
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
  }

  private render() {
    const { themeOverride } = settings$.current();
    this.themeEntry.description =
      "Selected: " +
      ((themeOverride === "dark" && "Dark") ||
        (themeOverride === "light" && "Light") ||
        "System");
  }
}
