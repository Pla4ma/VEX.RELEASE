import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { GlassPillSurface } from '../../../components/glass/GlassPillSurface';
import { GlassCard } from '../../../components/glass/GlassCard';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
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
    <View style={{ gap: 10 }}>
      {showCoachLine ? (
        <View style={{ gap: 4, paddingHorizontal: 2 }}>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 12,
              fontWeight: '800',
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}
          >
            AI Coach
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 14,
              fontWeight: '500',
              letterSpacing: -0.2,
              lineHeight: 20,
            }}
          >
            {model.aiCoachMessageStyle}
          </Text>
        </View>
      ) : null}
      {showMotivationPicker ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setStyle(option.value)}
              accessibilityLabel={`Choose ${option.label} motivation style`}
              accessibilityRole="button"
              accessibilityHint="Personalizes Home copy and keeps the first session available"
            >
              <GlassPillSurface
                height={32}
                selected={selected === option.value}
                tone={selected === option.value ? 'mint' : 'neutral'}
              >
                <View style={{ paddingHorizontal: 10 }}>
                  <Text
                    style={{
                      color:
                        selected === option.value
                          ? '#FFFFFF'
                          : vexLightGlass.text.primary,
                      fontSize: 13,
                      fontWeight: selected === option.value ? '700' : '500',
                    }}
                  >
                    {option.label}
                  </Text>
                </View>
              </GlassPillSurface>
            </Pressable>
          ))}
        </View>
      ) : null}
      {showEvolutionTeaser ? (
        <GlassCard padding={16} radius={22} variant="subtle">
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 12,
              fontWeight: '800',
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}
          >
            Next evolution
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 14,
              fontWeight: '500',
              letterSpacing: -0.2,
              lineHeight: 20,
              marginTop: 4,
            }}
          >
            {teaseCopy}
          </Text>
        </GlassCard>
      ) : null}
      {isBossVisible ? (
        <GlassCard variant="subtle">
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 13,
              fontWeight: '600',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            Challenge forming
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 15,
              fontWeight: '500',
              letterSpacing: -0.2,
              lineHeight: 22,
              marginTop: 4,
            }}
          >
            {model.rpgBossPlacement}
          </Text>
        </GlassCard>
      ) : null}
    </View>
  );
}
