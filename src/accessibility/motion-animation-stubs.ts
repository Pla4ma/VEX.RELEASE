export interface AnimatedValue {
  setValue(value: number): void;
  setOffset(value: number): void;
  flattenOffset(): void;
  extractOffset(): void;
  addListener(cb: (v: { value: number }) => void): string;
  removeListener(id: string): void;
  removeAllListeners(): void;
  stopAnimation(cb?: (v: number) => void): void;
  resetAnimation(cb?: (v: number) => void): void;
  animate(
    config: Record<string, unknown>,
    callback?: (result: { finished: boolean }) => void,
  ): void;
  hasListeners(): boolean;
  interpolate(config: {
    inputRange: number[];
    outputRange: (number | string)[];
  }): never;
}

export interface CompositeAnimation {
  start(callback?: (result: { finished: boolean }) => void): void;
  stop(): void;
  reset(): void;
}

export function createAnimatedValue(initialValue: number = 0): AnimatedValue {
  let value = initialValue;
  let hasListenersFlag = false;
  const listeners: Array<{ id: string; cb: (v: { value: number }) => void }> =
    [];

  return {
    setValue(v: number): void {
      value = v;
    },
    setOffset(): void {
      return;
    },
    flattenOffset(): void {
      return;
    },
    extractOffset(): void {
      return;
    },
    addListener(cb: (v: { value: number }) => void): string {
      const id = `l_${listeners.length}`;
      listeners.push({ id, cb });
      hasListenersFlag = listeners.length > 0;
      return id;
    },
    removeListener(id: string): void {
      const index = listeners.findIndex((listener) => listener.id === id);
      if (index >= 0) {
        listeners.splice(index, 1);
        hasListenersFlag = listeners.length > 0;
      }
    },
    removeAllListeners(): void {
      listeners.length = 0;
      hasListenersFlag = false;
    },
    stopAnimation(cb?: (v: number) => void): void {
      cb?.(value);
    },
    resetAnimation(cb?: (v: number) => void): void {
      cb?.(value);
    },
    animate(
      _config: Record<string, unknown>,
      callback?: (result: { finished: boolean }) => void,
    ): void {
      callback?.({ finished: true });
    },
    hasListeners(): boolean {
      return hasListenersFlag;
    },
    interpolate(): never {
      throw new Error("Animation interpolation is unavailable in this adapter");
    },
  };
}

export function createTiming(
  _value: AnimatedValue,
  _config: Record<string, unknown>,
): CompositeAnimation {
  return {
    start(cb?: (result: { finished: boolean }) => void): void {
      cb?.({ finished: true });
    },
    stop(): void {
      return;
    },
    reset(): void {
      return;
    },
  };
}

export function easingOut(): unknown {
  return { easing: "cubic" };
}
