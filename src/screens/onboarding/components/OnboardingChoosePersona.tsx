import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { PERSONAS, type CoachPersonaType } from './persona-data';
import { PersonaCard } from './PersonaCard';

interface OnboardingChoosePersonaProps {
  selectedPersona: CoachPersonaType | null;
  onSelectPersona: (persona: CoachPersonaType) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export function OnboardingChoosePersona({
  selectedPersona,
  onSelectPersona,
  onContinue,
  onSkip,
}: OnboardingChoosePersonaProps): JSX.Element {
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
            accessibilityLabel="Perform action"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            {selectedPersona ? 'Continue' : 'Select a coach'}
          </Button>

          <Pressable
            onPress={onSkip}
            accessibilityLabel="Skip persona selection, defaults to Mentor"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
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

export { type CoachPersonaType, type CoachPersona, PERSONAS } from './persona-data';
export { PersonaCard } from './PersonaCard';
export default OnboardingChoosePersona;
