import "./env";
import { updateView } from "./view";
import { setColorScheme, updateIconColors, updateThemeColor } from "./theme";
import { lockVault, secret$ } from "./vault";
import { settings$ } from "./settings";

updateView();

secret$.subscribe((secret) => {
  if (secret) updateIconColors();
  else updateIconColors("#888", "#fff");
}, new AbortController());

settings$.subscribe((settings) => {
  setColorScheme(settings.themeOverride || "system");
  updateThemeColor();
}, new AbortController());

addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "hidden") return;
  if (!settings$.current().lockOnBackground) return;
  lockVault();
  setTimeout(updateView, 100, { direction: "backwards" });
});

addEventListener("inactive", () => {
  if (!settings$.current().lockOnInactivity) return;
  lockVault();
  setTimeout(updateView, 100, { direction: "backwards" });
});
