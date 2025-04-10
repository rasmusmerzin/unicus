import { Subject } from "./Subject";

export interface Settings {
  lockOnBackground?: boolean;
  lockOnInactivity?: boolean;
}

export const settings$ = new Subject<Settings>(getStoredSettings());

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
      };
}

function setStoredSettings(settings: Settings) {
  localStorage.setItem("settings", JSON.stringify(settings));
}
