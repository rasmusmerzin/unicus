import decodeQR from "qr/decode.js";
import { DrawerModal } from "../../elements/DrawerModal";
import { ScanModal } from "../../modals/scan/ScanModal";
import { UpsertModal } from "../../modals/upsert/UpsertModal";
import { addImage, edit, scanQr } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import { entryFromUri } from "../../vault";
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
    Option({
      icon: addImage(),
      display: "Scan image",
      onclick() {
        history.back();
        promptImageScan();
      },
    }),
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

function promptImageScan() {
  const fileInput = createElement("input", {
    type: "file",
    accept: "image/*",
    async onchange() {
      const [file] = fileInput.files || [];
      if (!file) return;
      try {
        const imageData = await fileToImageData(file);
        const result = decodeQR(imageData);
        const entry = entryFromUri(result);
        const modal = createElement(UpsertModal, entry);
        openModal(modal);
      } catch (error) {
        alert(error);
      }
    },
  });
  fileInput.click();
}

function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return reject(new Error("Failed to create canvas context"));
    const image = new Image();
    image.onabort = image.onerror = reject;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      resolve(context.getImageData(0, 0, image.width, image.height));
    };
    image.src = URL.createObjectURL(file);
  });
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
        createElement("label", {
          innerText: display,
          style: {
            pointerEvents: "none",
          },
        }),
      ]
    )
  );
}
