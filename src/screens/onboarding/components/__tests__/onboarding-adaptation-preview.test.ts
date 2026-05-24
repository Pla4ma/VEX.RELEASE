import { buildOnboardingAdaptationPreview } from '../onboarding-adaptation-preview';

describe('buildOnboardingAdaptationPreview', () => {
  it('changes the starter session when the goal changes', () => {
    const study = buildOnboardingAdaptationPreview({
      goal: 'STUDY',
      motivationStyle: undefined,
    });
    const creative = buildOnboardingAdaptationPreview({
      goal: 'CREATIVE',
      motivationStyle: undefined,
    });

    expect(study.sessionTitle).toContain('Study');
    expect(creative.sessionTitle).toContain('Creative');
    expect(study.sessionTitle).not.toBe(creative.sessionTitle);
  });

  it('changes coach tone and reward preview when motivation style changes', () => {
    const calm = buildOnboardingAdaptationPreview({
      goal: 'WORK',
      motivationStyle: 'calm',
    });
    const intense = buildOnboardingAdaptationPreview({
      goal: 'WORK',
      motivationStyle: 'intense',
    });

    expect(calm.coachTone).toContain('Quiet');
    expect(intense.coachTone).toContain('Direct');
    expect(calm.rewardPreview).not.toBe(intense.rewardPreview);
  });
});
