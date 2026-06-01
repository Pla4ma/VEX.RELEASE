/**
 * Tests for session-start schema re-exports validation.
 */

describe('session-start: schemas (re-exported)', () => {
  const schemas = require('../schemas');

  it('exports SessionStakeSchema', () => {
    expect(schemas.SessionStakeSchema).toBeDefined();
  });

  it('exports LaneSessionBriefSchema', () => {
    expect(schemas.LaneSessionBriefSchema).toBeDefined();
  });

  it('exports SessionSetupNavigationParamsSchema', () => {
    expect(schemas.SessionSetupNavigationParamsSchema).toBeDefined();
  });

  it('exports SessionStartSummarySchema', () => {
    expect(schemas.SessionStartSummarySchema).toBeDefined();
  });

  it('exports SessionStartHeroSchema', () => {
    expect(schemas.SessionStartHeroSchema).toBeDefined();
  });

  it('exports FocusModeCardSchema', () => {
    expect(schemas.FocusModeCardSchema).toBeDefined();
  });

  it('exports SessionDifficultySchema', () => {
    expect(schemas.SessionDifficultySchema).toBeDefined();
  });

  it('exports DifficultySuggestionSchema', () => {
    expect(schemas.DifficultySuggestionSchema).toBeDefined();
  });

  it('exports DifficultyPreferenceSchema', () => {
    expect(schemas.DifficultyPreferenceSchema).toBeDefined();
  });

  it('SessionDifficultySchema validates correct enum values', () => {
    expect(schemas.SessionDifficultySchema.safeParse('CASUAL').success).toBe(true);
    expect(schemas.SessionDifficultySchema.safeParse('FOCUSED').success).toBe(true);
    expect(schemas.SessionDifficultySchema.safeParse('INTENSE').success).toBe(true);
    expect(schemas.SessionDifficultySchema.safeParse('INVALID').success).toBe(false);
  });

  it('FocusModeCardSchema rejects invalid duration', () => {
    const result = schemas.FocusModeCardSchema.safeParse({
      accessibilityHint: 'hint',
      accessibilityLabel: 'label',
      body: 'body',
      ctaLabel: 'cta',
      durationSeconds: 30, // below 60 minimum
      id: 'card-1',
      mode: 'SPRINT',
      title: 'title',
    });
    expect(result.success).toBe(false);
  });
});
