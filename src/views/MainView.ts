import { vaultCell } from "../vault";

@tag("app-main")
export class MainView extends HTMLElement {
  constructor() {
    super();
    this.innerText = JSON.stringify(vaultCell.value, null, 2);
  }
}
