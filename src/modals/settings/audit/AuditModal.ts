import "./AuditModal.css";
import { AuditEntry, getAllAuditEntries } from "../../../audit";
import { AuditEntryElement } from "./AuditEntryElement";
import { ModalHeader } from "../../../elements/ModalHeader";
import { formatDate, sameDate } from "../../../date";

@tag("app-audit-modal")
export class AuditModal extends HTMLElement {
  private mainElement: HTMLElement;
  private control?: AbortController;
  private entries: AuditEntry[] = [];
  private cursor = 0;

  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "Audit log" }),
      (this.mainElement = createElement("main"))
    );
  }

  async connectedCallback() {
    const entries = await getAllAuditEntries();
    this.entries = entries.reverse();
    this.cursor = 0;
    this.mainElement.replaceChildren();
    this.render();
    this.control?.abort();
    this.control = new AbortController();
    this.mainElement.addEventListener("scroll", this.render.bind(this), {
      signal: this.control.signal,
      passive: true,
    });
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
  }

  private render() {
    while (
      this.cursor < this.entries.length &&
      this.getScrollBottom() < this.mainElement.clientHeight
    )
      this.renderNext();
  }

  private renderNext() {
    const entry = this.entries[this.cursor];
    if (!entry) return;
    const previous = this.entries[this.cursor - 1];
    this.cursor++;
    if (!sameDate(entry.created, previous?.created))
      this.mainElement.append(
        createElement("h3", {}, formatDate(entry.created))
      );
    this.mainElement.append(createElement(AuditEntryElement, { entry }));
  }

  private getScrollBottom() {
    const { scrollTop, clientHeight, scrollHeight } = this.mainElement;
    return scrollHeight - scrollTop - clientHeight;
  }
}
