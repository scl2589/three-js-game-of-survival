function resolveNames(_names: string) {
  return _names
    .replace(/[^a-zA-Z0-9 ,/.]/g, "")
    .replace(/[,/]+/g, " ")
    .split(" ");
}

function resolveName(name: string) {
  const parts = name.split(".");

  const newName = {
    original: name,
    value: parts[0],
    namespace: "base",
  };

  if (parts.length > 1 && parts[1] !== "") {
    newName.namespace = parts[1];
  }

  return newName;
}

export default class EventEmitter {
  callbacks: { [namespace: string]: { [value: string]: Function[] } };

  constructor() {
    this.callbacks = {};
    this.callbacks.base = {};
  }

  on(names: string, callback: Function) {
    if (!names) {
      console.warn("wrong name");
      return this;
    }

    resolveNames(names).forEach((name) => this._push(name, callback));
    return this;
  }

  off(names: string) {
    if (!names) {
      console.warn("wrong name");
      return this;
    }
    resolveNames(names).forEach((name) => this._delete(name));
    return this;
  }

  trigger(_name: string, _args?: unknown[]) {
    if (_name === "") {
      console.warn("wrong name");
      return false;
    }

    const args = Array.isArray(_args) ? _args : [];

    return this._findAll(resolveNames(_name)[0]).reduce((result, callback) => {
      const newResult = callback.apply(this, args);
      return result ? result : newResult;
    }, undefined);
  }

  private _delete(name: string) {
    const { namespace, value } = resolveName(name);

    if (namespace === "base" && value) {
      for (const namespace in this.callbacks) {
        delete this.callbacks[namespace][value];

        if (Object.keys(this.callbacks[namespace]).length === 0) {
          delete this.callbacks[namespace];
        }
      }

      return this;
    }

    if (!value) {
      delete this.callbacks[namespace];
      return this;
    }

    delete this.callbacks[namespace][value];

    if (Object.keys(this.callbacks[namespace]).length === 0) {
      delete this.callbacks[namespace];
    }

    return this;
  }

  private _push(name: string, callback: Function) {
    const { namespace, value } = resolveName(name);

    if (!this.callbacks[namespace]) {
      this.callbacks[namespace] = {};
    }

    if (!Array.isArray(this.callbacks[namespace][value])) {
      this.callbacks[namespace][value] = [];
    }

    this.callbacks[namespace][value].push(callback);

    return this;
  }

  private _findAll(name: string) {
    if (!name) {
      return [];
    }
    const { namespace, value } = resolveName(name);

    const functions: Function[] = [];
    if (namespace === "base") {
      for (const namespace in this.callbacks) {
        if (!Array.isArray(this.callbacks[namespace][value])) {
          continue;
        }
        this.callbacks[namespace][value].forEach((callback) =>
          functions.push(callback)
        );
      }
      return functions;
    }

    if (!this.callbacks[namespace] || !value) {
      return [];
    }

    return this.callbacks[namespace][value];
  }
}
