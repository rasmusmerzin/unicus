import "./AboutModal.css";
import { ModalHeader } from "../../../elements/ModalHeader";
import { code, contract, info, mail, person, update } from "../../../icons";
import { clickFeedback } from "../../../mixins/clickFeedback";

@tag("app-about-modal")
export class AboutModal extends HTMLElement {
  constructor() {
    super();
    this.replaceChildren(
      createElement(ModalHeader, { title: "About" }),
      createElement("main", {}, [
        createElement("article", {}, [
          createElement("div", { className: "header" }, [
            createElement("img", { src: "/icon.svg" }),
            createElement("h2", {}, "Unicus"),
          ]),
          Entry({
            icon: info(),
            label: "Version",
            description: "1.0.0",
            onclick: () => navigator.clipboard.writeText("1.0.0"),
          }),
          Entry({
            icon: update(),
            label: "Changelog",
            description: "What's new",
            href: "https://github.com/rasmusmerzin/unicus/blob/main/CHANGELOG.md",
          }),
          Entry({
            icon: code(),
            label: "GitHub",
            description: "Source code, issues and information",
            href: "https://github.com/rasmusmerzin/unicus",
          }),
          Entry({
            icon: contract(),
            label: "License",
            description: "Unicus is licensed under the MIT license",
            href: "https://raw.githubusercontent.com/rasmusmerzin/unicus/refs/heads/main/LICENSE",
          }),
          Entry({
            icon: person(),
            label: "Author",
            description: "Emil Rasmus Merzin",
            href: "https://merzin.dev",
          }),
          Entry({
            icon: mail(),
            label: "Contact",
            description: "Write an email",
            href: "mailto:rasmusmerzin@gmail.com?subject=Unicus",
          }),
        ]),
      ])
    );
  }
}

function Entry({
  icon,
  label,
  description,
  href,
  onclick,
}: {
  icon: string;
  label: string;
  description: string;
  href?: string;
  onclick?: () => any;
}) {
  if (!onclick) onclick = href ? () => open(href, "_blank") : undefined;
  return clickFeedback(
    createElement("button", { className: "entry", onclick }, [
      createElement("div", { className: "icon", innerHTML: icon }),
      createElement("div", { className: "content" }, [
        createElement("div", { className: "label" }, label),
        createElement("div", { className: "description" }, description),
      ]),
    ])
  );
}
