import {
  getJourneyCrossingReward,
  getJourneyReturnHook,
  getJourneyState,
} from '../journey-ladder';

describe('journey-ladder', () => {
  it('returns a near-milestone hook when close to next rung', () => {
    const state = getJourneyState(405);
    expect(state.isNearMilestone).toBe(true);
    expect(getJourneyReturnHook(state)).toContain('One more clean session');
  });

  it('returns reward id only when crossing rung', () => {
    expect(getJourneyCrossingReward(200, 260)).toBe('journey:rung:3');
    expect(getJourneyCrossingReward(260, 270)).toBeNull();
  });
});
