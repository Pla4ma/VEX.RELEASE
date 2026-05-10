/**
 * HomeInterventionBanner Component
 *
 * Renders the coach intervention banner in the Home screen.
 */

import React from 'react';
import { CoachInterventionBanner, type Intervention } from '../../../features/ai-coach/components/CoachInterventionBanner';
import { trackInterventionActioned } from '../../../features/ai-coach/analytics';
import { eventBus } from '../../../events';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ActiveIntervention } from '../../../features/ai-coach/hooks';

interface HomeInterventionBannerProps {
  intervention: Intervention | null;
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
}: HomeInterventionBannerProps): JSX.Element {
  // Handle intervention action
  const handleInterventionAction = React.useCallback((activeIntervention: {
    id: string;
    type: string;
    actionLabel: string;
    metadata?: Record<string, unknown>;
  }): void => {
    if (!userId) {return;}

    const normalized: ActiveIntervention = {
      ...activeIntervention,
      message: '',
      priority: 0,
      metadata: activeIntervention.metadata ?? {},
      type: activeIntervention.type === 'BURNOUT' ||
        activeIntervention.type === 'PLATEAU' ||
        activeIntervention.type === 'STREAK_RISK' ||
        activeIntervention.type === 'BOSS_FINISH'
        ? activeIntervention.type
        : 'STREAK_RISK',
    };
    trackInterventionActioned(userId, normalized.type, activeIntervention.actionLabel);
    eventBus.publish('coach:intervention_actioned', {
      userId,
      interventionId: activeIntervention.id,
      type: normalized.type,
      actionLabel: activeIntervention.actionLabel,
    });

    navigation.navigate('SessionStack', {
      screen: 'SessionSetup',
      params: {
        suggestedDurationSeconds:
          activeIntervention.type === 'BOSS_FINISH' ? 45 * 60 : 25 * 60,
        presetMode: 'FOCUS',
      },
    });
  }, [userId, navigation]);

  if (interventionLoading || !intervention) {return null;}

  return (
    <CoachInterventionBanner
      intervention={intervention}
      coachName="VEX Coach"
      onAction={handleInterventionAction}
      onDismiss={(dismissed) => dismissIntervention(dismissed.id)}
    />
  );
}
