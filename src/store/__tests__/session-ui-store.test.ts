import { useSessionUIStore } from '../session-state';

describe('useSessionUIStore', () => {
  beforeEach(() => {
    const state = useSessionUIStore.getState();
    state.dismissComeback();
    state.resetComebackDismissal();
    state.clearCompletionSyncState();
    state.clearHomeHighlight();
  });

  it('initializes with default state', () => {
    const state = useSessionUIStore.getState();
    expect(state.comebackDismissed).toBe(false);
    expect(state.homeHighlight).toBeNull();
    expect(state.completionSync.status).toBe('idle');
    expect(state.completionSync.ledgerId).toBeNull();
  });

  it('dismisses comeback', () => {
    useSessionUIStore.getState().dismissComeback();
    expect(useSessionUIStore.getState().comebackDismissed).toBe(true);
  });

  it('resets comeback dismissal', () => {
    useSessionUIStore.getState().dismissComeback();
    useSessionUIStore.getState().resetComebackDismissal();
    expect(useSessionUIStore.getState().comebackDismissed).toBe(false);
  });

  it('sets completion sync state', () => {
    const syncState = {
      ledgerId: 'ledger-1',
      message: 'test',
      repairCtaLabel: 'retry',
      status: 'pending_sync' as const,
      updatedAt: Date.now(),
    };
    useSessionUIStore.getState().setCompletionSyncState(syncState);
    expect(useSessionUIStore.getState().completionSync).toEqual(syncState);
  });

  it('clears completion sync state', () => {
    useSessionUIStore.getState().setCompletionSyncState({
      ledgerId: 'ledger-1',
      message: 'test',
      repairCtaLabel: 'retry',
      status: 'failed_sync',
      updatedAt: 123,
    });
    useSessionUIStore.getState().clearCompletionSyncState();
    const sync = useSessionUIStore.getState().completionSync;
    expect(sync.status).toBe('idle');
    expect(sync.ledgerId).toBeNull();
  });

  it('shows home highlight', () => {
    const highlight = { title: 'Congrats', message: 'Great job', tone: 'celebration' as const };
    useSessionUIStore.getState().showHomeHighlight(highlight);
    expect(useSessionUIStore.getState().homeHighlight).toEqual(highlight);
  });

  it('clears home highlight', () => {
    useSessionUIStore.getState().showHomeHighlight({ title: 't', message: 'm', tone: 'info' });
    useSessionUIStore.getState().clearHomeHighlight();
    expect(useSessionUIStore.getState().homeHighlight).toBeNull();
  });

  it('supports all highlight tones', () => {
    const tones = ['celebration', 'info', 'warning'] as const;
    for (const tone of tones) {
      useSessionUIStore.getState().showHomeHighlight({ title: 't', message: 'm', tone });
      expect(useSessionUIStore.getState().homeHighlight?.tone).toBe(tone);
    }
  });
});
