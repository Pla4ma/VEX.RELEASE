/**
 * Feature Screen Component
 *
 * Standardized layout shell for all feature screens.
 * Provides consistent header, loading states, and error handling.
 */

import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Box } from './Box';
import { Text } from './Text';
import { Icon } from '../../icons/components/Icon';
import { useTheme } from '../../theme/ThemeContext';
import { ErrorState } from '../../shared/ui/state-components/error-state';
import { Skeleton } from '../../shared/ui/primitives/Skeleton';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import { vexFire } from '../../theme/tokens/vex-fire';

interface FeatureScreenProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  showBackButton?: boolean;
  rightAction?: { icon: string; onPress: () => void; label: string };
  skeletonCount?: number;
  children: React.ReactNode;
  scrollable?: boolean; // default true
  padded?: boolean; // default true — adds px="lg" to content
}

export const FeatureScreen: React.ComponentType<FeatureScreenProps> = ({
  title,
  subtitle,
  isLoading = false,
  isError = false,
  errorMessage = 'Something went wrong',
  onRetry,
  showBackButton = true,
  rightAction,
  skeletonCount = 3,
  children,
  scrollable = true,
  padded = true,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const Container = scrollable ? ScrollView : Box;
  const containerProps = scrollable
    ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: {
          flexGrow: 1,
          paddingBottom: insets.bottom + theme.spacing[8],
        },
      }
    : { flex: 1 };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: vexFire.background }}
      edges={['top']}
    >
      {/* Standard Header */}
      <Box
        alignItems="center"
        flexDirection="row"
        px="lg"
        pt="md"
        pb="sm"
        style={{
          borderBottomColor: vexFire.border,
          borderBottomWidth: 1,
        }}
      >
        {showBackButton ? (
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={getMinTouchTargetStyle()}
            accessibilityHint="Double tap to activate"
          >
            <Icon name="back" size="md" color={vexFire.cream} />
          </Pressable>
        ) : null}
        <Box flex={1} ml={showBackButton ? 'sm' : undefined}>
          <Text variant="h3" numberOfLines={1}>{title}</Text>
          {subtitle ? (
            <Text variant="caption" color="text.secondary" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </Box>
        {rightAction ? (
          <Pressable
            onPress={rightAction.onPress}
            accessibilityRole="button"
            accessibilityLabel={rightAction.label}
            style={getMinTouchTargetStyle()}
            accessibilityHint="Double tap to activate"
          >
            <Icon name={rightAction.icon} size="md" color={vexFire.amber} />
          </Pressable>
        ) : null}
      </Box>
      <Container {...containerProps}>
        <Animated.View
          entering={FadeIn.duration(300)}
          style={padded ? { paddingHorizontal: theme.spacing[4] } : undefined}
        >
          {isLoading ? (
            <Box pt="lg">
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <Skeleton
                  key={`item-${i}`}
                  variant="rounded"
                  height={80}
                  style={{ marginBottom: theme.spacing[3] }}
                />
              ))}
            </Box>
          ) : isError ? (
            <Box flex={1} justifyContent="center" py="2xl">
              <ErrorState error={errorMessage} onRetry={onRetry} />
            </Box>
          ) : (
            children
          )}
        </Animated.View>
      </Container>
    </SafeAreaView>
  );
};
