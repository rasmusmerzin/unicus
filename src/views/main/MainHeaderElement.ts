import "./MainHeaderElement.css";
import { AddDrawerModal } from "./AddDrawerModal";
import { FloatingModal } from "../../elements/FloatingModal";
import { MainView } from "./MainView";
import { QrCodeModal } from "../../modals/qrcode/QrCodeModal";
import { SettingsModal } from "../../modals/settings/SettingsModal";
import { UpsertModal } from "../../modals/upsert/UpsertModal";
import {
  add,
  close,
  copy,
  edit,
  lock,
  qr,
  selectAll,
  settings,
  trash,
} from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import {
  deleteVaultEntry,
  getVaultEntry,
  lockVault,
  vault$,
} from "../../vault";
import { entryDisplayName, entryToCode } from "../../vault";
import { openModal, updateView } from "../../view";

@tag("app-main-header")
export class MainHeaderElement extends HTMLElement {
  private timerBarElement: HTMLElement;
  private selectAllButton: HTMLButtonElement;
  private animationFrame?: number;
  private control?: AbortController;

  constructor() {
    super();
    this.replaceChildren(
      createElement("h2", { textContent: document.title }),
      createElement("div", { className: "actions" }, [
        clickFeedback(
          createElement("button", {
            innerHTML: add(32),
            onclick: () => openModal(AddDrawerModal),
          }),
          { size: 0.5 }
        ),
        clickFeedback(
          createElement("button", {
            innerHTML: lock(),
            onclick: this.lock.bind(this),
          }),
          { size: 0.5 }
        ),
        clickFeedback(
          createElement("button", {
            innerHTML: settings(),
            onclick: () => openModal(SettingsModal),
          }),
          { size: 0.5 }
        ),
      ]),
      createElement("div", { className: "selection" }, [
        clickFeedback(
          createElement("button", {
            innerHTML: close(28),
            onclick: () => history.back(),
          }),
          { size: 0.5 }
        ),
        createElement("div", { className: "actions" }, [
          clickFeedback(
            createElement("button", {
              className: "edit",
              innerHTML: edit(),
              onclick: this.edit.bind(this),
            }),
            { size: 0.5 }
          ),
          clickFeedback(
            createElement("button", {
              className: "copy",
              innerHTML: copy(),
              onclick: this.copy.bind(this),
            }),
            { size: 0.5 }
          ),
          clickFeedback(
            createElement("button", {
              innerHTML: trash(),
              onclick: this.trash.bind(this),
            }),
            { size: 0.5 }
          ),
          clickFeedback(
            createElement("button", {
              innerHTML: qr(),
              onclick: this.showQrCodes.bind(this),
            }),
            { size: 0.5 }
          ),
          (this.selectAllButton = clickFeedback(
            createElement("button", {
              innerHTML: selectAll(),
              onclick: this.selectAll.bind(this),
            }),
            { size: 0.5 }
          )),
        ]),
      ]),
      (this.timerBarElement = createElement("div", {
        className: "timer-bar",
      }))
    );
  }

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    MainView.instance!.selected$.subscribe((selected) => {
      if (selected.length) this.classList.add("selected");
      else this.classList.remove("selected");
      if (selected.length > 1) this.classList.add("multiple");
      else this.classList.remove("multiple");
      const allSelected = selected.length === vault$.current()?.entries?.length;
      if (allSelected) this.classList.add("all");
      else this.classList.remove("all");
      this.selectAllButton.disabled = allSelected;
    }, this.control);
    cancelAnimationFrame(this.animationFrame!);
    this.animateFrame();
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
    cancelAnimationFrame(this.animationFrame!);
  }

  private selectAll() {
    const uuids = vault$.current()!.entries!.map((entry) => entry.uuid);
    MainView.instance!.selected$.next(uuids);
  }

  private showQrCodes() {
    const uuids = MainView.instance!.selected$.current();
    const entries = uuids.map((entry) => getVaultEntry(entry)!);
    const modal = createElement(QrCodeModal, { entries });
    openModal(modal);
  }

  private trash() {
    const uuids = MainView.instance!.selected$.current();
    const entries = uuids.map((entry) => getVaultEntry(entry)!);
    const question =
      uuids.length > 1
        ? `<p>Are you sure you want to delete ${uuids.length} entries?</p>`
        : `<p>Are you sure you want to delete this entry?</p>`;
    const listItems = entries.map(
      (entry) => `<li>${entryDisplayName(entry)}</li>`
    );
    const list = `<ul>${listItems.join("")}</ul>`;
    const note = `<p><i>Note: This action does not disable 2FA.</i></p>`;
    const modal = createElement(FloatingModal, {
      title: uuids.length > 1 ? "Delete entries" : "Delete entry",
      innerHTML: question + list + note,
      actions: [
        { name: "Cancel" },
        {
          name: "OK",
          onclick: () =>
            deleteVaultEntry(...uuids)
              .then(() => MainView.instance!.selected$.next([]))
              .catch(alert),
        },
      ],
    });
    openModal(modal);
  }

  private edit() {
    const [uuid] = MainView.instance!.selected$.current();
    const modal = createElement(UpsertModal, {
      ...getVaultEntry(uuid),
      title: "Edit entry",
      deletable: true,
    });
    openModal(modal);
  }

  private copy() {
    const [uuid] = MainView.instance!.selected$.current();
    const code = entryToCode(getVaultEntry(uuid)!);
    if (code) navigator.clipboard.writeText(code);
  }

  private lock() {
    lockVault();
    updateView({ direction: "backwards" });
  }

  private animateFrame() {
    this.animationFrame = requestAnimationFrame(this.animateFrame.bind(this));
    const now = Date.now();
    const period = 30 * 1000;
    const start = now - (now % period);
    const progress = (now - start) / period;
    this.timerBarElement.style.width = `${(1 - progress) * 100}%`;
  }
}
