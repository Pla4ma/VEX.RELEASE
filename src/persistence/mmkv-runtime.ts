type MMKVValue = boolean | string | number | Uint8Array;

export interface RuntimeMMKVConfiguration {
  id: string;
  path?: string;
  encryptionKey?: string;
}

export type RuntimeMMKV = {
  set(key: string, value: MMKVValue): void;
  getBoolean(key: string): boolean | undefined;
  getString(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getBuffer(key: string): Uint8Array | undefined;
  contains(key: string): boolean;
  delete(key: string): void;
  getAllKeys(): string[];
  clearAll(): void;
  recrypt(key: string | undefined): void;
  size?: number;
};

interface NativeMMKVModule {
  createMMKV?: (configuration: RuntimeMMKVConfiguration) => unknown;
  MMKV?: new (configuration?: RuntimeMMKVConfiguration) => unknown;
}

interface NativeMMKV {
  set(key: string, value: MMKVValue): void;
  getBoolean?(key: string): boolean | undefined;
  getString?(key: string): string | undefined;
  getNumber?(key: string): number | undefined;
  getBuffer?(key: string): Uint8Array | undefined;
  contains?(key: string): boolean;
  remove?(key: string): void;
  delete?(key: string): void;
  getAllKeys?(): string[];
  clearAll?(): void;
  recrypt?(key: string | undefined): void;
  size?: number;
}

declare const require: (name: string) => NativeMMKVModule;

function canUseNativeMMKV(): boolean {
  return typeof (globalThis as { nativeCallSyncHook?: unknown })
    .nativeCallSyncHook === 'function';
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isNativeMMKV(value: unknown): value is NativeMMKV {
  return isRecord(value) && typeof value.set === 'function';
}

const memoryStores = new Map<string, Map<string, MMKVValue>>();

function getMemoryStore(id: string): Map<string, MMKVValue> {
  const existing = memoryStores.get(id);
  if (existing) {
    return existing;
  }

  const store = new Map<string, MMKVValue>();
  memoryStores.set(id, store);
  return store;
}

class MemoryMMKV implements RuntimeMMKV {
  private readonly store: Map<string, MMKVValue>;

  constructor(id: string) {
    this.store = getMemoryStore(id);
  }

  get size(): number {
    return this.getAllKeys().reduce((total, key) => {
      const value = this.store.get(key);
      return total + key.length + String(value ?? '').length;
    }, 0);
  }

  set(key: string, value: MMKVValue): void {
    this.store.set(key, value);
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.store.get(key);
    return typeof value === 'boolean' ? value : undefined;
  }

  getString(key: string): string | undefined {
    const value = this.store.get(key);
    return typeof value === 'string' ? value : undefined;
  }

  getNumber(key: string): number | undefined {
    const value = this.store.get(key);
    return typeof value === 'number' ? value : undefined;
  }

  getBuffer(key: string): Uint8Array | undefined {
    const value = this.store.get(key);
    return value instanceof Uint8Array ? value : undefined;
  }

  contains(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.store.keys());
  }

  clearAll(): void {
    this.store.clear();
  }

  recrypt(_key: string | undefined): void {
    return;
  }
}

export function createRuntimeMMKV(
  configuration: RuntimeMMKVConfiguration,
): RuntimeMMKV {
  if (!canUseNativeMMKV()) {
    return new MemoryMMKV(configuration.id);
  }

  try {
    // SAFETY: require() defers native MMKV access so unsupported runtimes can fall back cleanly.
    const nativeModule = require('react-native-mmkv');
    let native: unknown;
    if (typeof nativeModule.createMMKV === 'function') {
      native = nativeModule.createMMKV(configuration);
    } else if (typeof nativeModule.MMKV === 'function') {
      native = new nativeModule.MMKV(configuration);
    } else {
      return new MemoryMMKV(configuration.id);
    }

    if (!isNativeMMKV(native)) {
      return new MemoryMMKV(configuration.id);
    }

    // v4 renamed .delete() to .remove(); re-expose .delete() to keep the RuntimeMMKV contract stable.
    const deleteFn = native.remove ?? native.delete ?? (() => {});
    const adapted: RuntimeMMKV = {
      set: (key, value) => native.set(key, value),
      getBoolean: (key) => native.getBoolean?.(key),
      getString: (key) => native.getString?.(key),
      getNumber: (key) => native.getNumber?.(key),
      getBuffer: (key) => native.getBuffer?.(key),
      contains: (key) => native.contains?.(key) ?? false,
      delete: (key) => deleteFn(key),
      getAllKeys: () => native.getAllKeys?.() ?? [],
      clearAll: () => native.clearAll?.(),
      recrypt: (key) => native.recrypt?.(key),
      size: native.size,
    };
    return adapted;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('React Native is not running on-device')) {
      throw error;
    }

    return new MemoryMMKV(configuration.id);
  }
}
