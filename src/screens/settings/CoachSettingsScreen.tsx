import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import React, { useState, useCallback } from "react";
import { ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "../../theme";
import { Box, Text } from "../../components/primitives";
import { Icon } from "../../icons";
import { useUIStore } from "../../store/index";
import type { SettingsStackParams } from "../../navigation";
import { launchColors } from "@theme/tokens/launch-colors";
import {
  CoachPersonaSelector,
  type CoachPersona,
} from "./CoachPersonaSelector";
import {
  CoachFrequencySelector,
  type MessageFrequency,
} from "./CoachFrequencySelector";
import { CoachToneSelector, type CoachLanguage } from "./CoachToneSelector";

type Props = NativeStackScreenProps<SettingsStackParams, "CoachSettings">;

export const CoachSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useUIStore();
  const [selectedPersona, setSelectedPersona] =
    useState<CoachPersona>("mentor");
  const [frequency, setFrequency] = useState<MessageFrequency>("normal");
  const [language, setLanguage] = useState<CoachLanguage>("en");

  const handlePersonaChange = useCallback((persona: CoachPersona) => {
    setSelectedPersona(persona);
  }, []);

  const handleFrequencyChange = useCallback((freq: MessageFrequency) => {
    setFrequency(freq);
  }, []);

  const handleLanguageChange = useCallback((lang: CoachLanguage) => {
    setLanguage(lang);
  }, []);

  const handleResetMemory = useCallback(() => {
    Alert.alert(
      "Reset Coach Memory?",
      "This will clear all conversation history and reset your coach to default. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            showToast({
              message: "Coach memory has been reset",
              type: "success",
              duration: 3000,
            });
          },
        },
      ],
    );
  }, [showToast]);

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box
          px={20}
          pb={16}
          pt={insets.top + 16}
          flexDirection="row"
          alignItems="center"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
            accessibilityLabel="Coach setting"
            accessibilityRole="button"
            accessibilityHint="Double tap to change setting"
          >
            <Icon
              name="arrow-left"
              size={24}
              color={theme.colors.text.primary}
            />
          </Pressable>
          <Text variant="h2">AI Coach</Text>
        </Box>

        <CoachPersonaSelector
          selectedPersona={selectedPersona}
          onSelectPersona={handlePersonaChange}
        />

        <CoachFrequencySelector
          frequency={frequency}
          onFrequencyChange={handleFrequencyChange}
        />

        <CoachToneSelector
          language={language}
          onLanguageChange={handleLanguageChange}
        />

        <Box px={16} mb={24}>
          <Text
            variant="caption"
            color="text.secondary"
            style={{
              marginLeft: 12,
              marginBottom: 8,
              fontWeight: "600",
              letterSpacing: 0.5,
            }}
          >
            DATA
          </Text>
          <Pressable
            onPress={handleResetMemory}
            style={{
              backgroundColor:
                theme.colors.error[50] || launchColors.hex_fef2f2,
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.colors.error.DEFAULT + "30",
            }}
            accessibilityLabel="Coach setting"
            accessibilityRole="button"
            accessibilityHint="Double tap to change setting"
          >
            <Box
              width={40}
              height={40}
              borderRadius={10}
              justifyContent="center"
              alignItems="center"
              style={{ backgroundColor: theme.colors.error.DEFAULT + "20" }}
            >
              <Icon
                name="refresh-cw"
                size={20}
                color={theme.colors.error.DEFAULT}
              />
            </Box>
            <Box flex={1} ml={12}>
              <Text
                variant="body"
                style={{ fontWeight: "600", color: theme.colors.error.DEFAULT }}
              >
                Reset Coach Memory
              </Text>
              <Text
                variant="caption"
                color="text.secondary"
                style={{ marginTop: 2 }}
              >
                Clear all conversation history
              </Text>
            </Box>
          </Pressable>
        </Box>

        <Box height={insets.bottom + 20} />
      </ScrollView>
    </Box>
  );
};

export default withScreenErrorBoundary(CoachSettingsScreen, "CoachSettings");
