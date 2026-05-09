import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * CoachInterventionBanner
 *
 * Phase 2.3 - Intervention System Polish
 * Proactive banner showing AI coach interventions on HomeScreen.
 * Updated with new intervention types from Phase 2.
 *
 * Types: BURNOUT, PLATEAU, STREAK_RISK, BOSS_FINISH, STUDY_BEHIND,
 *        BOSS_OPPORTUNITY, MOMENTUM_BUILDING, COMEBACK_READY, STUDY_PLAN_COMPLETE
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../../../components';
import { MMKVStorageAdapter } from '../../../persistence/MMKVStorageAdapter';

// Phase 2.3 - New intervention types added
export type InterventionType = 'BURNOUT' | 'PLATEAU' | 'STREAK_RISK' | 'BOSS_FINISH' | 'STUDY_BEHIND' | 'BOSS_OPPORTUNITY' | 'MOMENTUM_BUILDING' | 'COMEBACK_READY' | 'STUDY_PLAN_COMPLETE';

interface Intervention {
  id: string;
  type: InterventionType;
  message: string;
  actionLabel: string;
  hoursRemaining?: number;
  metadata?: Record<string, unknown>;
}

interface CoachInterventionBannerProps {
  intervention: Intervention | null;
  coachName: string;
  coachAvatar?: string;
  onAction?: (intervention: Intervention) => void;
  onDismiss?: (intervention: Intervention) => void;
}

const DISMISSAL_STORAGE_KEY = 'dismissed_interventions';
const DISMISSAL_TTL_HOURS = 24;

