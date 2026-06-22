import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from './primitives/Text';
import { Icon } from '../icons/components/Icon';
import { useTheme } from '../theme/ThemeContext';
import { useDisclosureAnalytics } from '../features/liveops-config';
import type {
  FeatureKey,
  UserExperienceStage,
} from '../features/liveops-config';
import { UnlockRequirementRow } from './UnlockRequirementRow';
import { buttonTap } from '../utils/haptics';

interface FeatureTeaserCardProps {
  feature: FeatureKey;
  icon: string;
  title: string;
  description: string;
  whyItMatters: string;
  unlockLabel: string;
  progressLabel?: string;
  ctaLabel: string;
  stage: UserExperienceStage;
  onPress: () => void;
}

/**
 * FeatureTeaserCard — horizontal row with leading icon chip,
 * stacked headline + reason, inline progress, trailing chevron.
 * Replaces the previous vertical 5-line shape that was indistinguishable
 * from PaywallHero / PremiumSurface / ContentStudyHeroCard.
 */
export function FeatureTeaserCard(props: FeatureTeaserCardProps): React.ReactNode {
  const { theme } = useTheme();
  const analytics = useDisclosureAnalytics();

  useEffect(() => {
    analytics.trackFeatureTeaserViewed(props.feature, props.stage);
  }, [analytics, props.feature, props.stage]);

  return (
    <Pressable
      onPress={() => {
        buttonTap();
        analytics.trackTeaserCtaPressed(
          props.feature,
          props.ctaLabel,
          props.stage,
        );
        props.onPress();
      }}
      accessibilityLabel={`${props.title}. ${props.description}`}
      accessibilityRole="button"
      accessibilityHint={`${props.ctaLabel}. Double tap to open.`}
      style={({ pressed }) => ({
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        backgroundColor: pressed
          ? theme.colors.background.tertiary
          : theme.colors.background.secondary,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing[4],
        paddingHorizontal: theme.spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[3],
        opacity: pressed ? 0.94 : 1,
        minHeight: 44,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primary[50],
        }}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        <Icon name={props.icon} size={20} color={theme.colors.primary[500]} />
      </View>
      <View style={{ flex: 1, gap: theme.spacing[1] }}>
        <Text variant="label" color={theme.colors.primary[500]}>
          {props.title}
        </Text>
        <Text
          variant="body"
          color={theme.colors.text.primary}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {props.description}
        </Text>
        <UnlockRequirementRow
          label={props.unlockLabel}
          progressLabel={props.progressLabel}
        />
      </View>
      <Icon
        name="chevron-right"
        size={20}
        color={theme.colors.text.tertiary}
      />
    </Pressable>
  );
}
