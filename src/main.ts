import "./style.css";
import "./virtual-keyboard";
import "./create-element";
import "./tag";
import { SetupView } from "./SetupView";

const app = document.getElementById("app")!;

app.replaceChildren(new SetupView());
