import "./MainView.css";
import { MainHeaderElement } from "./MainHeaderElement";
import { MainContentElement } from "./MainContentElement";
import { Subject } from "../../Subject";
import { onback } from "../../view";
import { moveVaultEntry } from "../../vault";

export interface Dragging {
  originIndex: number;
  targetIndex: number;
}

@tag("app-main")
export class MainView extends HTMLElement {
  static readonly instance?: MainView;

  readonly selected$ = new Subject<string[]>([]);
  readonly dragging$ = new Subject<Dragging | null>(null);

  private control?: AbortController;
  private cancelBack?: () => void;

  constructor() {
    super();
    this.replaceChildren(
      createElement(MainHeaderElement),
      createElement(MainContentElement)
    );
    (MainView as any).instance = this;
  }

  connectedCallback() {
    this.control?.abort();
    this.control = new AbortController();
    this.selected$.subscribe((current, previous) => {
      if (current.length && !previous?.length)
        this.cancelBack = onback(() => this.selected$.next([]));
      else if (previous?.length && !current.length && this.cancelBack)
        this.cancelBack();
    }, this.control);
    this.dragging$.subscribe((current, previous) => {
      if (current || !previous) return;
      const { originIndex, targetIndex } = previous;
      moveVaultEntry(originIndex, targetIndex).catch(alert);
    }, this.control);
  }

  disconnectedCallback() {
    this.control?.abort();
    delete this.control;
    if (this.cancelBack) this.cancelBack();
  }
}
