import React from 'react';
import { View } from 'react-native';

import { FeatureTeaserCard } from '../../components/FeatureTeaserCard';
import { getPremiumCardStyle } from '../../components/premiumStyles';
import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import type {
  FeatureAccessMap,
  FeatureKey,
  UserExperienceStage,
} from '../../features/liveops-config';
import type { NextBestAction } from '../../features/progression';
import { useTheme } from '../../theme';
import { HOME_FEATURE_COPY } from './home-feature-copy';

export function NextBestActionCard({
  action,
  onPress,
}: {
  action: NextBestAction;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ borderWidth: 1, borderColor: theme.colors.primary[100], backgroundColor: theme.colors.background.secondary, padding: theme.spacing[4], gap: theme.spacing[3], ...getPremiumCardStyle('large') }}>
      <Text variant="label" color={theme.colors.primary[500]}>Next Best Action</Text>
      <Text variant="h4" color={theme.colors.text.primary}>{action.title}</Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>{action.description}</Text>
      <Text variant="caption" color={theme.colors.text.tertiary}>{action.rewardLabel}</Text>
      <Button onPress={onPress}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">{action.ctaLabel}</Button>
    </View>
  );
}

const GOAL_COPY: Record<UserExperienceStage, { title: string; body: string }> = {
  NEW_USER: {
    title: 'Start with one clean finish',
    body: 'One completed session makes VEX feel real. The app stays intentionally quiet until then.',
  },
  ACTIVATING: {
    title: 'Protect the habit first',
    body: 'Build momentum before exploring extras. The social and boss layers unlock naturally.',
  },
  ENGAGED: {
    title: 'Deepen your momentum',
    body: 'Your next session should build on your streak, not just maintain it.',
  },
  POWER_USER: {
    title: 'Master your focus rhythm',
    body: 'Use the full VEX toolkit when it serves you. Keep the core habit strong.',
  },
};

export function GoalCard({
  stage,
}: {
  stage: UserExperienceStage;
}) {
  const { theme } = useTheme();
  const copy = GOAL_COPY[stage];

  return (
    <View style={{ borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.secondary, padding: theme.spacing[4], gap: theme.spacing[2], ...getPremiumCardStyle('medium') }}>
      <Text variant="label" color={theme.colors.text.secondary}>Today&apos;s Focus</Text>
      <Text variant="h4" color={theme.colors.text.primary}>{copy.title}</Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>{copy.body}</Text>
    </View>
  );
}

export function ProgressPreviewCard({
  body,
  ctaLabel,
  eyebrow,
  onPress,
  title,
}: {
  body: string;
  ctaLabel: string;
  eyebrow: string;
  onPress: () => void;
  title: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.secondary, padding: theme.spacing[4], gap: theme.spacing[3], ...getPremiumCardStyle('medium') }}>
      <Text variant="label" color={theme.colors.text.secondary}>{eyebrow}</Text>
      <Text variant="h4" color={theme.colors.text.primary}>{title}</Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>{body}</Text>
      <Button variant="outline" onPress={onPress}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">{ctaLabel}</Button>
    </View>
  );
}

export function ReturnReasonCard({
  body,
  ctaLabel,
  eyebrow,
  onDismiss,
  onPress,
  tone = 'default',
  title,
}: {
  body: string;
  ctaLabel: string;
  eyebrow: string;
  onDismiss?: () => void;
  onPress: () => void;
  tone?: 'default' | 'celebration' | 'info' | 'warning';
  title: string;
}) {
  const { theme } = useTheme();
  const toneStyles = {
    celebration: { backgroundColor: theme.colors.surface.selected, borderColor: theme.colors.primary[200] },
    default: { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.primary[100] },
    info: { backgroundColor: theme.colors.info[50], borderColor: theme.colors.info[500] },
    warning: { backgroundColor: theme.colors.warning[50], borderColor: theme.colors.warning[500] },
  }[tone];

  return (
    <View style={{ borderWidth: 1, padding: theme.spacing[4], gap: theme.spacing[3], ...toneStyles, ...getPremiumCardStyle('large') }}>
      <Text variant="label" color={theme.colors.primary[500]}>{eyebrow}</Text>
      <Text variant="h4" color={theme.colors.text.primary}>{title}</Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>{body}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3] }}>
        <Button onPress={onPress}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">{ctaLabel}</Button>
        {onDismiss ? <Button variant="outline" onPress={onDismiss}
  accessibilityLabel="Dismiss button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">Dismiss</Button> : null}
      </View>
    </View>
  );
}

export function ComingSoonSection({
  features,
  stage,
  onPress,
}: {
  features: FeatureAccessMap;
  stage: UserExperienceStage;
  onPress: (feature: FeatureKey) => void;
}) {
  const teased = (Object.entries(features) as Array<[FeatureKey, FeatureAccessMap[FeatureKey]]>)
    .filter(([, value]) => value.isTeased)
    .sort((a, b) => (a[1]?.priority ?? 0) - (b[1]?.priority ?? 0))
    .slice(0, 2);

  if (teased.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 12 }}>
      <Text variant="h4">Later, when it helps</Text>
      {teased.map(([feature, access]) => (
        <FeatureTeaserCard
          key={feature}
          ctaLabel="Start a session"
          description={access.lockedDescription}
          feature={feature}
          icon={HOME_FEATURE_COPY[feature].icon}
          onPress={() => onPress(feature)}
          progressLabel={access.recommendedUnlockMoment}
          stage={stage}
          title={HOME_FEATURE_COPY[feature].title}
          unlockLabel={access.unlockReason}
          whyItMatters={HOME_FEATURE_COPY[feature].why}
        />
      ))}
    </View>
  );
}
