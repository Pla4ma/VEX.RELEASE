/**
 * Combat Empty State
 * 
 * Empty state component for when no combat is active.
 * Provides guidance and options to start a new session.
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Box, Button } from '../../components/primitives';
import { Icon } from '../../icons';

interface CombatEmptyStateProps {
  onStartSession?: () => void;
  onTutorial?: () => void;
  variant?: 'no-session' | 'no-boss' | 'no-abilities' | 'no-history';
}

export const CombatEmptyState: React.FC<CombatEmptyStateProps> = ({
  onStartSession,
  onTutorial,
  variant = 'no-session',
}) => {
  const { theme } = useTheme();

  const getEmptyStateContent = () => {
    switch (variant) {
      case 'no-session':
        return {
          icon: 'sword',
          title: 'Ready for Battle?',
          description: 'Start a focus session to face the Distraction Demon and boost your productivity.',
          primaryAction: onStartSession,
          primaryText: 'Start Session',
          secondaryAction: onTutorial,
          secondaryText: 'Learn Combat',
          tip: 'Each focus session becomes an exciting boss battle!',
        };
      case 'no-boss':
        return {
          icon: 'shield',
          title: 'No Boss Available',
          description: 'The boss is preparing for your next challenge. Check back soon!',
          primaryAction: undefined,
          primaryText: '',
          secondaryAction: onStartSession,
          secondaryText: 'Start Practice',
          tip: 'Bosses appear based on your focus goals and progress.',
        };
      case 'no-abilities':
        return {
          icon: 'zap',
          title: 'No Abilities Unlocked',
          description: 'Complete focus sessions to unlock powerful combat abilities.',
          primaryAction: onStartSession,
          primaryText: 'Start Training',
          secondaryAction: undefined,
          secondaryText: '',
          tip: 'Each level unlocks new abilities with unique effects.',
        };
      case 'no-history':
        return {
          icon: 'clock',
          title: 'No Combat History',
          description: 'Your combat victories and achievements will appear here.',
          primaryAction: onStartSession,
          primaryText: 'Start Fighting',
          secondaryAction: undefined,
          secondaryText: '',
          tip: 'Track your progress and improve your combat skills over time.',
        };
      default:
        return {
          icon: 'sword',
          title: 'Ready for Battle?',
          description: 'Start a focus session to face the Distraction Demon.',
          primaryAction: onStartSession,
          primaryText: 'Start Session',
          secondaryAction: onTutorial,
          secondaryText: 'Learn Combat',
          tip: 'Each focus session becomes an exciting boss battle!',
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <Box
      flex={1}
      bg="background.secondary"
      justifyContent="center"
      alignItems="center"
      p="lg"
    >
      <Animated.View entering={BounceIn.duration(600)}>
        <Box alignItems="center" maxWidth={400}>
          {/* Empty State Icon */}
          <Box
            width={120}
            height={120}
            borderRadius={60}
            bg={`${theme.colors.primary[100]}`}
            justifyContent="center"
            alignItems="center"
            mb="lg"
          >
            <Icon
              name={content.icon}
              size={60}
              color={theme.colors.primary[500]}
            />
          </Box>

          {/* Title */}
          <Text
            variant="h3"
            color="text.primary"
            textAlign="center"
            mb="md"
          >
            {content.title}
          </Text>

          {/* Description */}
          <Text
            variant="body"
            color="text.secondary"
            textAlign="center"
            mb="xl"
            lineHeight={24}
          >
            {content.description}
          </Text>

          {/* Action Buttons */}
          <Box gap="sm" width="100%">
            {content.primaryAction && (
              <Button
                variant="primary"
                size="lg"
                onPress={content.primaryAction}
                style={{ width: '100%' }}
              >
                {content.primaryText}
              </Button>
            )}

            {content.secondaryAction && (
              <Button
                variant="secondary"
                size="md"
                onPress={content.secondaryAction}
                style={{ width: '100%' }}
              >
                {content.secondaryText}
              </Button>
            )}
          </Box>

          {/* Tips */}
          <Animated.View entering={FadeIn.delay(800)}>
            <Box
              bg="background.primary"
              p="md"
              borderRadius={12}
              mt="xl"
              width="100%"
            >
              <Box flexDirection="row" alignItems="center" mb="xs">
                <Icon
                  name="info"
                  size={16}
                  color={theme.colors.text.tertiary}
                  mr="xs"
                />
                <Text
                  variant="bodySmall"
                  color="text.tertiary"
                  fontWeight="600"
                >
                  Pro Tip
                </Text>
              </Box>
              <Text
                variant="bodySmall"
                color="text.secondary"
                lineHeight={18}
              >
                {content.tip}
              </Text>
            </Box>
          </Animated.View>

          {/* Stats Preview */}
          <Animated.View entering={FadeIn.delay(1000)}>
            <Box
              flexDirection="row"
              justifyContent="space-around"
              mt="xl"
              width="100%"
            >
              <Box alignItems="center">
                <Text
                  variant="h4"
                  color="primary.DEFAULT"
                  fontWeight="700"
                >
                  12
                </Text>
                <Text
                  variant="caption"
                  color="text.tertiary"
                >
                  Boss Types
                </Text>
              </Box>
              <Box alignItems="center">
                <Text
                  variant="h4"
                  color="success.DEFAULT"
                  fontWeight="700"
                >
                  8
                </Text>
                <Text
                  variant="caption"
                  color="text.tertiary"
                >
                  Abilities
                </Text>
              </Box>
              <Box alignItems="center">
                <Text
                  variant="h4"
                  color="warning.DEFAULT"
                  fontWeight="700"
                >
                  ∞
                </Text>
                <Text
                  variant="caption"
                  color="text.tertiary"
                >
                  Combos
                </Text>
              </Box>
            </Box>
          </Animated.View>
        </Box>
      </Animated.View>
    </Box>
  );
};

export default CombatEmptyState;
