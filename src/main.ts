import "./style.css";
import "./radio.css";
import "./checkbox.css";
import "./env";
import { updateView } from "./view";
import { updateIconColors, updateTheme } from "./theme";
import { lockVault, secret$ } from "./vault";
import { settings$ } from "./settings";

setTimeout(updateView);
setTimeout(updateTheme);

setTimeout(() =>
  secret$.subscribe((secret) => {
    if (secret) updateIconColors();
    else updateIconColors("#888", "#fff");
  }, new AbortController())
);

addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "hidden") return;
  if (!settings$.current().lockOnBackground) return;
  lockVault();
  updateView({ direction: "backwards" });
});

addEventListener("inactive", () => {
  if (!settings$.current().lockOnInactivity) return;
  lockVault();
  updateView({ direction: "backwards" });
});
