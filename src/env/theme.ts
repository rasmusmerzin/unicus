const darkMode = matchMedia("(prefers-color-scheme: dark)");
const media = document.head.querySelector<HTMLMetaElement>(
  "meta[name=theme-color]"
)!;

setTimeout(updateTheme);

function updateTheme() {
  media.content = darkMode.matches ? "#000" : "#fff";
}
