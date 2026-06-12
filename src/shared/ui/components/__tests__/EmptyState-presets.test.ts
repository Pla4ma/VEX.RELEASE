import { PRESETS } from '../EmptyState.presets';

describe('EmptyState.presets', () => {
  it('has presets for all expected keys', () => {
    const expectedKeys = ['inventory', 'feed', 'leaderboards', 'challenges', 'shop', 'squadWars', 'offline', 'error'];
    for (const key of expectedKeys) {
      expect(PRESETS[key as keyof typeof PRESETS]).toBeDefined();
    }
  });

  it('each preset has a title', () => {
    for (const [key, preset] of Object.entries(PRESETS)) {
      expect(preset.title).toBeDefined();
      expect(preset.title.length).toBeGreaterThan(0);
    }
  });

  it('offline preset has offline variant', () => {
    expect(PRESETS.offline.variant).toBe('offline');
  });

  it('error preset has error variant and retry action', () => {
    expect(PRESETS.error.variant).toBe('error');
    expect(PRESETS.error.actionLabel).toBe('Try Again');
  });

  it('action-oriented presets have action labels', () => {
    const actionPresets: Array<keyof typeof PRESETS> = ['inventory', 'feed', 'leaderboards', 'challenges', 'shop', 'squadWars', 'error'];
    for (const key of actionPresets) {
      const preset = PRESETS[key];
      expect(preset.actionLabel).toBeDefined();
      expect(preset.actionLabel!.length).toBeGreaterThan(0);
    }
  });

  it('all presets have non-empty titles', () => {
    for (const preset of Object.values(PRESETS)) {
      expect(preset.title.length).toBeGreaterThan(0);
    }
  });

  it('presets with descriptions have non-empty descriptions', () => {
    for (const preset of Object.values(PRESETS)) {
      if (preset.description) {
        expect(preset.description.length).toBeGreaterThan(0);
      }
    }
  });
});
