import { SelectModal } from "../../../elements/SelectModal";
import { Settings, settings$ } from "../../../settings";

export function ViewModeSelectModal() {
  return SelectModal({
    title: "Select view mode",
    group: "view-mode",
    selected: settings$.current().viewMode || "normal",
    entries: [
      { value: "normal", label: "Normal" },
      { value: "compact", label: "Compact" },
      { value: "small", label: "Small" },
    ],
    onsubmit: (value) => {
      settings$.update((settings) => ({
        ...settings,
        viewMode: value as Settings["viewMode"],
      }));
    },
  });
}
