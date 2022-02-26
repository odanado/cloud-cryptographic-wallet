export interface Store<T> {
  set(key: string, value: T): Promise<void>;
  get(key: string): Promise<T | undefined>;
}

export class MemoryStore<T> implements Store<T> {
  private readonly store: { [key: string]: T };
  public constructor() {
    this.store = {};
  }
  public async set(key: string, value: T): Promise<void> {
    this.store[key] = value;
  }

  public get(key: string): Promise<T | undefined> {
    return Promise.resolve(this.store[key]);
  }
}
