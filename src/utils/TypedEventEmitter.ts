export interface TypedEventEmitter<
  E extends { [eventName in keyof E]: any[] },
> {
  on<K extends keyof E>(eventName: K, listener: (...args: E[K]) => void): this;
  emit<K extends keyof E>(eventName: K, ...args: E[K]): this;
}

