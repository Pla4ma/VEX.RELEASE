import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { UnlockDecision } from '../types';
import { Text as VexText } from '../../../components/primitives/Text';

interface UnlockExplainerCardProps {
  decision: UnlockDecision;
  onHide: () => void;
  onReconsider?: () => void;
}

/**
 * Renders an unlock explainer card with evidence-based reason,
 * "Why am I seeing this?" expandable section, and hide/reconsider actions.
 *
 * All copy is non-manipulative — no FOMO, no urgency, no exclusivity.
 */
export function UnlockExplainerCard({
  decision,
  onHide,
  onReconsider,
}: UnlockExplainerCardProps): React.ReactElement {
  const { theme } = useTheme();
  const [showEvidence, setShowEvidence] = useState(false);

  const toggleEvidence = useCallback(() => {
    setShowEvidence((prev) => !prev);
  }, []);

  if (decision.decision === 'hidden') {
    return <View />;
  }

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.primary[100],
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius['2xl'],
        padding: theme.spacing[4],
        gap: theme.spacing[3],
      }}
    >
      {/* Title */}
      <Text variant="label" color={theme.colors.primary[500]}>
        {decision.decision === 'unlocked'
          ? `${decision.featureKey.replace(/_/g, ' ')} is now available`
          : decision.decision === 'teased'
            ? 'Something new is forming'
            : decision.featureKey.replace(/_/g, ' ')}
      </Text>

      {/* Evidence-based reason */}
      <Text variant="bodySmall" color={theme.colors.text.secondary}>
        {decision.userFacingReason}
      </Text>

      {/* Why am I seeing this? */}
      {decision.evidence.length > 0 && (
        <Pressable
          onPress={toggleEvidence}
          accessibilityLabel="Why am I seeing this"
          accessibilityRole="button"
          accessibilityHint="Shows supporting evidence for this recommendation"
        >
          <Text variant="label" color={theme.colors.primary[500]}>
            {showEvidence ? 'Hide details' : 'Why am I seeing this?'}
          </Text>
        </Pressable>
      )}

      {showEvidence && decision.evidence.length > 0 && (
        <View
          style={{
            backgroundColor: theme.colors.background.primary,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing[3],
          }}
        >
          {decision.evidence.map((item, index) => (
            <Text
              key={`${item.source}-${index}`}
              variant="bodySmall"
              color={theme.colors.text.secondary}
            >
              {item.source}: {item.detail}
            </Text>
          ))}
        </View>
      )}

      {/* Actions */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[2],
        }}
      >
        <Button variant="primary"
          size="sm"
          onPress={onHide}
          accessibilityLabel="Got it"
        >
          <VexText>Got it</VexText>
        </Button>

        {decision.canHide && (
          <Button variant="secondary"
            size="sm"
            onPress={onHide}
            accessibilityLabel="Hide this feature"
          >
            <VexText>Hide this</VexText>
          </Button>
        )}

        {decision.canHide && onReconsider && (
          <Button variant="ghost"
            size="sm"
            onPress={onReconsider}
            accessibilityLabel="Reconsider later"
          >
            <VexText>Reconsider later</VexText>
          </Button>
        )}
      </View>
    </View>
  );
}
