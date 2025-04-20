import "./AuditModal.css";
import { AuditEntry, getAuditEntries } from "../../audit";
import { ModalHeader } from "../../elements/ModalHeader";
import { AuditEntryElement } from "./AuditEntryElement";

@tag("app-audit-modal")
export class AuditModal extends HTMLElement {
  private mainElement: HTMLElement;
  private auditEntries: AuditEntry[] = [];
  private renderIndex = 0;
  private control?: AbortController;

  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "Audit log" }),
      (this.mainElement = createElement("main"))
    );
  }

  async connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    this.mainElement.replaceChildren();
    this.renderIndex = 0;
    this.auditEntries = (await getAuditEntries().catch(alert)) || [];
    this.renderMore();
    this.mainElement.addEventListener("scroll", this.renderMore.bind(this), {
      passive: true,
    });
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
  }

  private renderMore() {
    while (
      this.renderIndex < this.auditEntries.length &&
      this.getScrollBottom() < 320
    )
      this.renderNextEntry();
  }

  private getScrollBottom() {
    const { height } = this.mainElement.getBoundingClientRect();
    return Math.max(
      0,
      this.mainElement.scrollHeight - this.mainElement.scrollTop - height
    );
  }

  private renderNextEntry() {
    const entry = this.auditEntries[this.renderIndex];
    if (!entry) return false;
    this.renderIndex++;
    this.mainElement.append(createElement(AuditEntryElement, { entry }));
    return true;
  }
}
