import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '@/theme';
import { Box, Text, Card } from '@/components/primitives';
import { Icon } from '@/icons';
import { lightColors } from '@/theme/tokens/colors';


export type CoachLanguage = 'en';

interface LanguageOption {
  id: CoachLanguage;
  label: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'en', label: 'English', flag: '🇺🇸' },
];

interface CoachToneSelectorProps {
  language: CoachLanguage;
  onLanguageChange: (lang: CoachLanguage) => void;
}

export const CoachToneSelector: React.FC<CoachToneSelectorProps> = ({
  language,
  onLanguageChange,
}) => {
  const { theme } = useTheme();

  return (
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
        LANGUAGE
      </Text>
      <Card size="sm" style={{ overflow: 'hidden' }}>
        {LANGUAGE_OPTIONS.map((option, index) => (
          <React.Fragment key={option.id}>
            <Pressable
              onPress={() => onLanguageChange(option.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 16,
              }}
              accessibilityLabel="Coach tone option"
              accessibilityRole="button"
              accessibilityHint="Double tap to change setting"
            >
              <Box
                width={40}
                height={40}
                borderRadius={10}
                justifyContent="center"
                alignItems="center"
                style={{
                  backgroundColor:
                    language === option.id
                      ? theme.colors.primary[50]
                      : theme.colors.background.secondary,
                }}
              >
                <Text style={{ fontSize: 20 }}>{option.flag}</Text>
              </Box>
              <Box flex={1} ml={12}>
                <Text
                  variant="body"
                  style={{
                    fontWeight: language === option.id ? '600' : '500',
                    color: theme.colors.text.primary,
                  }}
                >
                  {option.label}
                </Text>
              </Box>
              {language === option.id && (
                <Box
                  width={24}
                  height={24}
                  borderRadius={12}
                  justifyContent="center"
                  alignItems="center"
                  style={{ backgroundColor: theme.colors.primary[500] }}
                >
                  <Icon
                    name="check"
                    size={14}
                    color={lightColors.text.inverse}
                  />
                </Box>
              )}
            </Pressable>
          </React.Fragment>
        ))}
      </Card>
    </Box>
  );
};
