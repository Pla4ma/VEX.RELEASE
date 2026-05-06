/**
 * react-native-mmkv shim for environments where the native module is unavailable
 * (e.g. Expo Go). Uses an in-memory Map as backing store so all MMKV-dependent
 * code continues to function without crashing.
 *
 * This shim is wired via metro.config.js → resolver.extraNodeModules.
 * In a real native build (custom dev client / production), the actual native
 * react-native-mmkv package is resolved instead.
 *
 * NOTE: Data does NOT persist across app restarts in this shim mode.
 */

'use strict';

import * as React from 'react';

// ---------------------------------------------------------------------------
// In-memory store registry
// ---------------------------------------------------------------------------
/** @type {Map<string, Map<string, any>>} */
const stores = {};

function getStore(id) {
  if (!stores[id]) {
    stores[id] = new Map();
  }
  return stores[id];
}

// ---------------------------------------------------------------------------
// MMKV shim class
// ---------------------------------------------------------------------------
class MMKV {
  constructor(options) {
    this._id = (options && options.id) || 'default';
    this._store = getStore(this._id);
  }

  getString(key) {
    const v = this._store.get(key);
    return typeof v === 'string' ? v : undefined;
  }

  getNumber(key) {
    const v = this._store.get(key);
    return typeof v === 'number' ? v : undefined;
  }

  getBoolean(key) {
    const v = this._store.get(key);
    return typeof v === 'boolean' ? v : undefined;
  }

  set(key, value) {
    this._store.set(key, value);
  }

  contains(key) {
    return this._store.has(key);
  }

  delete(key) {
    this._store.delete(key);
  }

  clearAll() {
    this._store.clear();
  }

  getAllKeys() {
    return Array.from(this._store.keys());
  }

  // react-native-mmkv v2+ listener API — no-op in shim
  addOnValueChangedListener(_callback) {
    return { remove: () => {} };
  }
}

// ---------------------------------------------------------------------------
// Hook shims — mirrors the real react-native-mmkv hook API
// ---------------------------------------------------------------------------

function useMMKVString(key, mmkv) {
  const storage = mmkv instanceof MMKV ? mmkv : new MMKV({ id: 'default' });
  const [value, setValue] = React.useState(() => storage.getString(key));

  const setter = React.useCallback(
    (v) => {
      if (v === undefined) {
        storage.delete(key);
      } else {
        storage.set(key, v);
      }
      setValue(v);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, setter];
}

function useMMKVNumber(key, mmkv) {
  const storage = mmkv instanceof MMKV ? mmkv : new MMKV({ id: 'default' });
  const [value, setValue] = React.useState(() => storage.getNumber(key));

  const setter = React.useCallback(
    (v) => {
      if (v === undefined) {
        storage.delete(key);
      } else {
        storage.set(key, v);
      }
      setValue(v);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, setter];
}

function useMMKVBoolean(key, mmkv) {
  const storage = mmkv instanceof MMKV ? mmkv : new MMKV({ id: 'default' });
  const [value, setValue] = React.useState(() => storage.getBoolean(key));

  const setter = React.useCallback(
    (v) => {
      if (v === undefined) {
        storage.delete(key);
      } else {
        storage.set(key, v);
      }
      setValue(v);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, setter];
}

function useMMKVObject(key, mmkv) {
  const storage = mmkv instanceof MMKV ? mmkv : new MMKV({ id: 'default' });
  const [value, setValue] = React.useState(() => {
    const raw = storage.getString(key);
    try {
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  });

  const setter = React.useCallback(
    (v) => {
      if (v === undefined) {
        storage.delete(key);
      } else {
        storage.set(key, JSON.stringify(v));
      }
      setValue(v);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, setter];
}

function useMMKV(options) {
  const id = (options && options.id) || 'default';
  const ref = React.useRef(null);
  if (!ref.current) {
    ref.current = new MMKV({ id });
  }
  return ref.current;
}

export {
  MMKV,
  useMMKV,
  useMMKVString,
  useMMKVNumber,
  useMMKVBoolean,
  useMMKVObject,
};
