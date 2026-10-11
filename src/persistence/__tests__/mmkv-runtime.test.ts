import { createRuntimeMMKV } from '../mmkv-runtime';

jest.mock('react-native-mmkv', () => ({
  MMKV: class MMKV {},
}));

describe('runtime MMKV compatibility', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'nativeCallSyncHook');
  });

  it('falls back to memory when the resolved module lacks createMMKV', () => {
    Object.defineProperty(globalThis, 'nativeCallSyncHook', {
      configurable: true,
      value: (): void => {},
    });

    const storage = createRuntimeMMKV({ id: 'missing-create-mmkv' });
    storage.set('probe', 'value');

    expect(storage.getString('probe')).toBe('value');
  });
});
