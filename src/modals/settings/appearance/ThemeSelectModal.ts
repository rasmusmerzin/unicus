import { FloatingModal } from "../../../elements/FloatingModal";
import { RadioElement } from "../../../elements/RadioElement";
import { settings$ } from "../../../settings";

export function ThemeSelectModal() {
  let state = settings$.current().themeOverride || "system";
  function onchange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) state = target.value as any;
  }
  function onclick() {
    settings$.update((settings) => ({ ...settings, themeOverride: state }));
  }
  return createElement(
    FloatingModal,
    {
      title: "Select theme",
      actions: [{ name: "OK", onclick }],
    },
    [
      createElement(RadioElement, {
        name: "theme",
        value: "system",
        label: "System",
        checked: state === "system",
        onchange,
      }),
      createElement(RadioElement, {
        name: "theme",
        value: "light",
        label: "Light",
        checked: state === "light",
        onchange,
      }),
      createElement(RadioElement, {
        name: "theme",
        value: "dark",
        label: "Dark",
        checked: state === "dark",
        onchange,
      }),
    ]
  );
}
