import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import type { CompanionElement } from "../../../features/onboarding/types";
import { ELEMENT_THEMES } from "../../../features/companion/types";
import { launchColors } from "@theme/tokens/launch-colors";
interface OnboardingChooseElementProps {
  selectedElement?: CompanionElement;
  onSelect: (element: CompanionElement) => void;
}
const ELEMENTS: Array<{
  id: CompanionElement;
  name: string;
  tagline: string;
  lore: string;
  effect: string;
  personality: string;
}> = [
  {
    id: "FLAME",
    name: "Flame",
    tagline: "Energetic • Bold",
    lore: "Born from the spark of determination. Flame companions thrive on intense, energetic focus sessions.",
    effect: "+3% boss damage",
    personality: "Passionate and driven",
  },
  {
    id: "WAVE",
    name: "Wave",
    tagline: "Calm • Consistent",
    lore: "Flowing with the rhythm of consistency. Wave companions excel in sustained, calm focus.",
    effect: "+3% streak protection",
    personality: "Steady and reliable",
  },
  {
    id: "TERRA",
    name: "Terra",
    tagline: "Grounded • Steady",
    lore: "Grounded in steady progress. Terra companions reward patient, methodical focus.",
    effect: "+5% XP for long sessions (45+ min)",
    personality: "Patient and persistent",
  },
  {
    id: "ZEPHYR",
    name: "Zephyr",
    tagline: "Quick • Adaptive",
    lore: "Swift and adaptable. Zephyr companions shine in quick, adaptive focus bursts.",
    effect: "+5% faster recovery from distractions",
    personality: "Agile and flexible",
  },
  {
    id: "VOID",
    name: "Void",
    tagline: "Mysterious • Intensive",
    lore: "Mysterious and intensive. Void companions draw power from deep, uninterrupted focus.",
    effect: "+2% rare drop chance",
    personality: "Intense and focused",
  },
  {
    id: "LUMINA",
    name: "Lumina",
    tagline: "Pure • Perfectionist",
    lore: "Pure and perfectionist. Lumina companions seek excellence in every session.",
    effect: "+5% XP for S-grade sessions",
    personality: "Disciplined and precise",
  },
];
export function OnboardingChooseElement({
  selectedElement,
  onSelect,
}: OnboardingChooseElementProps): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      {}
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={{ marginBottom: theme.spacing[4] }}
      >
        <Text
          variant="h2"
          color="text.primary"
          style={{ textAlign: "center", marginBottom: theme.spacing[2] }}
        >
          Choose Your Element
        </Text>
        <Text
          variant="body"
          color="text.secondary"
          style={{ textAlign: "center" }}
        >
          Your companion's element shapes its personality and grants unique
          bonuses.
        </Text>
      </Animated.View>

      {}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
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

      {}
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
            style={{ textAlign: "center" }}
          >
            {ELEMENTS.find((e) => e.id === selectedElement)?.lore}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
interface ElementCardProps {
  element: (typeof ELEMENTS)[0];
  isSelected: boolean;
  onSelect: () => void;
  delay: number;
}
function ElementCard({
  element,
  isSelected,
  onSelect,
  delay,
}: ElementCardProps): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const themeColors = ELEMENT_THEMES[element.id];
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(delay)}
      style={{ width: "48%" }}
    >
      <Pressable
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: "100%" }}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <Animated.View
          style={[
            {
              padding: theme.spacing[4],
              borderRadius: 16,
              backgroundColor: isSelected
                ? `${themeColors.primary}20`
                : theme.colors.background.secondary,
              borderWidth: 2,
              borderColor: isSelected
                ? themeColors.primary
                : `${themeColors.primary}30`,
              minHeight: 160,
            },
            animatedStyle,
          ]}
        >
          {}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: `${themeColors.primary}25`,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: theme.spacing[3],
              shadowColor: themeColors.glow,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isSelected ? 0.5 : 0.2,
              shadowRadius: isSelected ? 10 : 4,
            }}
          >
            <ElementVisual element={element.id} color={themeColors.primary} />
          </View>

          {}
          <Text
            variant="h4"
            color={isSelected ? themeColors.primary : "text.primary"}
            style={{ marginBottom: theme.spacing[1] }}
          >
            {element.name}
          </Text>

          {}
          <Text
            variant="caption"
            color="text.tertiary"
            style={{ marginBottom: theme.spacing[2] }}
          >
            {element.tagline}
          </Text>

          {}
          <View
            style={{
              paddingHorizontal: theme.spacing[2],
              paddingVertical: theme.spacing[1],
              borderRadius: 8,
              backgroundColor: `${themeColors.glow}20`,
              alignSelf: "flex-start",
            }}
          >
            <Text variant="caption" color={themeColors.glow} fontWeight="600">
              {element.effect}
            </Text>
          </View>

          {}
          {isSelected && (
            <View
              style={{
                position: "absolute",
                top: theme.spacing[3],
                right: theme.spacing[3],
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: themeColors.primary,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: launchColors.hex_fff, fontSize: 14 }}>
                ✓
              </Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
function ElementVisual({
  element,
  color,
}: {
  element: CompanionElement;
  color: string;
}): JSX.Element {
  const visuals: Record<CompanionElement, JSX.Element> = {
    FLAME: (
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: 8,
            height: 20,
            backgroundColor: color,
            borderRadius: 4,
            marginBottom: -8,
          }}
        />
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: color,
            borderRadius: 10,
          }}
        />
      </View>
    ),
    WAVE: (
      <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
        <View
          style={{
            width: 4,
            height: 24,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
        <View
          style={{
            width: 4,
            height: 20,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
        <View
          style={{
            width: 4,
            height: 24,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
      </View>
    ),
    TERRA: (
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: 24,
            height: 8,
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
        <View
          style={{
            width: 20,
            height: 16,
            backgroundColor: color,
            borderRadius: 4,
            marginTop: -4,
          }}
        />
      </View>
    ),
    ZEPHYR: (
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: 28,
            height: 4,
            backgroundColor: color,
            borderRadius: 2,
            marginVertical: 2,
          }}
        />
        <View
          style={{
            width: 20,
            height: 4,
            backgroundColor: color,
            borderRadius: 2,
            marginVertical: 2,
          }}
        />
        <View
          style={{
            width: 28,
            height: 4,
            backgroundColor: color,
            borderRadius: 2,
            marginVertical: 2,
          }}
        />
      </View>
    ),
    VOID: (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: launchColors.hex_fff,
            position: "absolute",
          }}
        />
      </View>
    ),
    LUMINA: (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: color,
          }}
        />
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: color,
            position: "absolute",
            opacity: 0.5,
          }}
        />
      </View>
    ),
  };
  return visuals[element];
}
export default OnboardingChooseElement;
