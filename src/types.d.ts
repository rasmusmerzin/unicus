declare interface Constructor<T, A extends any[] = any[]> {
  new (...args: A): T;
  prototype: T;
}
