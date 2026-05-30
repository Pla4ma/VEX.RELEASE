import { captureSilentFailure } from "../../../utils/silent-failure";
import React, { useCallback, useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeContext";
import { Text } from "../../../components";
import { MMKVStorageAdapter } from "../../../persistence/MMKVStorageAdapter";
import type { Intervention, CoachInterventionBannerProps } from "./intervention-types";
import { DISMISSAL_STORAGE_KEY, DISMISSAL_TTL_HOURS } from "./intervention-types";
import {
  getBannerColors,
  getIcon,
  isNonDismissable,
} from "./intervention-helpers";

export type { InterventionType, Intervention, CoachInterventionBannerProps } from "./intervention-types";

export function CoachInterventionBanner({
  intervention,
  coachName,
  coachAvatar,
  onAction,
  onDismiss,
}: CoachInterventionBannerProps): JSX.Element | null {
  const { theme } = useTheme();
  const [isDismissed, setIsDismissed] = useState(false);
  const [storage] = useState(
    () => new MMKVStorageAdapter("coach-interventions"),
  );

  useEffect(() => {
    if (!intervention) {
      setIsDismissed(false);
      return;
    }
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
        const hoursSinceDismissal =
          (Date.now() - dismissedAt) / (1000 * 60 * 60);
        if (isNonDismissable(intervention.type, intervention.hoursRemaining)) {
          setIsDismissed(false);
        } else if (hoursSinceDismissal < DISMISSAL_TTL_HOURS) {
          setIsDismissed(true);
        } else {
          setIsDismissed(false);
        }
      } catch (error) {
        captureSilentFailure(error, {
          feature: "ai-coach",
          operation: "ui-fallback",
          type: "ui",
        });
        setIsDismissed(false);
      }
    };
    checkDismissal();
  }, [intervention, storage]);

  const handleDismiss = useCallback((): void => {
    if (!intervention) {
      return;
    }
    if (isNonDismissable(intervention.type, intervention.hoursRemaining)) {
      return;
    }
    const raw = storage.getItemSync(DISMISSAL_STORAGE_KEY);
    const dismissed: Record<string, number> = raw ? JSON.parse(raw) : {};
    dismissed[intervention.id] = Date.now();
    storage.setItemSync(DISMISSAL_STORAGE_KEY, JSON.stringify(dismissed));
    setIsDismissed(true);
    onDismiss?.(intervention);
  }, [intervention, storage, onDismiss]);

  const handleAction = useCallback((): void => {
    if (!intervention) {
      return;
    }
    onAction?.(intervention);
  }, [intervention, onAction]);

  if (!intervention || isDismissed) {
    return null;
  }
  const colors = getBannerColors(intervention.type, theme as unknown as Record<string, Record<string, string | undefined>>);
  const canDismiss = !isNonDismissable(
    intervention.type,
    intervention.hoursRemaining,
  );

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
        overflow: "hidden",
      }}
    >
      <View style={{ padding: theme.spacing[4] }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing[2],
            marginBottom: theme.spacing[2],
          }}
        >
          <Text fontSize={20}>{coachAvatar || getIcon(intervention.type)}</Text>
          <View style={{ flex: 1 }}>
            <Text variant="caption" color="secondary" weight="semibold">
              {coachName} • {intervention.type.replace("_", " ")}
            </Text>
          </View>
          {canDismiss && (
            <Pressable
              onPress={handleDismiss}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              accessibilityLabel="Dismiss intervention"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Text fontSize={18} color="secondary">
                ×
              </Text>
            </Pressable>
          )}
        </View>

        <Text
          variant="body"
          style={{ marginBottom: theme.spacing[3], lineHeight: 20 }}
        >
          {intervention.message}
        </Text>

        <Pressable
          onPress={handleAction}
          style={{
            backgroundColor: colors.accent,
            borderRadius: theme.borderRadius.lg,
            paddingVertical: theme.spacing[2],
            paddingHorizontal: theme.spacing[4],
            alignSelf: "flex-start",
          }}
          accessibilityLabel={intervention.actionLabel}
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text
            style={{
              color: theme.colors.background.primary,
              fontWeight: "600",
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
