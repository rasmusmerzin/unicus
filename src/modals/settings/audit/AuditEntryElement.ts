import "./AuditEntryElement.css";
import {
  AuditEntry,
  auditEntryDescription,
  auditEntryIcon,
  auditEntryTitle,
} from "../../../audit";
import { formatTime } from "../../../date";

@tag("app-audit-entry-element")
export class AuditEntryElement extends HTMLElement {
  private iconElement: HTMLElement;
  private titleElement: HTMLElement;
  private descriptionElement: HTMLElement;
  private dateElement: HTMLElement;

  set entry(entry: AuditEntry) {
    this.titleElement.innerText = auditEntryTitle(entry);
    const description = auditEntryDescription(entry);
    if (typeof description === "string")
      this.descriptionElement.innerText = description;
    else
      this.descriptionElement.replaceChildren(
        ...description.map((element) =>
          createElement("div", { innerText: element })
        )
      );
    this.dateElement.innerText = formatTime(entry.created);
    this.iconElement.innerHTML = auditEntryIcon(entry);
  }

  constructor() {
    super();
    this.replaceChildren(
      createElement("div", {}, [
        (this.iconElement = createElement("div", { className: "icon" })),
        createElement("div", { className: "content" }, [
          (this.titleElement = createElement("div", { className: "title" })),
          (this.descriptionElement = createElement("div", {
            className: "description",
          })),
          (this.dateElement = createElement("div", { className: "date" })),
        ]),
      ])
    );
  }
}
