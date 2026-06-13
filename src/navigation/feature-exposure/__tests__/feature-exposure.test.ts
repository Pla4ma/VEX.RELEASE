import { canExposeFeature } from '../feature-exposure';

describe('canExposeFeature', () => {
  it('returns true when all conditions met', () => {
    expect(canExposeFeature({
      isFlagEnabled: true,
      isLiveopsUnlocked: true,
      isLiveopsVisible: true,
    })).toBe(true);
  });

  it('returns false when flag is disabled', () => {
    expect(canExposeFeature({
      isFlagEnabled: false,
      isLiveopsUnlocked: true,
      isLiveopsVisible: true,
    })).toBe(false);
  });

  it('returns false when liveops not unlocked', () => {
    expect(canExposeFeature({
      isFlagEnabled: true,
      isLiveopsUnlocked: false,
      isLiveopsVisible: true,
    })).toBe(false);
  });

  it('returns false when liveops not visible', () => {
    expect(canExposeFeature({
      isFlagEnabled: true,
      isLiveopsUnlocked: true,
      isLiveopsVisible: false,
    })).toBe(false);
  });

  it('returns true when flag is undefined (defaults to true)', () => {
    expect(canExposeFeature({
      isLiveopsUnlocked: true,
      isLiveopsVisible: true,
    })).toBe(true);
  });

  it('returns false when all false', () => {
    expect(canExposeFeature({
      isFlagEnabled: false,
      isLiveopsUnlocked: false,
      isLiveopsVisible: false,
    })).toBe(false);
  });
});
