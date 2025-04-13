import { ModalHeader } from "../../../elements/ModalHeader";
import { settings$ } from "../../../settings";
import { openModal } from "../../../view";
import { SettingsEntryElement } from "../SettingsEntryElement";
import "./AppearanceModal.css";
import { ThemeSelectModal } from "./ThemeSelectModal";

@tag("app-appearance-modal")
export class AppearanceModal extends HTMLElement {
  private themeEntry: SettingsEntryElement;
  private iconEntry: SettingsEntryElement;
  private control?: AbortController;

  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "Appearance" }),
      (this.themeEntry = createElement(SettingsEntryElement, {
        name: "Theme",
        onclick: () => openModal(ThemeSelectModal),
      })),
      (this.iconEntry = createElement(SettingsEntryElement, {
        type: "switch",
        name: "Show icons",
        description: "Display icons next to entries",
        onchange: () =>
          settings$.update((settings) => ({
            ...settings,
            hideIcons: !this.iconEntry.value,
          })),
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
    const { themeOverride, hideIcons } = settings$.current();
    this.themeEntry.description = "Selected: " + (themeOverride || "system");
    this.iconEntry.value = !hideIcons;
  }
}
