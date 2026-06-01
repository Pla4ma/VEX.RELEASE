/**
 * Liveops Config Feature — FEATURE_DEPENDENCIES Tests
 */

import { FEATURE_DEPENDENCIES } from '../feature-dependencies';

describe('FEATURE_DEPENDENCIES', () => {
  it('defines dependencies for boss_tab', () => {
    expect(FEATURE_DEPENDENCIES.boss_tab).toContain('focus_session');
    expect(FEATURE_DEPENDENCIES.boss_tab).toContain('progress_view');
  });

  it('defines dependencies for content_study', () => {
    expect(FEATURE_DEPENDENCIES.content_study).toContain('ai_coach_basic');
  });

  it('defines dependencies for shop', () => {
    expect(FEATURE_DEPENDENCIES.shop).toContain('economy_basic');
    expect(FEATURE_DEPENDENCIES.shop).toContain('inventory');
  });

  it('core features have no dependencies', () => {
    expect(FEATURE_DEPENDENCIES.focus_session).toBeUndefined();
    expect(FEATURE_DEPENDENCIES.home_tab).toBeUndefined();
  });
});
