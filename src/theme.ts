const darkMode = matchMedia("(prefers-color-scheme: dark)");
const themeMeta = document.head.querySelector<HTMLMetaElement>(
  "meta[name=theme-color]"
)!;
const iconLink =
  document.head.querySelector<HTMLLinkElement>("link[rel=icon]")!;

export function updateTheme(content = darkMode.matches ? "#000" : "#fff") {
  themeMeta.content = content;
}

export function userPrefersDarkMode(): boolean {
  return darkMode.matches;
}

export function updateIconColors(
  background = getPrimaryColorValue(),
  foreground = getPrimaryForegroundColorValue()
) {
  iconLink.href = iconDataUrl(background, foreground);
}

export function getPrimaryColorValue(): string {
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue("--primary");
}

export function getPrimaryForegroundColorValue(): string {
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue("--primary-foreground");
}

function iconDataUrl(background?: string, foreground?: string) {
  const svg = icon(background, foreground);
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function icon(background = "#000", foreground = "#fff") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="${background}" ry="32"/><path fill="${foreground}" d="M40.454 100.517c-1.397-.343-2.702-1.326-3.506-2.64-.632-1.034-1.138-30.374-.602-34.9.293-2.47 2.237-4.312 4.845-4.592l2.087-.225.214-7.315c.228-7.794.296-8.149 2.35-12.353 5.876-12.028 22.4-15.034 32.145-5.847 5.14 4.845 6.6 8.782 6.845 18.46.118 4.696.297 6.889.563 6.905 2.862.173 4.404.909 5.603 2.674l.881 1.296v17.327c0 19.11.047 18.675-2.201 20.487l-1.08.87-23.531.06c-12.943.032-24.018-.062-24.613-.207m27.734-11.49c0-.174-.397-2.33-.883-4.79l-.881-4.476 1.01-.871c4.124-3.555 2.108-9.93-3.14-9.93-5.28 0-7.63 6.874-3.417 9.99 1.211.895 1.26 1.4.518 5.283-.288 1.503-.524 3.266-.524 3.921v1.188h3.66c2.011 0 3.657-.142 3.657-.316m7.662-37.485c-.003-6.266-.05-6.716-.846-8.43-4.356-9.351-17.374-9.231-21.737.201-.873 1.887-1.64 12.781-1.014 14.408.132.344 2.755.44 11.884.44h11.716Z"/></svg>`;
}
