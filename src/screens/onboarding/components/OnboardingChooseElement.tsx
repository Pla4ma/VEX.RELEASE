import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { CompanionElement } from '../../../features/onboarding/types';
import { ELEMENT_THEMES } from '../../../features/companion/types';
import { ELEMENTS } from './elementData';
import { ElementCard } from './ElementCard';

interface OnboardingChooseElementProps {
  selectedElement?: CompanionElement;
  onSelect: (element: CompanionElement) => void;
}

export function OnboardingChooseElement({
  selectedElement,
  onSelect,
}: OnboardingChooseElementProps): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={{ marginBottom: theme.spacing[4] }}
      >
        <Text
          variant="h2"
          color="text.primary"
          style={{ textAlign: 'center', marginBottom: theme.spacing[2] }}
        >
          Choose Your Element
        </Text>
        <Text
          variant="body"
          color="text.secondary"
          style={{ textAlign: 'center' }}
        >
          Your companion's element shapes its personality and grants unique
          bonuses.
        </Text>
      </Animated.View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: theme.spacing[3],
        }}
      >
        {ELEMENTS.map((element, index) => (
          <ElementCard
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            onSelect={() => onSelect(element.id)}
            delay={index * 100}
          />
        ))}
      </View>

      {selectedElement && (
        <Animated.View
          entering={FadeInUp.duration(300)}
          style={{
            marginTop: theme.spacing[4],
            padding: theme.spacing[4],
            borderRadius: 12,
            backgroundColor: `${ELEMENT_THEMES[selectedElement].primary}15`,
            borderWidth: 1,
            borderColor: `${ELEMENT_THEMES[selectedElement].primary}40`,
          }}
        >
          <Text
            variant="body"
            color={ELEMENT_THEMES[selectedElement].primary}
            style={{ textAlign: 'center' }}
          >
            {ELEMENTS.find((e) => e.id === selectedElement)?.lore}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

export default OnboardingChooseElement;
