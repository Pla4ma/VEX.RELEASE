import React, { useState, useCallback } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Icon } from '../../../icons/components/Icon';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { spacing } from '../../../theme/tokens/spacing';

import { useCaptureForm, useCaptureMutation } from '../hooks';
import { CaptureTypeSelector } from './CaptureTypeSelector';
import { Text as VexText } from '../../../components/primitives/Text';

interface CaptureSheetProps {
  userId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CaptureSheet({
  userId,
  onClose,
  onSuccess,
}: CaptureSheetProps): React.ReactNode {
  const { state, setType, setContent } = useCaptureForm();
  const mutation = useCaptureMutation(userId);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!state.content.trim()) return;
    try {
      await mutation.mutateAsync({
        type: state.type,
        content: state.content,
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (_err) {
      // Error handled by mutation
    }
  }, [state.content, state.type, mutation, onClose, onSuccess]);

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(18)}
      exiting={SlideOutDown.springify().damping(18)}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: vexLightGlass.glass.fillStrong,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderWidth: 1,
        borderColor: vexLightGlass.glass.border,
        padding: spacing[6],
        paddingBottom: spacing[10],
        shadowColor: vexLightGlass.glass.shadowStrong,
        shadowRadius: 40,
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.3,
        elevation: 20,
        zIndex: 1000,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing[5],
        }}
      >
        <Text variant="h4" color="text.primary">
          {submitted ? 'Captured!' : 'Quick Capture'}
        </Text>
        <Pressable
          onPress={onClose}
          accessibilityLabel="Close capture"
          accessibilityRole="button"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="x" size={24} color={vexLightGlass.text.secondary} />
        </Pressable>
      </View>

      {submitted ? (
        <Animated.View
          entering={SlideInDown.springify()}
          style={{ alignItems: 'center', padding: spacing[8] }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: `${vexLightGlass.semantic.success}22`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing[4],
            }}
          >
            <Icon name="check" size={36} color={vexLightGlass.semantic.success} />
          </View>
          <Text variant="h5" color="text.primary">
            Saved successfully
          </Text>
          <Text variant="bodySmall" color="text.tertiary" style={{ marginTop: spacing[2] }}>
            Your capture is ready in your library
          </Text>
        </Animated.View>
      ) : (
        <>
          <CaptureTypeSelector
            selectedType={state.type}
            onSelect={setType}
          />

          <View
            style={{
              marginTop: spacing[5],
              backgroundColor: vexLightGlass.glass.fill,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: vexLightGlass.glass.borderSubtle,
              padding: spacing[4],
              minHeight: 120,
            }}
          >
            <TextInput
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: vexLightGlass.text.primary,
                fontFamily: 'Inter',
                minHeight: 100,
              }}
              multiline
              placeholder={getPlaceholder(state.type)}
              placeholderTextColor={vexLightGlass.text.disabled}
              value={state.content}
              onChangeText={setContent}
              accessibilityLabel="Capture content"
              accessibilityHint="Enter your capture content"
            />
          </View>

          {mutation.isError && (
            <Text
              variant="caption"
              color="semantic.danger"
              style={{ marginTop: spacing[3] }}
            >
              {mutation.error?.message ?? 'Failed to save'}
            </Text>
          )}

          <Button variant="primary"
            size="lg"
            fullWidth
            style={{ marginTop: spacing[5] }}
            isLoading={mutation.isPending}
            onPress={handleSubmit}
            accessibilityLabel="Save capture"
            accessibilityRole="button"
          >
            <VexText>Save Capture</VexText>
          </Button>
        </>
      )}
    </Animated.View>
  );
}

function getPlaceholder(type: string): string {
  switch (type) {
    case 'voice':
      return 'Voice note will appear here after recording...';
    case 'photo':
      return 'Add a description for your photo...';
    case 'link':
      return 'Paste a URL and add notes...';
    default:
      return 'What is on your mind? Drop anything here.';
  }
}
