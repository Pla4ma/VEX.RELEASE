import {
  TodaySystemInputSchema,
  TodaySystemSchema,
  type TodayAction,
  type TodaySection,
  type TodaySystem,
  type TodaySystemInput,
} from './schemas';

const DEFAULT_NOW: TodayAction = {
  id: 'clean-session',
  label: 'Start one clean session.',
  ctaLabel: 'Start',
  durationSeconds: 25 * 60,
};

function section(
  key: TodaySection['key'],
  visible: boolean,
  title: string,
  body: string,
  action: TodayAction | null,
): TodaySection {
  return {
    key,
    visible,
    title,
    body,
    ctaLabel: action?.ctaLabel ?? null,
    durationSeconds: action?.durationSeconds ?? null,
  };
}

export function buildTodaySystem(rawInput: TodaySystemInput): TodaySystem {
  const input = TodaySystemInputSchema.parse(rawInput);
  const hidden = input.hiddenFeatureKeys.includes('today_strip');
  const isMinimal = input.lane === 'minimal_normal';
  const now = input.nowAction ?? DEFAULT_NOW;
  const recovery: TodayAction = {
    id: 'five-minute-recovery',
    label: 'Do 5 minutes.',
    ctaLabel: 'Recover',
    durationSeconds: 5 * 60,
  };

  return TodaySystemSchema.parse({
    lane: input.lane,
    animationLevel: input.reducedMotion || !isMinimal ? 'none' : 'subtle',
    sections: [
      section('now', !hidden, 'Now', now.label, now),
      section('later', !hidden && input.laterAction !== null, 'Later', input.laterAction?.label ?? 'No later action needed.', input.laterAction),
      section('done', !hidden, 'Done', input.completedToday > 0 ? `${input.completedToday} clean block saved today.` : 'Nothing banked yet.', null),
      section('recovery', !hidden && input.dayFeelsMessy, 'Recovery', recovery.label, recovery),
    ],
  });
}
