import "./style.css";
import "./virtual-keyboard";
import { fingerprint } from "./fingerprint";

const app = document.getElementById("app")!;

const output = document.createElement("pre");
const button = document.createElement("button");
button.textContent = "Fingerprint";
button.addEventListener("click", () =>
  fingerprint()
    .then((credential) => {
      output.textContent = JSON.stringify(credential, null, 2);
      output.style.color = "";
    })
    .catch((error) => {
      output.textContent = error;
      output.style.color = "#f00";
    })
);

app.replaceChildren(button, output);
