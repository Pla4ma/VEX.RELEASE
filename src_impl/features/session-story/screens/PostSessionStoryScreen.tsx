import React from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { StatusBanner } from '../../../shared/ui/components/StatusFeedback';
import { useReducedMotion } from '../../../hooks';
import { useTheme } from '../../../theme';
import { StreakShieldMomentCard } from '../../monetization/components/StreakShieldMomentCard';
import type { StreakShieldMoment } from '../../monetization/types';
import { type PostSessionStoryViewModel } from '../../session-completion/story-view-model-service';

type PostSessionStoryScreenProps = {
  isOffline: boolean;
  monetizationMoment?: StreakShieldMoment | null;
  onPrimaryAction: () => void;
  onMonetizationAccept?: () => void;
  onMonetizationDismiss?: () => void;
  onShare?: () => void;
  viewModel: PostSessionStoryViewModel;
};

function BeatCard({
  title,
  body,
  metric,
  companionLine,
  accessibilityLabel,
}: PostSessionStoryViewModel['beats'][number]): JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        gap: theme.spacing[2],
        padding: theme.spacing[4],
      }}
    >
      <Text variant="h4" color={theme.colors.text.primary}>{title}</Text>
      <Text variant="body" color={theme.colors.text.secondary}>{body}</Text>
      {metric ? <Text variant="caption" color={theme.colors.primary[500]}>{metric.label}: {metric.value}</Text> : null}
      {companionLine ? <Text variant="bodySmall" color={theme.colors.text.primary}>{companionLine}</Text> : null}
    </View>
  );
}

export function PostSessionStoryScreen({
  isOffline,
  monetizationMoment,
  onMonetizationAccept,
  onMonetizationDismiss,
  onPrimaryAction,
  onShare,
  viewModel,
}: PostSessionStoryScreenProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const entering = isReducedMotion ? undefined : FadeIn.duration(180);

  return (
    <Animated.View entering={entering} style={{ backgroundColor: theme.colors.background.primary, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ gap: theme.spacing[4], padding: theme.spacing[5], paddingBottom: theme.spacing[10] }}
        showsVerticalScrollIndicator={false}
      >
        {isOffline || viewModel.pendingSync ? (
          <StatusBanner
            status="offline"
            message="Story is safe offline"
            description="VEX is showing the saved finish now and will sync the rest when your connection is back."
          />
        ) : null}
        {viewModel.degradedWarnings.length > 0 ? (
          <StatusBanner
            status="error"
            message="Some rewards are still catching up"
            description="The session landed. A few deeper systems will repair in the background."
          />
        ) : null}
        <View style={{ gap: theme.spacing[2] }}>
          <Text variant="label" color={theme.colors.text.secondary}>Session Story</Text>
          <Text variant="h2" color={theme.colors.text.primary}>{viewModel.headline.title}</Text>
          <Text variant="body" color={theme.colors.text.secondary}>{viewModel.headline.body}</Text>
        </View>
        {viewModel.beats.map((beat) => <BeatCard key={beat.id} {...beat} />)}
        {monetizationMoment && onMonetizationAccept && onMonetizationDismiss ? (
          <StreakShieldMomentCard
            moment={monetizationMoment}
            onAccept={onMonetizationAccept}
            onDismiss={onMonetizationDismiss}
          />
        ) : null}
        <View style={{ gap: theme.spacing[3], marginTop: theme.spacing[2] }}>
          <Button
            accessibilityHint="Opens the next recommended move from this story"
            accessibilityLabel={viewModel.nextActionCta.label}
            accessibilityRole="button"
            onPress={onPrimaryAction}
            variant="primary"
          >
            {viewModel.nextActionCta.label}
          </Button>
          {onShare ? (
            <Button
              accessibilityHint="Shares this session story when sharing is available"
              accessibilityLabel="Share session story"
              accessibilityRole="button"
              onPress={onShare}
              variant="secondary"
            >
              Share story
            </Button>
          ) : null}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

export default PostSessionStoryScreen;
