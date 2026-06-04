import React from 'react';
import {
  CoachInterventionBanner,
  type InterventionType,
} from '../../../features/ai-coach/components/CoachInterventionBanner';
import { trackInterventionActioned } from '../../../features/ai-coach/analytics';
import { eventBus } from '../../../events';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ActiveIntervention } from '../../../features/ai-coach/hooks/useActiveIntervention';
import { buildInterventionSessionParams } from '../buildInterventionSessionParams';

interface HomeInterventionBannerProps {
  intervention: {
    id: string;
    type: InterventionType;
    message: string;
    actionLabel: string;
    hoursRemaining?: number;
    metadata?: Record<string, unknown>;
  } | null;
  interventionLoading: boolean;
  dismissIntervention: (id: string) => void;
  navigation: NativeStackNavigationProp<ExtendedRootStackParams>;
  userId: string;
}

export function HomeInterventionBanner({
  intervention,
  interventionLoading,
  dismissIntervention,
  navigation,
  userId,
}: HomeInterventionBannerProps): JSX.Element | null {
  const handleInterventionAction = React.useCallback(
    (activeIntervention: {
      id: string;
      type: string;
      actionLabel: string;
      metadata?: Record<string, unknown>;
    }): void => {
      if (!userId) {
        return;
      }

      const normalized: ActiveIntervention = {
        ...activeIntervention,
        message: '',
        priority: 0,
        metadata: activeIntervention.metadata ?? {},
        type:
          activeIntervention.type === 'BURNOUT' ||
          activeIntervention.type === 'PLATEAU' ||
          activeIntervention.type === 'STREAK_RISK' ||
          activeIntervention.type === 'BOSS_FINISH'
            ? activeIntervention.type
            : 'STREAK_RISK',
      };
      trackInterventionActioned(
        userId,
        normalized.type,
        activeIntervention.actionLabel,
      );
      eventBus.publish('coach:intervention_actioned', {
        userId,
        interventionId: activeIntervention.id,
        type: normalized.type,
        actionLabel: activeIntervention.actionLabel,
      });

      const { suggestedDurationSeconds, presetMode } =
        buildInterventionSessionParams(normalized);

      navigation.navigate('SessionStack', {
        screen: 'SessionSetup',
        params: { suggestedDurationSeconds, presetMode },
      });
    },
    [userId, navigation],
  );

  if (interventionLoading || !intervention) {
    return null;
  }

  return (
    <CoachInterventionBanner
      intervention={intervention}
      coachName="VEX Coach"
      onAction={handleInterventionAction}
      onDismiss={(dismissed) => dismissIntervention(dismissed.id)}
    />
  );
}
