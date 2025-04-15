import { Subject } from "./Subject";

export interface Settings {
  lockOnBackground?: boolean;
  lockOnInactivity?: boolean;
  themeOverride?: "dark" | "light" | "system";
  hideIcons?: boolean;
  indicateExpiring?: boolean;
  namePlacement?: "right" | "bottom" | "hide";
  viewMode?: "normal" | "compact" | "small";
}

export const settings$ = new Subject<Settings>(getStoredSettings());

if (import.meta.env.DEV) Object.assign(globalThis, { settings$ });

setTimeout(() => {
  settings$.subscribe(setStoredSettings, new AbortController());
});

function getStoredSettings(): Settings {
  const settings = localStorage.getItem("settings");
  return settings
    ? JSON.parse(settings)
    : {
        lockOnBackground: false,
        lockOnInactivity: true,
        themeOverride: "system",
        hideIcons: false,
        indicateExpiring: true,
        namePlacement: "right",
      };
}

function setStoredSettings(settings: Settings) {
  localStorage.setItem("settings", JSON.stringify(settings));
}
