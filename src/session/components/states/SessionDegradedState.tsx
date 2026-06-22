import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { styles } from './SessionDegradedState.styles';
import { useTheme } from '../../../theme/ThemeContext';

interface DegradedFeature {
  name: string;
  available: boolean;
  reason?: string;
}
interface SessionDegradedStateProps {
  reason: string;
  features: DegradedFeature[];
  onContinueAnyway?: () => void;
  onRetryFullMode?: () => void;
  onEndSession?: () => void;
}
export const SessionDegradedState: React.FC<SessionDegradedStateProps> = ({
  reason,
  features,
  onContinueAnyway,
  onRetryFullMode,
  onEndSession,
}) => {
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;
  const availableCount = features.filter((f) => f.available).length;
  const totalCount = features.length;
  return (
    <View style={[styles.container, { backgroundColor: semantic.background }]}>
      <View style={[styles.warningBanner, { backgroundColor: semantic.warning }]}>
        <Text style={[styles.warningIcon, { color: semantic.background }]}>
          !
        </Text>
        <Text style={[styles.warningText, { color: semantic.background }]}>
          Limited Mode
        </Text>
      </View>
      <Text style={[styles.title, { color: semantic.textPrimary }]}>
        Session Degraded
      </Text>
      <Text style={[styles.reason, { color: semantic.textMuted }]}>
        {reason}
      </Text>
      <View style={[styles.featuresContainer, { backgroundColor: semantic.surfaceElevated }]}>
        <Text style={[styles.featuresTitle, { color: semantic.textMuted }]}>
          Features ({availableCount}/{totalCount} available):
        </Text>
        {features.map((feature, index) => (
          <View
            key={feature.name}
            style={[styles.featureRow, { borderBottomColor: semantic.border }]}
          >
            <Text
              style={[
                styles.featureIcon,
                {
                  color: feature.available ? semantic.success : semantic.danger,
                },
              ]}
            >
              {feature.available ? '●' : '○'}
            </Text>
            <View style={styles.featureInfo}>
              <Text
                style={[
                  styles.featureName,
                  { color: semantic.textPrimary },
                  !feature.available && [
                    styles.featureUnavailable,
                    { color: semantic.textMuted },
                  ],
                ]}
              >
                {feature.name}
              </Text>
              {!feature.available && feature.reason && (
                <Text style={[styles.featureReason, { color: semantic.warning }]}>
                  {feature.reason}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.actions}>
        {onRetryFullMode && (
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: semantic.danger },
              pressed && { opacity: 0.8 },
            ]}
            onPress={onRetryFullMode}
            accessibilityLabel="Retry full mode"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={[styles.primaryButtonText, { color: semantic.textPrimary }]}>
              Retry Full Mode
            </Text>
          </Pressable>
        )}
        {onContinueAnyway && (
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: semantic.borderStrong },
              pressed && { opacity: 0.8 },
            ]}
            onPress={onContinueAnyway}
            accessibilityLabel="Continue in limited mode"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={[styles.secondaryButtonText, { color: semantic.textSecondary }]}>
              Continue in Limited Mode
            </Text>
          </Pressable>
        )}
        {onEndSession && (
          <Pressable
            style={({ pressed }) => [
              styles.endButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onEndSession}
            accessibilityLabel="End session"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={[styles.endButtonText, { color: semantic.danger }]}>
              End Session
            </Text>
          </Pressable>
        )}
      </View>
      <View
        style={[
          styles.explanation,
          {
            backgroundColor: `${semantic.warning}10`,
            borderColor: `${semantic.warning}30`,
          },
        ]}
      >
        <Text style={[styles.explanationTitle, { color: semantic.warning }]}>
          What does this mean?
        </Text>
        <Text style={[styles.explanationText, { color: semantic.textMuted }]}>
          Your session is still running, but some features are temporarily
          unavailable. Your progress is still being tracked and will sync once
          full service is restored.
        </Text>
      </View>
    </View>
  );
};
export { SessionDegradedState }