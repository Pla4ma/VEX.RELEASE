import { describe, expect, it, jest } from '@jest/globals';
import {
  getConnectionState,
  subscribeToConnectionChanges,
  updateConnectionState,
} from '../retry';

describe('connection state', () => {
  afterEach(() => { updateConnectionState('unknown'); });

  it('starts as unknown', () => {
    expect(getConnectionState()).toBe('unknown');
  });

  it('updates connection state', () => {
    updateConnectionState('online');
    expect(getConnectionState()).toBe('online');
    updateConnectionState('offline');
    expect(getConnectionState()).toBe('offline');
  });

  it('does not notify on same state', () => {
    updateConnectionState('online');
    const cb = jest.fn();
    const unsub = subscribeToConnectionChanges(cb);
    updateConnectionState('online');
    expect(cb).not.toHaveBeenCalled();
    unsub();
  });

  it('notifies listeners on state change', () => {
    const cb = jest.fn();
    const unsub = subscribeToConnectionChanges(cb);
    updateConnectionState('online');
    expect(cb).toHaveBeenCalledWith('online');
    updateConnectionState('offline');
    expect(cb).toHaveBeenCalledWith('offline');
    unsub();
  });

  it('supports multiple subscribers', () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const unsub1 = subscribeToConnectionChanges(cb1);
    const unsub2 = subscribeToConnectionChanges(cb2);
    updateConnectionState('online');
    expect(cb1).toHaveBeenCalledWith('online');
    expect(cb2).toHaveBeenCalledWith('online');
    unsub1();
    unsub2();
  });

  it('unsubscribe stops notifications', () => {
    const cb = jest.fn();
    const unsub = subscribeToConnectionChanges(cb);
    updateConnectionState('online');
    expect(cb).toHaveBeenCalledTimes(1);
    unsub();
    updateConnectionState('offline');
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('returns a function from subscribe', () => {
    const cb = jest.fn();
    const unsub = subscribeToConnectionChanges(cb);
    expect(typeof unsub).toBe('function');
    unsub();
  });
});
