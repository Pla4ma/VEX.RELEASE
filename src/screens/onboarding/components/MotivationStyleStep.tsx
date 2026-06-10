import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import type {
  FocusGoal,
  MotivationProfileType,
} from '../../../features/onboarding/schemas';
import { useTheme } from '../../../theme';
import { styles } from '../styles';
import { OnboardingAdaptationPreview } from './OnboardingAdaptationPreview';
import { MOTIVATION_STYLE_OPTIONS } from './onboarding-flow-data';

type MotivationStyleStepProps = {
  goal: FocusGoal | undefined;
  motivationStyle: MotivationProfileType | undefined;
  onSelectStyle: (style: MotivationProfileType) => void;
};

export function MotivationStyleStep({
  goal,
  motivationStyle,
  onSelectStyle,
}: MotivationStyleStepProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        How should VEX adapt to you?
      </Text>
      <Text
        style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}
      >
        This shapes how VEX suggests sessions and frames progress. You can change it anytime.
      </Text>
      <View style={styles.choiceGrid}>
        {MOTIVATION_STYLE_OPTIONS.map((style) => {
          const isSelected = motivationStyle === style.id;
          return (
            <Pressable
              key={style.id}
              onPress={() => onSelectStyle(style.id as MotivationProfileType)}
              style={[
                styles.choiceCard,
                {
                  backgroundColor: isSelected
                    ? `${theme.colors.primary[500]}18`
                    : theme.colors.background.secondary,
                  borderColor: isSelected
                    ? theme.colors.primary[500]
                    : theme.colors.border.DEFAULT,
                },
              ]}
              accessibilityLabel={`Choose ${style.title} motivation`}
              accessibilityRole="button"
              accessibilityHint="Sets how VEX balances focus, study, coach tone, and motivation layers"
            >
              <Text
                style={[
                  styles.choiceTitle,
                  { color: theme.colors.text.primary },
                ]}
              >
                {style.title}
              </Text>
              <Text
                style={[
                  styles.choiceDescription,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {style.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <OnboardingAdaptationPreview
        goal={goal}
        motivationStyle={motivationStyle}
      />
    </View>
  );
}
