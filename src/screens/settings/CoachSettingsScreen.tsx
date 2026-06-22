import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useState, useCallback } from 'react';
import { ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { Icon } from '../../icons/components/Icon';
import { useUIStore } from '../../store/index';
import type { SettingsStackParams } from '../../navigation';

import {
  CoachPersonaSelector,
  type CoachPersona,
} from './CoachPersonaSelector';
import {
  CoachFrequencySelector,
  type MessageFrequency,
} from './CoachFrequencySelector';
import { CoachToneSelector, type CoachLanguage } from './CoachToneSelector';
import { lightColors } from '@/theme/tokens/colors';
import {
  LiquidGlassHeader,
  liquidGlassSpacing,
} from '../../shared/ui/liquid-glass/LiquidGlassHeader';
import { LiquidGlassScreen } from '../../shared/ui/liquid-glass/LiquidGlassScreen';

type Props = NativeStackScreenProps<SettingsStackParams, 'CoachSettings'>;

          
const CoachSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();

  
  const insets = useSafeAreaInsets();
  const { showToast } = useUIStore();
  const [selectedPersona, setSelectedPersona] =
    useState<CoachPersona>('mentor');
  const [frequency, setFrequency] = useState<MessageFrequency>('normal');
  const [language, setLanguage] = useState<CoachLanguage>('en');

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
      'Reset Coach Memory?',
      'This will clear all conversation history and reset your coach to default. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            showToast({
              message: 'Coach memory has been reset',
              type: 'success',
              duration: 3000,
            });
          },
        },
      ],
    );
  }, [showToast]);

  return (
    <LiquidGlassScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box
          px={liquidGlassSpacing.screenX}
          pb={16}
          pt={insets.top + liquidGlassSpacing.screenTop}
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
          <LiquidGlassHeader
            eyebrow="Coach"
            title="AI Coach"
            body="Set the coaching voice that supports your sessions."
            tone="amber"
          />
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
              fontWeight: '600',
              letterSpacing: 0.5,
            }}
          >
            DATA
          </Text>
          <Pressable
            onPress={handleResetMemory}
            style={{
  backgroundColor:
  theme.colors.error[50] || lightColors.error[50],
  paddingVertical: 16,
  paddingHorizontal: 16,
  borderRadius: 12,
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: theme.colors.error.DEFAULT + '30',
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
              style={{ backgroundColor: theme.colors.error.DEFAULT + '20' }}
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
                style={{ fontWeight: '600', color: theme.colors.error.DEFAULT }}
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
    </LiquidGlassScreen>
  );
};

const CoachSettingsScreenWithBoundary = withScreenErrorBoundary(CoachSettingsScreen, 'CoachSettings');
export { CoachSettingsScreenWithBoundary as CoachSettingsScreen };
