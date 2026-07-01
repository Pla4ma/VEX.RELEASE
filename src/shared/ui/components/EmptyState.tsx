import React from 'react';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { EnterAnimation } from './EnterAnimation';
import { createSheet } from '@/shared/ui/create-sheet';
import { PRESETS, type EmptyStateProps } from './EmptyState.presets';

export type { EmptyStateProps } from './EmptyState.presets';

export const EmptyState: React.ComponentType<EmptyStateProps> = ({
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
  const iconContent =
    typeof icon === 'string' ? (
      <Text
        style={[styles.icon, { fontSize: variant === 'first-use' ? 80 : 64 }]}
      >
        {icon}
      </Text>
    ) : (
      icon
    );
  return (
    <EnterAnimation direction="up" speed={reducedMotion ? 'instant' : 'normal'}>
      <View style={[styles.container, style]}>
        <View style={styles.content} testID={testID}>
          {}
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

          {}
          <Text
            variant={variant === 'first-use' ? 'h2' : 'h3'}
            style={styles.title}
            textAlign="center"
            accessibilityRole="header"
          >
            {title}
          </Text>

          {}
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

          {}
          {variant === 'first-use' && featureName && (
            <Text
              variant="caption"
              style={styles.featureContext}
              textAlign="center"
            >
              {featureName} unlocks after your first focus session
            </Text>
          )}

          {}
          <View style={styles.actions}>
            {actionLabel && onAction && (
              <Button
                variant="primary"
                onPress={onAction}
                style={styles.primaryAction}
                accessibilityLabel="Perform action"
                accessibilityRole="button"
                accessibilityHint="Double tap to activate"
              >
                {actionLabel}
              </Button>
            )}

            {secondaryLabel && onSecondary && (
              <Button
                variant="ghost"
                onPress={onSecondary}
                style={styles.secondaryAction}
                accessibilityLabel="Perform action"
                accessibilityRole="button"
                accessibilityHint="Double tap to activate"
              >
                {secondaryLabel}
              </Button>
            )}
          </View>

          {}
          {variant === 'offline' && (
            <View
              style={[
                styles.offlineBadge,
                { backgroundColor: theme.colors.warning.light },
              ]}
            >
              <Text
                variant="caption"
                style={{ color: theme.colors.warning.DEFAULT }}
              >
                ● Offline Mode
              </Text>
            </View>
          )}
        </View>
      </View>
    </EnterAnimation>
  );
};

export const InventoryEmptyState: React.ComponentType<
  Omit<EmptyStateProps, 'icon' | 'title' | 'description'>
> = (props) => <EmptyState {...PRESETS.inventory} {...props} />;
export const FeedEmptyState: React.ComponentType<
  Omit<EmptyStateProps, 'icon' | 'title' | 'description'>
> = (props) => <EmptyState {...PRESETS.feed} {...props} />;
export const LeaderboardEmptyState: React.ComponentType<
  Omit<EmptyStateProps, 'icon' | 'title' | 'description'>
> = (props) => <EmptyState {...PRESETS.leaderboards} {...props} />;
export const ChallengeEmptyState: React.ComponentType<
  Omit<EmptyStateProps, 'icon' | 'title' | 'description'>
> = (props) => <EmptyState {...PRESETS.challenges} {...props} />;
export const ShopEmptyState: React.ComponentType<
  Omit<EmptyStateProps, 'icon' | 'title' | 'description'>
> = (props) => <EmptyState {...PRESETS.shop} {...props} />;
export const SquadWarsEmptyState: React.ComponentType<
  Omit<EmptyStateProps, 'icon' | 'title' | 'description'>
> = (props) => <EmptyState {...PRESETS.squadWars} {...props} />;
export const OfflineEmptyState: React.ComponentType<
  Omit<EmptyStateProps, 'icon' | 'title' | 'description' | 'variant'>
> = (props) => <EmptyState {...PRESETS.offline} {...props} />;
export const ErrorEmptyState: React.ComponentType<
  Omit<EmptyStateProps, 'icon' | 'title' | 'description' | 'variant'>
> = (props) => <EmptyState {...PRESETS.error} {...props} />;

const styles = createSheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: { alignItems: 'center', maxWidth: 320 },
  iconContainer: { marginBottom: 24 },
  icon: { textAlign: 'center' },
  placeholderIcon: { width: 80, height: 80, borderRadius: 40 },
  title: { marginBottom: 12 },
  description: { marginBottom: 24, lineHeight: 22 },
  featureContext: { marginBottom: 24, fontStyle: 'italic' },
  actions: { flexDirection: 'column', gap: 12, width: '100%' },
  primaryAction: { minWidth: 200 },
  secondaryAction: { minWidth: 200 },
  offlineBadge: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});