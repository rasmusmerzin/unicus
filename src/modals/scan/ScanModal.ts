import "./ScanModal.css";
import decodeQR from "qr/decode.js";
import { UpsertModal } from "../upsert/UpsertModal";
import { backArrow, switchCamera } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import {
  entriesFromUri,
  importPartials,
  importResultMessage,
} from "../../vault";
import { isModalOnTop, openModal } from "../../view";

@tag("app-scan-modal")
export class ScanModal extends HTMLElement {
  private canvasElement = createElement("canvas");
  private videoElement: HTMLVideoElement;
  private facingMode: "environment" | "user" = "environment";
  private scanTimeout: any;

  constructor() {
    super();
    this.replaceChildren(
      createElement("div", { className: "video-container" }, [
        (this.videoElement = createElement("video", {
          className: this.facingMode,
          autoplay: true,
          onclick: this.toggleContain.bind(this),
        })),
      ]),
      clickFeedback(
        createElement("button", {
          className: "back",
          innerHTML: backArrow(),
          onclick: () => history.back(),
        }),
        { size: 0.5 }
      ),
      clickFeedback(
        createElement("button", {
          className: "flip",
          innerHTML: switchCamera(),
          onclick: this.flipCamera.bind(this),
        }),
        { size: 0.5 }
      )
    );
  }

  async connectedCallback() {
    try {
      await this.attachCameraStream();
      this.scan();
    } catch (error) {
      alert(error);
    }
  }

  disconnectedCallback() {
    clearTimeout(this.scanTimeout);
    this.stopCameraStream();
  }

  private async flipCamera() {
    this.videoElement.className = this.facingMode =
      this.facingMode === "environment" ? "user" : "environment";
    return this.attachCameraStream().catch(alert);
  }

  private async scan() {
    clearTimeout(this.scanTimeout);
    if (!isModalOnTop(this))
      return (this.scanTimeout = setTimeout(this.scan.bind(this), 100));
    const imageData = this.getVideoFrameImageData();
    try {
      const result = decodeQR(imageData);
      try {
        const entries = entriesFromUri(result);
        if (entries.length === 1) {
          this.disconnectedCallback();
          history.back();
          setTimeout(openModal, 100, createElement(UpsertModal, entries[0]), {
            duration: 0,
          });
        } else {
          const importResult = await importPartials(entries);
          alert(importResultMessage(importResult));
        }
      } catch (error) {
        alert(error);
      }
    } catch (error) {}
    if (document.contains(this))
      this.scanTimeout = setTimeout(this.scan.bind(this), 50);
  }

  private getVideoFrameImageData() {
    const context = this.canvasElement.getContext("2d")!;
    context.drawImage(this.videoElement, 0, 0);
    const { width, height } = this.canvasElement;
    return context.getImageData(0, 0, width, height);
  }

  private async attachCameraStream() {
    this.stopCameraStream();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: this.facingMode },
    });
    this.videoElement.srcObject = stream;
    const { width, height } = stream.getVideoTracks()[0].getSettings();
    if (!width || !height) throw new Error("Couldn't get video size");
    this.canvasElement.width = width;
    this.canvasElement.height = height;
  }

  private stopCameraStream() {
    if (!this.videoElement.srcObject) return;
    const stream = this.videoElement.srcObject as MediaStream;
    for (const track of stream.getTracks()) track.stop();
    this.videoElement.srcObject = null;
  }

  private toggleContain() {
    if (this.classList.contains("contain")) this.classList.remove("contain");
    else this.classList.add("contain");
  }
}
