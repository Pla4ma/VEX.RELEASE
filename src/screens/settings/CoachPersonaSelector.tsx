import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '@/theme';
import { Box, Text, Card } from '@/components/primitives';
import { Icon } from '@/icons';
import { launchColors } from '@theme/tokens/launch-colors';
import {
  PERSONA_OPTIONS,
  type CoachPersona,
} from './persona-data';

export type { CoachPersona };
export { PERSONA_OPTIONS };

interface CoachPersonaSelectorProps {
  selectedPersona: CoachPersona;
  onSelectPersona: (persona: CoachPersona) => void;
}

export const CoachPersonaSelector: React.FC<CoachPersonaSelectorProps> = ({
  selectedPersona,
  onSelectPersona,
}) => {
  const { theme } = useTheme();
  const selectedData = PERSONA_OPTIONS.find((p) => p.id === selectedPersona);

  return (
    <>
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
          YOUR COACH
        </Text>
        <Card
          size="md"
          style={{
            overflow: 'hidden',
            backgroundColor: theme.colors.background.secondary,
          }}
        >
          <Box p={20} alignItems="center">
            <Box
              width={80}
              height={80}
              borderRadius={40}
              justifyContent="center"
              alignItems="center"
              mb={16}
              style={{
                backgroundColor:
                  selectedData?.color || theme.colors.primary[500],
              }}
            >
              <Text style={{ fontSize: 40 }}>{selectedData?.emoji}</Text>
            </Box>
            <Text variant="h3" style={{ marginBottom: 4 }}>
              {selectedData?.label}
            </Text>
            <Text
              variant="body"
              color="text.secondary"
              style={{ marginBottom: 16 }}
            >
              {selectedData?.description}
            </Text>
            <Box width="100%">
              {selectedData?.exampleMessages.map((message, index) => (
                <Box
                  key={index}
                  p={12}
                  borderRadius={12}
                  mb={8}
                  style={{
                    backgroundColor: theme.colors.background.primary,
                    borderLeftWidth: 3,
                    borderLeftColor: selectedData?.color,
                  }}
                >
                  <Text
                    variant="body"
                    color="text.secondary"
                    style={{ fontStyle: 'italic' }}
                  >
                    "{message}"
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Card>
      </Box>

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
          COACH PERSONA
        </Text>
        <Card size="sm" style={{ overflow: 'hidden' }}>
          {PERSONA_OPTIONS.map((option, index) => (
            <React.Fragment key={option.id}>
              <Pressable
                onPress={() => onSelectPersona(option.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                }}
                accessibilityLabel="Coach persona option"
                accessibilityRole="button"
                accessibilityHint="Double tap to change setting"
              >
                <Box
                  width={48}
                  height={48}
                  borderRadius={12}
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    backgroundColor: option.color + '20',
                    borderWidth: selectedPersona === option.id ? 2 : 0,
                    borderColor: option.color,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{option.emoji}</Text>
                </Box>
                <Box flex={1} ml={12}>
                  <Text
                    variant="body"
                    style={{
                      fontWeight:
                        selectedPersona === option.id ? '600' : '500',
                      color: theme.colors.text.primary,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text
                    variant="caption"
                    color="text.secondary"
                    style={{ marginTop: 2 }}
                  >
                    {option.description}
                  </Text>
                </Box>
                {selectedPersona === option.id && (
                  <Box
                    width={24}
                    height={24}
                    borderRadius={12}
                    justifyContent="center"
                    alignItems="center"
                    style={{ backgroundColor: option.color }}
                  >
                    <Icon
                      name="check"
                      size={14}
                      color={launchColors.hex_fff}
                    />
                  </Box>
                )}
              </Pressable>
              {index < PERSONA_OPTIONS.length - 1 && (
                <Box
                  height={1}
                  ml={76}
                  style={{ backgroundColor: theme.colors.border.light }}
                />
              )}
            </React.Fragment>
          ))}
        </Card>
      </Box>
    </>
  );
};
