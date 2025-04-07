import "./style.css";
import "./radio.css";
import "./env";
import { updateView } from "./view";
import { updateIconColors, updateTheme } from "./theme";
import { secret$ } from "./vault";

setTimeout(updateView);
setTimeout(updateTheme);

setTimeout(() =>
  secret$.subscribe((secret) => {
    if (secret) updateIconColors();
    else updateIconColors("#888", "#fff");
  }, new AbortController())
);
