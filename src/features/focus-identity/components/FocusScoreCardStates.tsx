import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { sanitizeErrorMessage } from '../../../utils/error-sanitizer';

interface FocusScoreCardSkeletonProps {
  size: 'small' | 'medium' | 'large';
  borderColor: string;
}

export function FocusScoreCardSkeleton({
  size,
  borderColor,
}: FocusScoreCardSkeletonProps) {
  return (
    <GlassCard padding={size === 'small' ? 14 : size === 'large' ? 18 : 16} radius={22}>
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
    </GlassCard>
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
    <GlassCard
      padding={size === 'small' ? 14 : size === 'large' ? 18 : 16}
      radius={22}
      style={{ width: '100%' }}
    >
      <View style={{ alignItems: 'center', gap: 8 }}>
      <Text style={{ color: vexLightGlass.semantic.danger, fontSize: 32 }}>
        !
      </Text>
      <Text
        style={{
          color: vexLightGlass.semantic.danger,
          fontSize: 13,
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        Failed to load Focus Score
      </Text>
      {error && (
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          {sanitizeErrorMessage(error)}
        </Text>
      )}
      <Pressable
        onPress={() => retry?.()}
        disabled={isRetrying}
        accessibilityLabel={isRetrying ? 'Retrying...' : 'Try Again'}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
          marginTop: 8,
          backgroundColor: primaryColor,
        }}
      >
        <Text
          style={{
            color: vexLightGlass.text.inverse,
            fontSize: 12,
            fontWeight: '800',
          }}
        >
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </Text>
      </Pressable>
      </View>
    </GlassCard>
  );
}

interface FocusScoreCardRetryingProps {
  size: 'small' | 'medium' | 'large';
}

export function FocusScoreCardRetrying({
  size,
}: FocusScoreCardRetryingProps) {
  return (
    <GlassCard padding={size === 'small' ? 14 : size === 'large' ? 18 : 16} radius={22}>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 13,
          textAlign: 'center',
        }}
      >
        Retrying...
      </Text>
    </GlassCard>
  );
}

interface FocusScoreCardNoUserProps {
  size: 'small' | 'medium' | 'large';
}

export function FocusScoreCardNoUser({
  size,
}: FocusScoreCardNoUserProps) {
  return (
    <GlassCard padding={size === 'small' ? 14 : size === 'large' ? 18 : 16} radius={22}>
      <Text style={{ color: vexLightGlass.text.secondary, fontSize: 13 }}>
        Sign in to see your Focus Score
      </Text>
    </GlassCard>
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
