import { SelectModal } from "../../../elements/SelectModal";
import { Settings, settings$ } from "../../../settings";

export function ThemeSelectModal() {
  return SelectModal({
    title: "Select theme",
    group: "theme",
    selected: settings$.current().themeOverride || "system",
    entries: [
      { value: "system", label: "System" },
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
    ],
    onsubmit: update,
    onchange: update,
    oncancel: update,
  });
  function update(value: string) {
    settings$.update((settings) => ({
      ...settings,
      themeOverride: value as Settings["themeOverride"],
    }));
  }
}
