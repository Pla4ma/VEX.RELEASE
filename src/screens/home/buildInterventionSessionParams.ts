import type { ActiveIntervention } from '../../features/ai-coach/hooks/useActiveIntervention';
import { readSuggestedDuration, readSuggestedMode } from './utils';
import type { SessionStackParams } from '../../navigation/types';

export function buildInterventionSessionParams(
  intervention: ActiveIntervention,
): {
  suggestedDurationSeconds: number;
  presetMode: NonNullable<SessionStackParams['SessionSetup']>['presetMode'];
} {
  return {
    suggestedDurationSeconds:
      intervention.type === 'BOSS_FINISH'
        ? 45 * 60
        : readSuggestedDuration(intervention),
    presetMode: readSuggestedMode(intervention),
  };
}
