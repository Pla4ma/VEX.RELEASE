import React from "react";
import { View, ViewStyle } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useTheme } from "../../../theme";
import { Text } from "../../../components/primitives";
import { Button } from "../../../components";
import { EnterAnimation } from "./EnterAnimation";
import { createSheet } from "@/shared/ui/create-sheet";


export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  style,
  testID,
  variant = 'default',
  featureName,
}) => {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();

  const iconContent = typeof icon === 'string' ? (
    <Text style={[styles.icon, { fontSize: variant === 'first-use' ? 80 : 64 }]}>
      {icon}
    </Text>
  ) : icon;

  return (
    <EnterAnimation
      direction="up"
      speed={reducedMotion ? 'instant' : 'normal'}
    >
      <View style={[styles.container, style]}>
      <View style={styles.content} testID={testID}>
        {/* Icon/Illustration */}
        <View style={styles.iconContainer}>
          {iconContent || (
            <View
              style={[
                styles.placeholderIcon,
                { backgroundColor: theme.colors.border.DEFAULT },
              ]}
            />
          )}
        </View>

        {/* Title */}
        <Text
          variant={variant === 'first-use' ? 'h2' : 'h3'}
          style={styles.title}
          textAlign="center"
          accessibilityRole="header"
        >
          {title}
        </Text>

        {/* Description */}
        {description && (
          <Text
            variant="body"
            style={[
              styles.description,
              { color: theme.colors.text.secondary },
            ]}
            textAlign="center"
          >
            {description}
          </Text>
        )}

        {/* First-use extra context */}
        {variant === 'first-use' && featureName && (
          <Text
            variant="caption"
            style={styles.featureContext}
            textAlign="center"
          >
            {featureName} unlocks after your first focus session
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {actionLabel && onAction && (
            <Button
              variant="primary"
              onPress={onAction}
              style={styles.primaryAction}

            accessibilityLabel="Action button"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
              {actionLabel}
            </Button>
          )}

          {secondaryLabel && onSecondary && (
            <Button
              variant="ghost"
              onPress={onSecondary}
              style={styles.secondaryAction}

            accessibilityLabel="Action button"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
              {secondaryLabel}
            </Button>
          )}
        </View>

        {/* Offline indicator */}
        {variant === 'offline' && (
          <View style={[styles.offlineBadge, { backgroundColor: theme.colors.warning.light }]}>
            <Text variant="caption" style={{ color: theme.colors.warning.DEFAULT }}>
              ● Offline Mode
            </Text>
          </View>
        )}
      </View>
    </View>
    </EnterAnimation>
  );
};

export const InventoryEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>> = (props) => (
  <EmptyState {...PRESETS.inventory} {...props} />
);

export const FeedEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>> = (props) => (
  <EmptyState {...PRESETS.feed} {...props} />
);

export const LeaderboardEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>> = (props) => (
  <EmptyState {...PRESETS.leaderboards} {...props} />
);

export const ChallengeEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>> = (props) => (
  <EmptyState {...PRESETS.challenges} {...props} />
);

export const ShopEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>> = (props) => (
  <EmptyState {...PRESETS.shop} {...props} />
);

export const SquadWarsEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>> = (props) => (
  <EmptyState {...PRESETS.squadWars} {...props} />
);

export const OfflineEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'description' | 'variant'>> = (props) => (
  <EmptyState {...PRESETS.offline} {...props} />
);

export const ErrorEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'description' | 'variant'>> = (props) => (
  <EmptyState {...PRESETS.error} {...props} />
);