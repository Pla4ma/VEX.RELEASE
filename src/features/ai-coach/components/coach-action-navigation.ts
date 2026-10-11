import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { ExtendedRootStackParams } from '../../../navigation/types';
import { CoachActionIntentSchema } from '../../coach-presence/schemas';

const CoachActionPayloadSchema = z
  .object({
    type: CoachActionIntentSchema,
    duration: z.number().finite().positive().optional(),
  })
  .strict();

type CoachNavigation = Pick<
  NativeStackNavigationProp<ExtendedRootStackParams>,
  'navigate'
>;
type CoachActionPayload = z.infer<typeof CoachActionPayloadSchema>;

export function executeCoachAction(
  navigation: CoachNavigation,
  action: unknown,
): boolean {
  const parsed = CoachActionPayloadSchema.safeParse(action);
  if (!parsed.success) {
    return false;
  }
  const payload = parsed.data;
  switch (payload.type) {
    case 'START_SESSION':
      navigation.navigate({
        name: 'SessionStack',
        params: {
          screen: 'SessionSetup',
          params: {
            presetDuration: boundedDuration(payload.duration),
            source: 'rescue',
          },
        },
      });
      return true;
    case 'START_STUDY_SESSION':
      navigation.navigate({ name: 'ContentStudy', params: undefined });
      return true;
    case 'REVIEW_PROGRESS':
      navigation.navigate({ name: 'Main', params: { screen: 'Progress' } });
      return true;
    case 'TAKE_BREAK':
      navigation.navigate({
        name: 'SessionStack',
        params: {
          screen: 'SessionSetup',
          params: { presetDuration: 300, source: 'rescue' },
        },
      });
      return true;
    case 'CONTINUE_PLAN':
      navigation.navigate({
        name: 'SessionStack',
        params: { screen: 'SessionSetup', params: { source: 'plan' } },
      });
      return true;
    case 'REFLECT':
      return false;
  }
}

function boundedDuration(durationMinutes: number | undefined): number {
  const duration = durationMinutes ?? 25;
  return Math.min(Math.max(Math.round(duration * 60), 300), 7200);
}

export type { CoachActionPayload };
