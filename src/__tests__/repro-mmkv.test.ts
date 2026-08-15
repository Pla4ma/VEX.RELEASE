import { createRuntimeMMKV } from '../persistence/mmkv-runtime';

it('real MMKV createRuntimeMMKV works', () => {
  const mmkv = createRuntimeMMKV({ id: 'repro-test' });
  mmkv.set('key', 'value');
  expect(mmkv.getString('key')).toBe('value');
});
