export type CreateElementProperties<E extends HTMLElement = HTMLElement> =
  | (Partial<Omit<E, "style">> & {
      style?: Partial<CSSStyleDeclaration>;
      [k: string]: unknown | undefined;
    })
  | null;

export type CreateElementContent =
  | Array<HTMLElement | string>
  | HTMLElement
  | string;

declare global {
  function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    properties?: CreateElementProperties<HTMLElementTagNameMap[K]>,
    ...content: CreateElementContent[]
  ): HTMLElementTagNameMap[K];
  function createElement<E extends HTMLElement>(
    tag: Constructor<E>,
    properties?: CreateElementProperties<HTMLElement>,
    ...content: CreateElementContent[]
  ): E;
}

Object.assign(globalThis, { createElement });

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  properties?: CreateElementProperties<HTMLElementTagNameMap[K]>,
  ...content: CreateElementContent[]
): HTMLElementTagNameMap[K];
export function createElement<E extends HTMLElement>(
  tag: Constructor<E>,
  properties?: CreateElementProperties<E>,
  ...content: CreateElementContent[]
): E;

export function createElement(
  tag: string | Constructor<HTMLElement>,
  properties?: CreateElementProperties,
  ...content: CreateElementContent[]
): HTMLElement {
  const element = (
    typeof tag === "string" ? document.createElement(tag) : new tag()
  ) as HTMLElement & { niche?: HTMLElement };
  const niche = element.niche instanceof HTMLElement ? element.niche : element;
  for (const child of content.flat()) if (child) niche.append(child);
  for (const [key, value] of Object.entries(properties || {})) {
    if (value === undefined) continue;
    else if (key === "style") Object.assign(element.style, value);
    else if (key in element || typeof value === "function")
      (element as unknown as Record<string, unknown>)[key] = value;
    else element.setAttribute(key, String(value));
  }
  if (typeof properties?.oncreate === "function") properties.oncreate(element);
  return element;
}
