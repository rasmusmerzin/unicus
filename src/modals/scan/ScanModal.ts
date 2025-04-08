import decodeQR from "qr/decode.js";
import { backArrow, switchCamera } from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import "./ScanModal.css";
import { entryFromUri } from "../../vault";
import { UpsertModal } from "../upsert/UpsertModal";
import { openModal } from "../../view";

@tag("app-scan-modal")
export class ScanModal extends HTMLElement {
  private canvasElement = createElement("canvas");
  private videoElement: HTMLVideoElement;
  private facingMode: "environment" | "user" = "environment";
  private scanInterval: any;

  constructor() {
    super();
    this.replaceChildren(
      (this.videoElement = createElement("video", {
        className: this.facingMode,
        autoplay: true,
        onclick: this.toggleContain.bind(this),
      })),
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
      this.scanInterval = setInterval(this.scan.bind(this), 50);
    } catch (error) {
      alert(error);
    }
  }

  disconnectedCallback() {
    clearInterval(this.scanInterval);
    this.stopCameraStream();
  }

  private async flipCamera() {
    this.videoElement.className = this.facingMode =
      this.facingMode === "environment" ? "user" : "environment";
    return this.attachCameraStream().catch(alert);
  }

  private async scan() {
    const imageData = this.getVideoFrameImageData();
    try {
      const result = decodeQR(imageData);
      try {
        const entry = entryFromUri(result);
        const modal = createElement(UpsertModal, entry);
        this.disconnectedCallback();
        history.back();
        setTimeout(openModal, 100, modal, { duration: 0 });
      } catch (error) {
        alert(error);
      }
    } catch (error) {}
  }

  private getVideoFrameImageData() {
    const context = this.canvasElement.getContext("2d")!;
    context.drawImage(this.videoElement, 0, 0);
    return context.getImageData(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
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
