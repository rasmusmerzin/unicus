const darkMode = matchMedia("(prefers-color-scheme: dark)");
const media = document.head.querySelector<HTMLMetaElement>(
  "meta[name=theme-color]"
)!;

export function updateTheme(content = darkMode.matches ? "#000" : "#fff") {
  media.content = content;
}

export function userPrefersDarkMode(): boolean {
  return darkMode.matches;
}
