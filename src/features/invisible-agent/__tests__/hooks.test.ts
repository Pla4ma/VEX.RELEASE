import { buildInvisibleAgentDecisionQueryKey } from '../hooks';
import {
  AgentContextSnapshotSchema,
  type AgentContextSnapshot,
} from '../schemas';

const context = AgentContextSnapshotSchema.parse({
  userId: '550e8400-e29b-41d4-a716-446655440000',
  isOnline: true,
  completedToday: false,
  currentStreak: 4,
  hoursUntilStreakDeadline: 6,
  recentSessionIds: ['session-1'],
  activeStudyPackId: null,
  lowEnergyPattern: false,
  trustLevel: 'normal',
});

describe('Invisible Agent query key', () => {
  it('changes when any recommendation input changes', () => {
    const originalKey = buildInvisibleAgentDecisionQueryKey(context);
    const changedContexts: AgentContextSnapshot[] = [
      { ...context, isOnline: false },
      { ...context, completedToday: true },
      { ...context, currentStreak: 5 },
      { ...context, hoursUntilStreakDeadline: 2 },
      { ...context, recentSessionIds: ['session-2'] },
      { ...context, activeStudyPackId: 'study-pack-1' },
      { ...context, lowEnergyPattern: true },
      { ...context, trustLevel: 'low' },
    ];

    changedContexts.forEach((changedContext) => {
      expect(buildInvisibleAgentDecisionQueryKey(changedContext)).not.toEqual(
        originalKey,
      );
    });
  });

  it('keeps equivalent context values on the same cache key', () => {
    expect(
      buildInvisibleAgentDecisionQueryKey({
        ...context,
        recentSessionIds: [...context.recentSessionIds],
      }),
    ).toEqual(buildInvisibleAgentDecisionQueryKey(context));
  });
});
