export interface Subject<T> {
  addEventListener(
    type: "change",
    listener: (event: SubjectChangeEvent<T>) => any,
    options?: AddEventListenerOptions | boolean
  ): void;
  addEventListener(
    type: string,
    listener: (event: Event) => any,
    options?: AddEventListenerOptions | boolean
  ): void;
}

export class Subject<T> extends EventTarget {
  constructor(private value: T) {
    super();
  }

  current() {
    return this.value;
  }

  next(value: T) {
    this.value = value;
    this.dispatchEvent(new SubjectChangeEvent(value));
    return this.value;
  }

  subscribe(listener: (value: T) => any, control: AbortController) {
    this.addEventListener("change", (e) => listener(e.value), control);
    listener(this.value);
  }
}

export class SubjectChangeEvent<T> extends Event {
  constructor(readonly value: T) {
    super("change");
  }
}
