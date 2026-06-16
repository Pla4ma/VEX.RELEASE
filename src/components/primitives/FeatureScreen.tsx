/**
 * Feature Screen Component
 *
 * Standardized layout shell for all feature screens.
 * Provides consistent header, loading states, and error handling.
 */

import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Pressable } from 'react-native';

import { Box } from './Box';
import { Text } from './Text';
import { Icon } from '../../icons/components/Icon';
import { useTheme } from '../../theme/ThemeContext';
import { ErrorState } from '../../shared/ui/state-components/error-state';
import { Skeleton } from '../../shared/ui/primitives';

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

export const FeatureScreen: React.FC<FeatureScreenProps> = ({
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
  const Container = scrollable ? ScrollView : Box;
  const containerProps = scrollable
    ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: { flexGrow: 1 },
      }
    : { flex: 1 };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      edges={['top']}
    >
      {/* Standard Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        px="lg"
        pt="md"
        pb="sm"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.DEFAULT,
        }}
      >
        {showBackButton && (
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{ padding: 8, marginLeft: -8, marginRight: 8 }}
            accessibilityHint="Double tap to activate"
          >
            <Icon name="back" size="md" color={theme.colors.text.primary} />
          </Pressable>
        )}

        <Box flex={1}>
          <Text variant="h3" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" color="text.secondary" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </Box>

        {rightAction && (
          <Pressable
            onPress={rightAction.onPress}
            accessibilityRole="button"
            accessibilityLabel={rightAction.label}
            style={{ padding: 8 }}
            accessibilityHint="Double tap to activate"
          >
            <Icon
              name={rightAction.icon}
              size="md"
              color={theme.colors.primary[500]}
            />
          </Pressable>
        )}
      </Box>

      {/* Content */}
      <Container {...containerProps}>
        <Animated.View
          entering={FadeIn.duration(300)}
          style={padded ? { paddingHorizontal: 16 } : undefined}
        >
          {isLoading ? (
            <Box pt="lg">
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="card"
                  height={80}
                  style={{ marginBottom: 12 }}
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
