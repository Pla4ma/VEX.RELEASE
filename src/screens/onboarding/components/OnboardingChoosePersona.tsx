import React, { useState } from "react";
import { Pressable } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { Box } from "../../../components/primitives/Box";
import { Button } from "../../../components/primitives/Button";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { launchColors } from "@theme/tokens/launch-colors";
export type CoachPersonaType = "cheerleader" | "mentor" | "drill-sergeant";
export interface CoachPersona {
  id: CoachPersonaType;
  icon: string;
  name: string;
  description: string;
  examples: string[];
  color: string;
}
interface OnboardingChoosePersonaProps {
  selectedPersona: CoachPersonaType | null;
  onSelectPersona: (persona: CoachPersonaType) => void;
  onContinue: () => void;
  onSkip: () => void;
}
const PERSONAS: CoachPersona[] = [
  {
    id: "cheerleader",
    icon: "🎉",
    name: "The Cheerleader",
    description: "Enthusiastic, encouraging",
    examples: [
      '"You\'re absolutely crushing this! 🔥"',
      '"I knew you had it in you! Keep going!"',
    ],
    color: launchColors.hex_f59e0b,
  },
  {
    id: "mentor",
    icon: "📚",
    name: "The Mentor",
    description: "Calm, wise, strategic",
    examples: [
      '"Small steps lead to big progress."',
      '"Your consistency is building something great."',
    ],
    color: launchColors.hex_3b82f6,
  },
  {
    id: "drill-sergeant",
    icon: "💀",
    name: "The Drill Sergeant",
    description: "Intense, zero tolerance",
    examples: [
      '"Excuses don\'t build empires. Focus!"',
      '"You asked for this. Now deliver."',
    ],
    color: launchColors.hex_ef4444,
  },
];
function ExampleMessage({
  text,
  delay,
}: {
  text: string;
  delay: number;
}): JSX.Element {
  const { theme } = useTheme();
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(400)}>
      <Box
        p="sm"
        borderRadius="lg"
        bg={theme.colors.background.tertiary}
        borderLeftWidth={3}
        borderLeftColor={theme.colors.primary[400]}
      >
        <Text variant="caption" color="text.secondary" fontStyle="italic">
          {text}
        </Text>
      </Box>
    </Animated.View>
  );
}
function PersonaCard({
  persona,
  isSelected,
  onPress,
  index,
}: {
  persona: CoachPersona;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}): JSX.Element {
  const { theme } = useTheme();
  const [showExamples, setShowExamples] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 200 }),
    );
    setShowExamples(true);
    onPress();
  };
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 150).duration(400)}
      style={animatedStyle}
    >
      <Pressable
        onPress={handlePress}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <Box
          p="lg"
          borderRadius="2xl"
          bg={
            isSelected
              ? `${persona.color}15`
              : theme.colors.background.secondary
          }
          borderWidth={2}
          borderColor={isSelected ? persona.color : theme.colors.border.DEFAULT}
          gap="md"
        >
          {}
          <Box flexDirection="row" alignItems="center" gap="md">
            <Box
              width={48}
              height={48}
              borderRadius="full"
              bg={isSelected ? persona.color : theme.colors.background.tertiary}
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize={24}>{persona.icon}</Text>
            </Box>

            <Box flex={1}>
              <Text
                variant="h4"
                color={isSelected ? "text.primary" : "text.primary"}
                fontWeight={isSelected ? "700" : "600"}
              >
                {persona.name}
              </Text>
              <Text variant="caption" color="text.tertiary">
                {persona.description}
              </Text>
            </Box>

            {}
            <Box
              width={24}
              height={24}
              borderRadius="full"
              bg={isSelected ? persona.color : theme.colors.background.tertiary}
              borderWidth={2}
              borderColor={
                isSelected ? persona.color : theme.colors.border.DEFAULT
              }
              justifyContent="center"
              alignItems="center"
            >
              {isSelected && (
                <Text fontSize={14} color={theme.colors.text.inverse}>
                  ✓
                </Text>
              )}
            </Box>
          </Box>

          {}
          {(isSelected || showExamples) && (
            <Box gap="sm">
              {persona.examples.map((example, i) => (
                <ExampleMessage key={i} text={example} delay={i * 200} />
              ))}
            </Box>
          )}
        </Box>
      </Pressable>
    </Animated.View>
  );
}
export function OnboardingChoosePersona({
  selectedPersona,
  onSelectPersona,
  onContinue,
  onSkip,
}: OnboardingChoosePersonaProps): JSX.Element {
  const { theme } = useTheme();
  return (
    <Box flex={1} justifyContent="space-between" px="xl" py="2xl">
      {}
      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="md" mt="xl">
          <Text fontSize={40}>🤖</Text>
          <Box gap="sm">
            <Text variant="h2" color="text.primary">
              Pick your coach
            </Text>
            <Text variant="body" color="text.secondary">
              Your coach will adapt to your style and keep you focused.
            </Text>
          </Box>
        </Box>
      </Animated.View>

      {}
      <Box gap="md" flex={1} justifyContent="center">
        {PERSONAS.map((persona, index) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            isSelected={selectedPersona === persona.id}
            onPress={() => onSelectPersona(persona.id)}
            index={index}
          />
        ))}
      </Box>

      {}
      <Animated.View entering={FadeInUp.delay(600).duration(400)}>
        <Box gap="md">
          <Button
            size="lg"
            variant="primary"
            fullWidth
            onPress={onContinue}
            disabled={!selectedPersona}
            accessibilityLabel="Action button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            {selectedPersona ? "Continue" : "Select a coach"}
          </Button>

          <Pressable
            onPress={onSkip}
            accessibilityLabel="Skip for now (defaults to Mentor) button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Box py="sm" alignItems="center">
              <Text variant="body" color="text.tertiary">
                Skip for now (defaults to Mentor)
              </Text>
            </Box>
          </Pressable>
        </Box>
      </Animated.View>
    </Box>
  );
}
export default OnboardingChoosePersona;
