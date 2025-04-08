import { DrawerModal } from "../../elements/DrawerModal";
import { addImage, edit, scanQr } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import { ScanModal } from "../../modals/scan/ScanModal";
import { UpsertModal } from "../../modals/upsert/UpsertModal";
import { openModal } from "../../view";

export function AddDrawerModal() {
  return createElement(DrawerModal, { title: "Add new entry" }, [
    Option({
      icon: scanQr(),
      display: "Scan QR code",
      onclick() {
        history.back();
        setTimeout(openModal, 10, ScanModal);
      },
    }),
    Option({ icon: addImage(), display: "Scan image", disabled: true }),
    Option({
      icon: edit(),
      display: "Enter manually",
      onclick() {
        history.back();
        setTimeout(openModal, 10, UpsertModal);
      },
    }),
  ]);
}

function Option({
  disabled,
  display,
  icon,
  onclick,
}: {
  disabled?: boolean;
  display: string;
  icon: string;
  onclick?: () => any;
}) {
  return clickFeedback(
    createElement(
      "button",
      {
        disabled,
        onclick,
        style: {
          opacity: disabled ? "0.5" : undefined,
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: "16px",
          padding: "0 16px",
          height: "64px",
        },
      },
      [
        createElement("div", {
          innerHTML: icon,
          style: {
            width: "32px",
            height: "32px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fill: "var(--foreground)",
          },
        }),
        createElement("label", { innerText: display }),
      ]
    )
  );
}
