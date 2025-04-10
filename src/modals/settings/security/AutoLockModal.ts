import { CheckboxElement } from "../../../elements/CheckboxElement";
import { FloatingModal } from "../../../elements/FloatingModal";
import { settings$ } from "../../../settings";

export function AutoLockModal() {
  let backgroundCheckbox: CheckboxElement;
  let inactivityCheckbox: CheckboxElement;
  const settings = settings$.current();
  return createElement(
    FloatingModal,
    {
      title: "Auto lock when",
      actions: [
        { name: "Cancel" },
        {
          name: "OK",
          onclick: () =>
            settings$.update((settings) => {
              settings.lockOnBackground = backgroundCheckbox.checked;
              settings.lockOnInactivity = inactivityCheckbox.checked;
              return settings;
            }),
        },
      ],
    },
    [
      (backgroundCheckbox = createElement(CheckboxElement, {
        name: "background",
        label: "App is in the background",
        checked: settings.lockOnBackground,
      })),
      (inactivityCheckbox = createElement(CheckboxElement, {
        name: "inactivity",
        label: "App is inactive for a minute",
        checked: settings.lockOnInactivity,
      })),
    ]
  );
}
