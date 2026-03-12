export class Writable<T> {
  private storageKey: string;

  constructor(key: string, value?: T) {
    if (window.window && window.localStorage) {
      this.storageKey = key;
      const currentVal = window.localStorage.getItem(key);
      if (value && !currentVal)
        window.localStorage.setItem(this.storageKey, JSON.stringify(value));
    } else {
      throw new Error("This module is only for frontend");
    }
  }

  delete() {
    window.localStorage.removeItem(this.storageKey);
  }

  set(value: T) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(value));
  }

  get(): T | null {
    const value = window.localStorage.getItem(this.storageKey);
    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        window.localStorage.removeItem(this.storageKey);
        return null;
      }
    }
    return null;
  }

  update(func: (t: T) => void) {
    const value = this.get();
    if (value) {
      func(value);
      this.set(value);
    }
  }
}
