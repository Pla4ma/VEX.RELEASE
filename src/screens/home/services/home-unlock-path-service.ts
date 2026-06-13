import {
  HomeUnlockPathInputSchema,
  HomeUnlockPathModelSchema,
  type HomeUnlockPathInput,
  type HomeUnlockPathItem,
  type HomeUnlockPathModel,
} from './home-unlock-path-schemas';

function buildItem(
  input: HomeUnlockPathInput,
  item: Omit<HomeUnlockPathItem, 'current' | 'isUnlocked'>,
): HomeUnlockPathItem {
  const current = Math.min(input.completedSessions, item.requirement);
  return {
    ...item,
    current,
    isUnlocked: input.completedSessions >= item.requirement,
  };
}

export function buildHomeUnlockPathModel(
  rawInput: HomeUnlockPathInput,
): HomeUnlockPathModel {
  const input = HomeUnlockPathInputSchema.parse(rawInput);
  const items = [
    buildItem(input, {
      body: 'The first finish turns VEX from empty shell into personal signal.',
      eyebrow: 'FIRST SIGNAL',
      requirement: 1,
      reward: 'Session recap',
      title: 'Reveal your baseline',
    }),
    buildItem(input, {
      body: 'Two finishes give VEX enough evidence to compare starts.',
      eyebrow: 'PATTERN',
      requirement: 2,
      reward: 'Early pattern read',
      title: 'Find your first rhythm',
    }),
    buildItem(input, {
      body: 'A return tomorrow makes progress feel alive without pressure.',
      eyebrow: 'MOMENTUM',
      requirement: 3,
      reward: 'Momentum layer',
      title: 'Open the daily path',
    }),
    buildItem(input, {
      body: 'Repeated sessions unlock experiments matched to your behavior.',
      eyebrow: 'EXPERIMENTS',
      requirement: 5,
      reward: 'Challenge cards',
      title: 'Unlock guided moves',
    }),
  ];
  const nextItem = items.find((item) => !item.isUnlocked) ?? items[items.length - 1];

  return HomeUnlockPathModelSchema.parse({
    items,
    nextItem,
    progressLabel:
      input.completedSessions === 0
        ? 'Complete 1 session to wake the app.'
        : `${input.completedSessions} sessions shaping your VEX path.`,
  });
}
