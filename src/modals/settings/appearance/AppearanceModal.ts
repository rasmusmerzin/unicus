import "./AppearanceModal.css";
import { ModalHeader } from "../../../elements/ModalHeader";
import { NamePlacementSelectModal } from "./NamePlacementSelectModal";
import { SettingsEntryElement } from "../SettingsEntryElement";
import { ThemeSelectModal } from "./ThemeSelectModal";
import { ViewModeSelectModal } from "./ViewModeSelectModal";
import { openModal } from "../../../view";
import { settings$ } from "../../../settings";

@tag("app-appearance-modal")
export class AppearanceModal extends HTMLElement {
  private themeEntry: SettingsEntryElement;
  private iconEntry: SettingsEntryElement;
  private expiringEntry: SettingsEntryElement;
  private namePlacementEntry: SettingsEntryElement;
  private viewModeEntry: SettingsEntryElement;
  private control?: AbortController;

  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "Appearance" }),
      (this.themeEntry = createElement(SettingsEntryElement, {
        name: "Theme",
        onclick: () => openModal(ThemeSelectModal),
      })),
      (this.viewModeEntry = createElement(SettingsEntryElement, {
        name: "View mode",
        onclick: () => openModal(ViewModeSelectModal),
      })),
      (this.namePlacementEntry = createElement(SettingsEntryElement, {
        name: "Name placement",
        onclick: () => openModal(NamePlacementSelectModal),
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
      })),
      (this.expiringEntry = createElement(SettingsEntryElement, {
        type: "switch",
        name: "Indicate expiring codes",
        description: "Change the color of and blink expiring codes",
        onchange: () =>
          settings$.update((settings) => ({
            ...settings,
            indicateExpiring: this.expiringEntry.value,
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
    const {
      themeOverride,
      hideIcons,
      indicateExpiring,
      namePlacement,
      viewMode,
    } = settings$.current();
    this.themeEntry.description = "Selected: " + (themeOverride || "system");
    this.iconEntry.value = !hideIcons;
    this.expiringEntry.value = !!indicateExpiring;
    this.viewModeEntry.description = "Selected: " + (viewMode || "normal");
    this.namePlacementEntry.description =
      "Entry account name is " +
      (namePlacement === "right"
        ? "placed right of the issuer name"
        : namePlacement === "bottom"
        ? "placed below the issuer name"
        : "hidden");
  }
}
