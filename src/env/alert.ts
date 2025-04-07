import { FloatingModal } from "../elements/FloatingModal";
import { openModal } from "../view";

Object.assign(globalThis, { alert });

export function alert(msg?: any) {
  const isError = msg instanceof Error;
  return openModal(
    createElement(FloatingModal, { title: isError ? "Error" : "Info" }, [
      createElement("p", {
        innerText: isError ? msg.message : String(msg),
        style: { color: isError ? "var(--error)" : "" },
      }),
    ])
  );
}
