import "./MainHeaderElement.css";
import { FloatingModal } from "../../elements/FloatingModal";
import { MainView } from "./MainView";
import { QrCodeModal } from "../../modals/qrcode/QrCodeModal";
import { SettingsModal } from "../../modals/settings/SettingsModal";
import { UpsertModal } from "../../modals/upsert/UpsertModal";
import {
  close,
  copy,
  edit,
  lock,
  qr,
  search,
  selectAll,
  settings,
  trash,
} from "../../icons";
import { clickFeedback } from "../../mixins/clickFeedback";
import {
  deleteVaultEntry,
  entryFilterPredicate,
  getVaultEntry,
  lockVault,
  vault$,
} from "../../vault";
import { entryDisplayName, entryToCode } from "../../vault";
import { openModal, updateView } from "../../view";
import { storeAuditEntry } from "../../audit";

@tag("app-main-header")
export class MainHeaderElement extends HTMLElement {
  private timerBarElement: HTMLElement;
  private selectAllButton: HTMLButtonElement;
  private searchInput: HTMLInputElement;

  private animationFrame?: number;
  private control?: AbortController;

  constructor() {
    super();
    this.replaceChildren(
      createElement("h2", { textContent: document.title }),
      createElement("div", { className: "actions" }, [
        clickFeedback(
          createElement("button", {
            className: "search",
            innerHTML: search(),
            onclick: () =>
              MainView.instance!.search$.next(this.searchInput.value),
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
      createElement("div", { className: "search" }, [
        (this.searchInput = createElement("input", {
          spellcheck: false,
          type: "text",
          oninput: () =>
            MainView.instance!.search$.next(this.searchInput.value),
          onblur: () =>
            !this.searchInput.value && MainView.instance!.search$.next(null),
        })),
        clickFeedback(
          createElement("button", {
            innerHTML: close(),
            onclick: () => history.back(),
          }),
          { size: 0.5 }
        ),
        createElement("div", { className: "placeholder" }, [
          createElement("div", { className: "icon", innerHTML: search(20) }),
          createElement("div", { className: "text", innerText: "Search" }),
        ]),
      ]),
      (this.timerBarElement = createElement("div", {
        className: "timer-bar",
      })),
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
      ])
    );
  }

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    vault$.subscribe((vault) => {
      if (vault?.entries?.length) this.classList.remove("empty");
      else this.classList.add("empty");
    }, this.control);
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
    MainView.instance!.search$.subscribe((search) => {
      this.searchInput.value = search || "";
      if (search !== null) {
        this.setAttribute("search", this.searchInput.value);
        this.searchInput.focus();
      } else this.removeAttribute("search");
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
    const search = MainView.instance!.search$.current();
    let entries = vault$.current()!.entries!;
    if (search) entries = entries.filter(entryFilterPredicate(search));
    const uuids = entries.map((entry) => entry.uuid);
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
          onclick: async () => {
            try {
              await deleteVaultEntry(...uuids);
              storeAuditEntry({
                type: "delete",
                entries: entries.map(({ uuid, name, issuer }) => ({
                  uuid,
                  name,
                  issuer,
                })),
              });
              MainView.instance!.selected$.next([]);
            } catch (error) {
              alert(error);
            }
          },
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
    const entry = getVaultEntry(uuid)!;
    const code = entryToCode(entry);
    if (!code) return;
    navigator.clipboard.writeText(code);
    const { name, issuer } = entry;
    storeAuditEntry({ type: "copy-code", uuid, name, issuer });
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
