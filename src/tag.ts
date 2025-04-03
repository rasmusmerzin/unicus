declare global {
  function tag(tagName: string): (constructor: CustomElementConstructor) => any;
}

Object.assign(globalThis, { tag });

export function tag(tagName: string) {
  return (constructor: CustomElementConstructor) => {
    customElements.define(tagName, constructor);
    return constructor as any;
  };
}
