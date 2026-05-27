import React from "react";
import { Pressable, View } from "react-native";

import { Text } from "../../../components/primitives/Text";
import {
  ONBOARDING_GOALS,
  type OnboardingGoal,
} from "../../../features/onboarding";
import { useTheme } from "../../../theme";
import { styles } from "../styles";
import { OnboardingAdaptationPreview } from "./OnboardingAdaptationPreview";

type GoalStepProps = {
  goal: OnboardingGoal | undefined;
  onSelectGoal: (goal: OnboardingGoal) => void;
};

export function GoalStep({ goal, onSelectGoal }: GoalStepProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        Pick the outcome you want from session one.
      </Text>
      <Text
        style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}
      >
        VEX gets useful after a real focus block. This choice tunes the first
        recommendation.
      </Text>
      <View style={styles.choiceGrid}>
        {ONBOARDING_GOALS.map((item) => {
          const isSelected = goal === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelectGoal(item.id)}
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
              accessibilityLabel={`Choose ${item.label}`}
              accessibilityRole="button"
              accessibilityHint="Selects this goal for your first VEX session"
            >
              <Text
                style={[
                  styles.choiceTitle,
                  { color: theme.colors.text.primary },
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  styles.choiceDescription,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {item.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <OnboardingAdaptationPreview goal={goal} motivationStyle={undefined} />
    </View>
  );
}
