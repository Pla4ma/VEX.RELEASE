import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '@/theme';
import { Box, Text, Card } from '@/components/primitives';
import { Icon } from '@/icons';
import { lightColors } from '@/theme/tokens/colors';


export type FontSize = 'small' | 'medium' | 'large';

interface FontSizeOption {
  id: FontSize;
  label: string;
  sampleSize: number;
}

const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { id: 'small', label: 'Small', sampleSize: 14 },
  { id: 'medium', label: 'Medium', sampleSize: 16 },
  { id: 'large', label: 'Large', sampleSize: 18 },
];

interface FontSizeControlProps {
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
}

export const FontSizeControl: React.FC<FontSizeControlProps> = ({
  fontSize,
  onFontSizeChange,
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
        FONT SIZE
      </Text>
      <Card size="sm" style={{ overflow: 'hidden' }}>
        {FONT_SIZE_OPTIONS.map((option, index) => (
          <React.Fragment key={option.id}>
            <Pressable
              onPress={() => onFontSizeChange(option.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 16,
              }}
              accessibilityLabel="Font size control"
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
                    fontSize === option.id
                      ? theme.colors.primary[50]
                      : theme.colors.background.secondary,
                }}
              >
                <Text
                  style={{
                    fontSize: option.sampleSize,
                    fontWeight: '600',
                    color:
                      fontSize === option.id
                        ? theme.colors.primary[500]
                        : theme.colors.text.tertiary,
                  }}
                >
                  A
                </Text>
              </Box>
              <Box flex={1} ml={12}>
                <Text
                  variant="body"
                  style={{
                    fontSize: option.sampleSize,
                    fontWeight: fontSize === option.id ? '600' : '400',
                    color: theme.colors.text.primary,
                  }}
                >
                  {option.label}
                </Text>
              </Box>
              {fontSize === option.id && (
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
            {index < FONT_SIZE_OPTIONS.length - 1 && (
              <Box
                height={1}
                ml={68}
                style={{ backgroundColor: theme.colors.border.light }}
              />
            )}
          </React.Fragment>
        ))}
      </Card>
    </Box>
  );
};
