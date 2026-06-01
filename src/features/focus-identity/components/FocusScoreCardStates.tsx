import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';

interface FocusScoreCardSkeletonProps {
  size: 'small' | 'medium' | 'large';
  borderColor: string;
}

export function FocusScoreCardSkeleton({
  size,
  borderColor,
}: FocusScoreCardSkeletonProps) {
  return (
    <Box
      padding={size === 'small' ? 'md' : size === 'large' ? 'xl' : 'lg'}
      backgroundColor="surface"
      borderRadius="lg"
      style={{ width: '100%' }}
    >
      <View style={{ gap: 12 }}>
        <View
          style={{
            height: 48,
            borderRadius: 4,
            width: '40%',
            backgroundColor: borderColor,
          }}
        />
        <View
          style={{
            height: 24,
            borderRadius: 4,
            backgroundColor: borderColor,
            width: '60%',
          }}
        />
        <View
          style={{
            height: 16,
            borderRadius: 4,
            width: '80%',
            backgroundColor: borderColor,
          }}
        />
      </View>
    </Box>
  );
}

interface FocusScoreCardErrorProps {
  size: 'small' | 'medium' | 'large';
  error: Error | null;
  isRetrying: boolean;
  retry: (() => void) | undefined;
  primaryColor: string;
}

export function FocusScoreCardError({
  size,
  error,
  isRetrying,
  retry,
  primaryColor,
}: FocusScoreCardErrorProps) {
  return (
    <Box
      padding={size === 'small' ? 'md' : size === 'large' ? 'xl' : 'lg'}
      backgroundColor="surface"
      borderRadius="lg"
      style={{ width: '100%', alignItems: 'center', gap: 8 }}
    >
      <Text variant="heading3" color="error" style={{ fontSize: 32 }}>
        ⚠️
      </Text>
      <Text variant="body" color="error" style={{ textAlign: 'center' }}>
        Failed to load Focus Score
      </Text>
      {error && (
        <Text
          variant="caption"
          color="textMuted"
          style={{ textAlign: 'center' }}
        >
          {error.message}
        </Text>
      )}
      <Pressable
        onPress={() => retry?.()}
        disabled={isRetrying}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
          marginTop: 8,
          backgroundColor: primaryColor,
        }}
      >
        <Text variant="button" color="background">
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </Text>
      </Pressable>
    </Box>
  );
}

interface FocusScoreCardRetryingProps {
  size: 'small' | 'medium' | 'large';
}

export function FocusScoreCardRetrying({
  size,
}: FocusScoreCardRetryingProps) {
  return (
    <Box
      padding={size === 'small' ? 'md' : size === 'large' ? 'xl' : 'lg'}
      backgroundColor="surface"
      borderRadius="lg"
      style={{ width: '100%' }}
    >
      <Text variant="body" color="textMuted" style={{ textAlign: 'center' }}>
        Retrying...
      </Text>
    </Box>
  );
}

interface FocusScoreCardNoUserProps {
  size: 'small' | 'medium' | 'large';
}

export function FocusScoreCardNoUser({
  size,
}: FocusScoreCardNoUserProps) {
  return (
    <Box
      padding={size === 'small' ? 'md' : size === 'large' ? 'xl' : 'lg'}
      backgroundColor="surface"
      borderRadius="lg"
      style={{ width: '100%' }}
    >
      <Text variant="body" color="textMuted">
        Sign in to see your Focus Score
      </Text>
    </Box>
  );
}

export function getNextBandLabel(currentLabel: string): string {
  const progression: Record<string, string> = {
    Building: 'Fair',
    Fair: 'Good',
    Good: 'Strong',
    Strong: 'Exceptional',
    Exceptional: 'Elite',
    Elite: 'Legendary',
  };
  return progression[currentLabel] || 'Max';
}
