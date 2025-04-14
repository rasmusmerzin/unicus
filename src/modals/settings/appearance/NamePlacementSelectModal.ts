import { SelectModal } from "../../../elements/SelectModal";
import { Settings, settings$ } from "../../../settings";

export function NamePlacementSelectModal() {
  return SelectModal({
    title: "Select name placement",
    group: "name-placement",
    selected: settings$.current().namePlacement || "right",
    entries: [
      { value: "right", label: "Right of issuer" },
      { value: "bottom", label: "Below issuer" },
      { value: "hide", label: "Hide" },
    ],
    onsubmit: update,
    onchange: update,
    oncancel: update,
  });
  function update(value: string) {
    settings$.update((settings) => ({
      ...settings,
      namePlacement: value as Settings["namePlacement"],
    }));
  }
}
