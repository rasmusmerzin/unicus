declare interface Constructor<T, A extends any[] = any[]> {
  new (...args: A): T;
  prototype: T;
}

declare type Factory<T, A extends any[] = any[]> =
  | T
  | Constructor<T, A>
  | ((...args: A) => T);
