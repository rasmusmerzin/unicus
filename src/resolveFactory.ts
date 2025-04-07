import { isClass } from "./isClass";

export function resolveFactory<T, A extends any[] = any[]>(
  factory: Factory<T, A>,
  ...args: A
): T {
  if (typeof factory === "function") {
    if (isClass(factory)) return new (factory as any)(...args);
    else return (factory as any)(...args);
  }
  return factory;
}
