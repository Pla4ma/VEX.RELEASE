import { describe, expect, it } from '@jest/globals';
import { APP_STORE_METADATA } from '../../app-store/AppStoreSubmissionPack';

const BLOCKED_APP_STORE_TERMS = [
  'gamified pomodoro',
  'rpg habit tracker',
  'rpg habit',
  'coins',
  'gems',
  'battle pass',
  'shop',
  'inventory',
  'fake ai',
  'second brain',
];

describe('app-store-copy', () => {
  it('subtitle is exactly the approved copy', () => {
    expect(APP_STORE_METADATA.subtitle).toBe('Focus that adapts to you');
  });

  it('opening description mentions adaptive system', () => {
    expect(APP_STORE_METADATA.description).toContain(
      'VEX changes based on how you work',
    );
    expect(APP_STORE_METADATA.description).toContain('Study');
    expect(APP_STORE_METADATA.description).toContain('Run');
    expect(APP_STORE_METADATA.description).toContain('Project');
    expect(APP_STORE_METADATA.description).toContain('Clean');
  });

  it('description has no blocked old-economy or fake-AI terms', () => {
    const text = APP_STORE_METADATA.description.toLowerCase();
    for (const term of BLOCKED_APP_STORE_TERMS) {
      expect(text).not.toContain(term);
    }
  });

  it('premium section describes durable personalization, not game economy', () => {
    const text = APP_STORE_METADATA.description.toLowerCase();
    expect(text).toContain('premium');
    expect(text).toContain('memory');
    expect(text).not.toContain('gamified');
    expect(text).not.toContain('buy');
  });

  it('keywords are relevant and not gaming', () => {
    const gamingTerms = ['game', 'rpg', 'battle', 'boss', 'shop', 'coin'];
    for (const term of gamingTerms) {
      expect(APP_STORE_METADATA.keywords).not.toContain(term);
    }
  });

  it('primary category is Productivity', () => {
    expect(APP_STORE_METADATA.primaryCategory).toBe('Productivity');
  });

  it('age rating is 4+', () => {
    expect(APP_STORE_METADATA.ageRating).toBe('4+');
  });

  it('no "second brain" claim unless memory UI proves it', () => {
    expect(APP_STORE_METADATA.description.toLowerCase()).not.toContain(
      'second brain',
    );
  });
});
