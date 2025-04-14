import { FloatingModal } from "./FloatingModal";
import { RadioElement } from "./RadioElement";

export function SelectModal({
  entries,
  group = "select",
  oncancel,
  onchange,
  onsubmit,
  selected = entries[0].value,
  title = "Select",
}: {
  entries: { value: string; label: string }[];
  group?: string;
  oncancel?: (value: string) => void;
  onchange?: (value: string) => void;
  onsubmit?: (value: string) => void;
  selected?: string;
  title?: string;
}): HTMLElement {
  const defaultSelected = selected;
  return createElement(
    FloatingModal,
    {
      title,
      actions: [
        { name: "Cancel", onclick: () => oncancel?.(defaultSelected) },
        { name: "OK", onclick: () => onsubmit?.(selected) },
      ],
    },
    entries.map(({ value, label }) =>
      createElement(RadioElement, {
        name: group,
        value,
        label,
        checked: value === selected,
        onchange: (event: Event) => {
          const target = event.target as HTMLInputElement;
          if (!target.checked) return;
          selected = target.value;
          onchange?.(target.value);
        },
      })
    )
  );
}