export function CoachInterventionBanner({ intervention, coachName, coachAvatar, onAction, onDismiss }: CoachInterventionBannerProps): JSX.Element | null {
  const { theme } = useTheme();
  const [isDismissed, setIsDismissed] = useState(false);
  const [storage] = useState(() => new MMKVStorageAdapter('coach-interventions'));

  const isNonDismissable = useCallback((type: InterventionType, hours?: number): boolean => {
    return type === 'STREAK_RISK' && hours !== undefined && hours < 4;
  }, []);

  useEffect(() => {
    if (!intervention) {
      setIsDismissed(false);
      return;
    }

    // Check if this intervention was recently dismissed
    const checkDismissal = (): void => {
      const raw = storage.getItemSync(DISMISSAL_STORAGE_KEY);
      if (!raw) {
        setIsDismissed(false);
        return;
      }

      try {
        const dismissed: Record<string, number> = JSON.parse(raw);
        const dismissedAt = dismissed[intervention.id];

        if (!dismissedAt) {
          setIsDismissed(false);
          return;
        }

        const hoursSinceDismissal = (Date.now() - dismissedAt) / (1000 * 60 * 60);

        if (isNonDismissable(intervention.type, intervention.hoursRemaining)) {
          setIsDismissed(false); // Cannot dismiss streak risk when < 4 hours
        } else if (hoursSinceDismissal < DISMISSAL_TTL_HOURS) {
          setIsDismissed(true);
        } else {
          setIsDismissed(false);
        }
      } catch (error) {
        captureSilentFailure(error, { feature: 'ai-coach', operation: 'ui-fallback', type: 'ui' });
        setIsDismissed(false);
      }
    };

    checkDismissal();
  }, [intervention, storage, isNonDismissable]);

  const handleDismiss = useCallback((): void => {
    if (!intervention) {
      return;
    }

    if (isNonDismissable(intervention.type, intervention.hoursRemaining)) {
      return; // Cannot dismiss
    }

    // Store dismissal
    const raw = storage.getItemSync(DISMISSAL_STORAGE_KEY);
    const dismissed: Record<string, number> = raw ? JSON.parse(raw) : {};
    dismissed[intervention.id] = Date.now();
    storage.setItemSync(DISMISSAL_STORAGE_KEY, JSON.stringify(dismissed));

    setIsDismissed(true);
    onDismiss?.(intervention);
  }, [intervention, storage, onDismiss, isNonDismissable]);

  const handleAction = useCallback((): void => {
    if (!intervention) {
      return;
    }
    onAction?.(intervention);
  }, [intervention, onAction]);

  const getBannerColors = (type: InterventionType): { bg: string; border: string; accent: string } => {
    switch (type) {
      case 'BURNOUT':
        return {
          bg: theme.colors.warning[500] + '15',
          border: theme.colors.warning[500],
          accent: theme.colors.warning[500],
        };
      case 'PLATEAU':
        return {
          bg: theme.colors.info[500] + '15',
          border: theme.colors.info[500],
          accent: theme.colors.info[500],
        };
      case 'STREAK_RISK':
        return {
          bg: theme.colors.error[500] + '15',
          border: theme.colors.error[500],
          accent: theme.colors.error[500],
        };
      case 'BOSS_FINISH':
      case 'BOSS_OPPORTUNITY':
        return {
          bg: theme.colors.success[500] + '15',
          border: theme.colors.success[500],
          accent: theme.colors.success[500],
        };
      case 'STUDY_BEHIND':
        return {
          bg: theme.colors.warning[500] + '15',
          border: theme.colors.warning[500],
          accent: theme.colors.warning[500],
        };
      case 'MOMENTUM_BUILDING':
        return {
          bg: theme.colors.primary[500] + '15',
          border: theme.colors.primary[500],
          accent: theme.colors.primary[500],
        };
      case 'COMEBACK_READY':
        return {
          bg: theme.colors.primary[500] + '15',
          border: theme.colors.primary[500],
          accent: theme.colors.primary[500],
        };
      case 'STUDY_PLAN_COMPLETE':
        return {
          bg: theme.colors.success[500] + '15',
          border: theme.colors.success[500],
          accent: theme.colors.success[500],
        };
      default:
        return {
          bg: theme.colors.primary[500] + '15',
          border: theme.colors.primary[500],
          accent: theme.colors.primary[500],
        };
    }
  };

  const getIcon = (type: InterventionType): string => {
    switch (type) {
      case 'BURNOUT':
        return '🔥';
      case 'PLATEAU':
        return '📊';
      case 'STREAK_RISK':
        return '⏰';
      case 'BOSS_FINISH':
        return '⚔️';
      case 'BOSS_OPPORTUNITY':
        return '🎯';
      case 'STUDY_BEHIND':
        return '📚';
      case 'MOMENTUM_BUILDING':
        return '📈';
      case 'COMEBACK_READY':
        return '🔄';
      case 'STUDY_PLAN_COMPLETE':
        return '🏆';
      default:
        return '💡';
    }
  };

  if (!intervention || isDismissed) {
    return null;
  }

  const colors = getBannerColors(intervention.type);
  const canDismiss = !isNonDismissable(intervention.type, intervention.hoursRemaining);

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      exiting={FadeOutUp.duration(300)}
      style={{
        marginHorizontal: theme.spacing[4],
        marginTop: theme.spacing[2],
        marginBottom: theme.spacing[2],
        backgroundColor: colors.bg,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <View style={{ padding: theme.spacing[4] }}>
        {/* Header with Coach Avatar and Type */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[2],
            marginBottom: theme.spacing[2],
          }}
        >
          <Text fontSize={20}>{coachAvatar || getIcon(intervention.type)}</Text>
          <View style={{ flex: 1 }}>
            <Text variant="caption" color="secondary" weight="semibold">
              {coachName} • {intervention.type.replace('_', ' ')}
            </Text>
          </View>
          {canDismiss && (
            <Pressable onPress={handleDismiss} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} accessibilityLabel="Dismiss intervention" accessibilityRole="button" accessibilityHint="Activates this control">
              <Text fontSize={18} color="secondary">
                ×
              </Text>
            </Pressable>
          )}
        </View>

        {/* Message */}
        <Text
          variant="body"
          style={{
            marginBottom: theme.spacing[3],
            lineHeight: 20,
          }}
        >
          {intervention.message}
        </Text>

        {/* Action Button */}
        <Pressable
          onPress={handleAction}
          style={{
            backgroundColor: colors.accent,
            borderRadius: theme.borderRadius.lg,
            paddingVertical: theme.spacing[2],
            paddingHorizontal: theme.spacing[4],
            alignSelf: 'flex-start',
          }}
          accessibilityLabel={intervention.actionLabel}
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text
            style={{
              color: theme.colors.background.primary,
              fontWeight: '600',
              fontSize: 14,
            }}
          >
            {intervention.actionLabel}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
