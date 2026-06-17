import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import type { HomeExperienceModel } from '../schemas';

export function useHomeExperienceModel(_a: unknown, _b: unknown, _c: unknown): HomeExperienceModel {
  return useMemo(() => ({
    stage: 'STAGE_0' as const,
    spotlight: 'study' as const,
    allowedRoutes: [],
    aiCoachMessageStyle: '',
    companionPlacement: '',
    hiddenSections: [],
    mustNotRun: [],
    primaryCta: '',
    progressPlacement: '',
    rpgBossPlacement: '',
    secondaryCta: '',
    studyOsPlacement: '',
    teasedElements: [],
    unlockPathCopy: '',
    visibleSections: [],
    allowedQueries: [],
  }), []);
}
import { Text } from '../../../components/primitives/Text';
import { GlassPillSurface } from '../../../components/glass/GlassPillSurface';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { useOnboardingStore } from '../../onboarding/store';
import type { FirstWeekExperience } from '../../personalization/first-week-schemas';
import type { HomeSurfaceMap } from '../surface-decision-schemas';
export type { HomeSurfaceMap };
import { OPTIONS } from './HomeExperiencePrelude.options';
import { CoachLineView } from './CoachLineView';
import { EvolutionTeaserCard } from './EvolutionTeaserCard';
import { BossTeaserCard } from './BossTeaserCard';

interface HomeExperiencePreludeProps {
  model: HomeExperienceModel;
  firstWeekExperience?: FirstWeekExperience;
  surfaceMap?: HomeSurfaceMap;
}

export function HomeExperiencePrelude({
  model,
  firstWeekExperience,
  surfaceMap,
}: HomeExperiencePreludeProps): React.ReactNode {
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
    firstWeekExperience?.unlockTease ?? model.teasedElements[0]?.copy ?? '';

  return (
    <View style={{ gap: 10 }}>
      {showCoachLine ? (
        <CoachLineView message={model.aiCoachMessageStyle} />
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
        <EvolutionTeaserCard teaseCopy={teaseCopy} />
      ) : null}
      {isBossVisible ? (
        <BossTeaserCard rpgBossPlacement={model.rpgBossPlacement} />
      ) : null}
    </View>
  );
}
