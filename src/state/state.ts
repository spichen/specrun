/**
 * State holds key-value data flowing through the graph.
 * It uses an immutable pattern: mutating methods return a new State.
 */
export class State {
  private readonly data: Record<string, unknown>;

  constructor(data?: Record<string, unknown> | null) {
    this.data = data ? { ...data } : {};
  }

  /** Get retrieves a value by key. */
  get(key: string): [unknown, boolean] {
    if (key in this.data) {
      return [this.data[key], true];
    }
    return [undefined, false];
  }

  /** GetString retrieves a string value by key. */
  getString(key: string): [string, boolean] {
    const [v, ok] = this.get(key);
    if (!ok) return ['', false];
    if (typeof v === 'string') return [v, true];
    return ['', false];
  }

  /** Set returns a new State with the given key-value pair added/replaced. */
  set(key: string, value: unknown): State {
    const newData = { ...this.data };
    newData[key] = value;
    return new State(newData);
  }

  /** Merge returns a new State with all key-value pairs from other merged in. */
  merge(other: State): State {
    const newData = { ...this.data, ...other.data };
    return new State(newData);
  }

  /** Clone returns a deep copy of this State. */
  clone(): State {
    return new State({ ...this.data });
  }

  /** Keys returns all keys in the state. */
  keys(): string[] {
    return Object.keys(this.data);
  }

  /** Data returns the underlying map (as a copy). */
  toData(): Record<string, unknown> {
    return { ...this.data };
  }

  /** toJSON serializes State to a plain object for JSON.stringify. */
  toJSON(): Record<string, unknown> {
    return { ...this.data };
  }

  /** String returns a JSON string representation. */
  toString(): string {
    try {
      return JSON.stringify(this.data);
    } catch (err) {
      return `<error: ${err}>`;
    }
  }
}
