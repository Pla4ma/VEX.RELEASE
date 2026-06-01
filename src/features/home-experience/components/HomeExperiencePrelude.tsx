import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useOnboardingStore } from '../../onboarding/store';
import type { ExplicitMotivationStyle, HomeExperienceModel } from '../schemas';
import type { FirstWeekExperience } from '../../personalization/first-week-schemas';
import type { HomeSurfaceMap } from '../surface-decision-schemas';

const OPTIONS: Array<{ label: string; value: ExplicitMotivationStyle }> = [
  { label: 'Calm', value: 'calm' },
  { label: 'Study-focused', value: 'study_focused' },
  { label: 'Game-like', value: 'game_like' },
  { label: 'Coach-led', value: 'coach_led' },
  { label: 'Intense', value: 'intense' },
];

interface HomeExperiencePreludeProps {
  model: HomeExperienceModel;
  firstWeekExperience?: FirstWeekExperience;
  surfaceMap?: HomeSurfaceMap;
}

export function HomeExperiencePrelude({
  model,
  firstWeekExperience,
  surfaceMap,
}: HomeExperiencePreludeProps): JSX.Element {
  const { theme } = useTheme();
  const selected = useOnboardingStore((state) => state.explicitMotivationStyle);
  const setStyle = useOnboardingStore(
    (state) => state.setExplicitMotivationStyle,
  );

  const showMotivationPicker = firstWeekExperience
    ? firstWeekExperience.allowedHomeSurfaces.includes(
        'motivation_confirmation',
      )
    : model.visibleSections.includes('motivation_style');
  const showEvolutionTeaser = firstWeekExperience
    ? firstWeekExperience.unlockTease !== null &&
      firstWeekExperience.currentDayStage !== 'POST_DAY_7'
    : model.teasedElements.length > 0;
  const showCoachLine = firstWeekExperience
    ? firstWeekExperience.allowedHomeSurfaces.includes(
        'coach_presence_line',
      )
    : true;
  const isBossVisible = firstWeekExperience
    ? firstWeekExperience.bossIntensity !== 'hidden' && surfaceMap
      ? surfaceMap.boss_teaser !== 'hidden' &&
        surfaceMap.boss_teaser !== 'blocked'
      : false
    : false;

  const teaseCopy =
    firstWeekExperience?.unlockTease ?? model.teasedElements[0]?.copy;

  return (
    <View style={{ gap: theme.spacing[3] }}>
      {showCoachLine ? (
        <View style={{ gap: theme.spacing[1] }}>
          <Text variant="label" color="text.secondary">
            AI Coach
          </Text>
          <Text variant="body" color="text.primary">
            {model.aiCoachMessageStyle}
          </Text>
        </View>
      ) : null}
      {showMotivationPicker ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing[2],
          }}
        >
          {OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setStyle(option.value)}
              accessibilityLabel={`Choose ${option.label} motivation style`}
              accessibilityRole="button"
              accessibilityHint="Personalizes Home copy and keeps the first session available"
              style={{
                backgroundColor:
                  selected === option.value
                    ? theme.colors.primary[500]
                    : theme.colors.background.secondary,
                borderColor: theme.colors.border.light,
                borderRadius: theme.borderRadius.md,
                borderWidth: 1,
                minHeight: 44,
                paddingHorizontal: theme.spacing[3],
                paddingVertical: theme.spacing[2],
              }}
            >
              <Text
                variant="bodySmall"
                color={
                  selected === option.value ? 'text.inverse' : 'text.primary'
                }
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {showEvolutionTeaser ? (
        <View
          style={{
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing[4],
          }}
        >
          <Text variant="label" color="text.secondary">
            Next evolution
          </Text>
          <Text variant="body" color="text.primary">
            {teaseCopy}
          </Text>
        </View>
      ) : null}
      {isBossVisible ? (
        <View
          style={{
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing[4],
          }}
          accessibilityLabel="Boss teaser active"
          accessibilityRole="text"
        >
          <Text variant="label" color="text.secondary">
            Challenge forming
          </Text>
          <Text variant="body" color="text.primary">
            {model.rpgBossPlacement}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
