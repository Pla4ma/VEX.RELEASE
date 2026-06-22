/**
 * Session Empty State
 *
 * Displayed when no sessions exist yet.
 * Provides CTAs to create first session.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import { useTheme } from '../../../theme/ThemeContext';

interface SessionEmptyStateProps {
  onCreateSession?: () => void;
  onBrowsePresets?: () => void;
}

export const SessionEmptyState: React.FC<SessionEmptyStateProps> = ({
  onCreateSession,
  onBrowsePresets,
}) => {
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;

  return (
    <View style={[styles.container, { backgroundColor: semantic.background }]}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: `${semantic.primary}18`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: '800', color: semantic.primary }}>
          V
        </Text>
      </View>
      <Text style={[styles.title, { color: semantic.textPrimary }]}>
        Your First Session Awaits
      </Text>
      <Text style={[styles.description, { color: semantic.textMuted }]}>
        The first session is the hardest. Everything after that is momentum.
        Build your rhythm, earn proof, return tomorrow.
      </Text>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: semantic.primary },
            pressed && { opacity: 0.8 },
          ]}
          onPress={onCreateSession}
          accessibilityLabel="Start first session"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text style={[styles.primaryButtonText, { color: semantic.textPrimary }]}>
            Start First Session
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              backgroundColor: 'transparent',
              borderColor: semantic.borderStrong,
            },
            pressed && { opacity: 0.8 },
          ]}
          onPress={onBrowsePresets}
          accessibilityLabel="Browse presets"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text style={[styles.secondaryButtonText, { color: semantic.textSecondary }]}>
            Browse Presets
          </Text>
        </Pressable>
      </View>

      {/* Tips */}
      <View style={[styles.tipsContainer, { backgroundColor: semantic.surfaceElevated }]}>
        <Text style={[styles.tipsTitle, { color: semantic.textPrimary }]}>
          Pro Tips
        </Text>
        <Text style={[styles.tip, { color: semantic.textMuted }]}>
          • Start with 25-minute focused blocks
        </Text>
        <Text style={[styles.tip, { color: semantic.textMuted }]}>
          • Keep your phone face-down during focus
        </Text>
        <Text style={[styles.tip, { color: semantic.textMuted }]}>
          • Build a daily rhythm for compound returns
        </Text>
      </View>
    </View>
  );
};

const styles = createSheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export { SessionEmptyState }