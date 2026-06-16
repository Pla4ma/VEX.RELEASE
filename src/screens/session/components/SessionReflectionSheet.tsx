import React from 'react';
import { Pressable, TextInput } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Box, Button, Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';
import { MOODS, type Mood } from '../utils';

type SessionReflectionSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  onFinish: () => void;
  onSkip: () => void;
  reflection: string;
  selectedMood: Mood | null;
  setReflection: (value: string) => void;
  setSelectedMood: (value: Mood) => void;
};

export function SessionReflectionSheet({
  bottomSheetRef,
  onFinish,
  onSkip,
  reflection,
  selectedMood,
  setReflection,
  setSelectedMood,
}: SessionReflectionSheetProps) {
  const { theme } = useTheme();
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['52%']}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      backgroundStyle={{
        backgroundColor: theme.colors.background.secondary,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
      }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.text.tertiary }}
    >
      <Box flex={1} px={24} py={12}>
        <Text variant="h3" color={theme.colors.text.primary}>
          How did that session feel?
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} mt={8}>
          Optional reflection before you head out.
        </Text>
        <Box flexDirection="row" justifyContent="space-between" mt={20}>
          {MOODS.map((mood) => (
            <Pressable
              key={mood.key}
              onPress={() => setSelectedMood(mood.key)}
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                backgroundColor:
                  selectedMood === mood.key
                    ? theme.colors.primary[500]
                    : theme.colors.background.primary,
                borderColor:
                  selectedMood === mood.key
                    ? theme.colors.primary[500]
                    : theme.colors.border.light,
              }}
              accessibilityLabel="Session reflection"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Text variant="h4">{mood.emoji}</Text>
            </Pressable>
          ))}
        </Box>
        <Box mt={20}>
          <TextInput
            style={{
              minHeight: 110,
              borderRadius: 18,
              borderWidth: 1,
              padding: 16,
              textAlignVertical: 'top',
              backgroundColor: theme.colors.background.primary,
              borderColor: theme.colors.border.light,
              color: theme.colors.text.primary,
            }}
            multiline
            numberOfLines={4}
            placeholder="What did you accomplish? Any notes for next time?"
            placeholderTextColor={theme.colors.text.tertiary}
            value={reflection}
            onChangeText={setReflection}
          />
        </Box>
        <Box mt={20} gap={12}>
          <Button variant="primary"
            size="lg"
            fullWidth
            onPress={onFinish}
            accessibilityLabel="Finish reflection"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            Finish
          </Button>
          <Button variant="ghost"
            size="md"
            fullWidth
            onPress={onSkip}
            accessibilityLabel="Skip reflection"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            Skip
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  );
}
