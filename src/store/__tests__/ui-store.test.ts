import { useUIStore } from '../uiStore';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.getState().hideToast();
    useUIStore.getState().hideModal();
  });

  it('initializes with default state', () => {
    const state = useUIStore.getState();
    expect(state.toast).toBeNull();
    expect(state.activeModal).toBeNull();
    expect(state.modalProps).toEqual({});
  });

  it('shows toast with generated id', () => {
    useUIStore.getState().showToast({ message: 'Hello', type: 'success' });
    const state = useUIStore.getState();
    expect(state.toast).not.toBeNull();
    expect(state.toast?.message).toBe('Hello');
    expect(state.toast?.type).toBe('success');
    expect(state.toast?.id).toBeDefined();
  });

  it('hides toast', () => {
    useUIStore.getState().showToast({ message: 'Test', type: 'error' });
    useUIStore.getState().hideToast();
    expect(useUIStore.getState().toast).toBeNull();
  });

  it('shows modal with props', () => {
    useUIStore.getState().showModal('ConfirmDelete', { itemId: '123' });
    const state = useUIStore.getState();
    expect(state.activeModal).toBe('ConfirmDelete');
    expect(state.modalProps).toEqual({ itemId: '123' });
  });

  it('hides modal and clears props', () => {
    useUIStore.getState().showModal('TestModal', { key: 'value' });
    useUIStore.getState().hideModal();
    const state = useUIStore.getState();
    expect(state.activeModal).toBeNull();
    expect(state.modalProps).toEqual({});
  });

  it('shows modal without props defaults to empty object', () => {
    useUIStore.getState().showModal('SimpleModal');
    expect(useUIStore.getState().modalProps).toEqual({});
  });

  it('generates unique ids for consecutive toasts', () => {
    useUIStore.getState().showToast({ message: 'First', type: 'info' });
    const firstId = useUIStore.getState().toast?.id;
    useUIStore.getState().showToast({ message: 'Second', type: 'info' });
    const secondId = useUIStore.getState().toast?.id;
    expect(firstId).not.toBe(secondId);
  });

  it('supports all toast types', () => {
    const types = ['success', 'error', 'warning', 'info'] as const;
    for (const type of types) {
      useUIStore.getState().showToast({ message: 'Test', type });
      expect(useUIStore.getState().toast?.type).toBe(type);
    }
  });
});
