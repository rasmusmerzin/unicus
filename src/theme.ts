const darkMode = matchMedia("(prefers-color-scheme: dark)");
const themeMeta = document.head.querySelector<HTMLMetaElement>(
  "meta[name=theme-color]"
)!;
const iconLink =
  document.head.querySelector<HTMLLinkElement>("link[rel=icon]")!;

export function updateThemeColor(
  content = getColorScheme() === "dark" ? "#000" : "#fff"
) {
  themeMeta.content = content;
}

export function getColorScheme(): "dark" | "light" {
  const override = document.documentElement.getAttribute("color-scheme");
  if (override === "dark") return "dark";
  else if (override === "light") return "light";
  else return darkMode.matches ? "dark" : "light";
}

export function setColorScheme(scheme: "dark" | "light" | "system" = "system") {
  if (scheme === "dark")
    document.documentElement.setAttribute("color-scheme", "dark");
  else if (scheme === "light")
    document.documentElement.setAttribute("color-scheme", "light");
  else document.documentElement.removeAttribute("color-scheme");
}

export function updateIconColors(
  background = getPrimaryColorValue(),
  foreground = getPrimaryForegroundColorValue()
) {
  iconLink.href = iconDataUrl(background, foreground);
}

function getPrimaryColorValue(): string {
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue("--primary");
}

function getPrimaryForegroundColorValue(): string {
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue("--primary-foreground");
}

function iconDataUrl(background?: string, foreground?: string) {
  const svg = icon(background, foreground);
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function icon(background = "#000", foreground = "#fff") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 128 128"><rect width="128" height="128" fill="${background}" ry="32"/><path fill="${foreground}" d="M40.48 100.517c-1.397-.343-2.702-1.326-3.506-2.64-.066-.107-.3-.518-.361-1.175-.535-5.674-.722-29.668-.241-33.725.293-2.47 2.237-4.312 4.845-4.592l2.087-.225.214-7.315c.228-7.794.296-8.15 2.35-12.353 5.876-12.028 22.4-15.034 32.145-5.847 5.14 4.845 6.6 8.782 6.845 18.46.118 4.696.297 6.889.563 6.905 2.862.173 4.404.951 5.673 2.674.304.422.792 1.098.81 2.045v16.578c0 19.11.048 18.675-2.2 20.487q-.936.774-2.212.87l-22.4.06c-12.942.032-24.017-.062-24.612-.207m27.734-11.49c0-.174-.397-2.33-.883-4.79l-.881-4.476 1.01-.871c4.124-3.555 2.108-9.93-3.14-9.93-5.28 0-7.63 6.874-3.417 9.99 1.21.895 1.26 1.4.518 5.283-.288 1.503-.524 3.266-.524 3.92v1.189h3.66c2.01 0 3.657-.142 3.657-.316m7.662-37.485c-.003-6.266-.05-6.716-.846-8.43-4.356-9.351-17.374-9.231-21.737.2-.873 1.888-1.64 12.782-1.014 14.409.132.344 2.755.44 11.884.44h11.716z"/></svg>`;
}
