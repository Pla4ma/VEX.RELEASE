import React from 'react';
import { Pressable } from 'react-native';

import { GlassCard } from '../../../components/glass/GlassCard';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface HomeSectionBoundaryProps {
  children: React.ReactNode;
  sectionName: string;
}

function SectionErrorFallback({
  sectionName,
  onRetry,
}: {
  sectionName: string;
  onRetry: () => void;
}): React.ReactNode {
  return (
    <Pressable
      onPress={onRetry}
      accessibilityLabel={`Retry ${sectionName}`}
      accessibilityRole="button"
    >
      <GlassCard variant="subtle" style={{ marginBottom: 12 }}>
        <Text
          variant="bodySmall"
          style={{ color: vexLightGlass.semantic.danger, fontSize: 14, fontWeight: '500' }}
        >
          {sectionName} did not load.
        </Text>
        <Text
          variant="caption"
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 13,
            marginTop: 4,
          }}
        >
          Tap to retry.
        </Text>
      </GlassCard>
    </Pressable>
  );
}

export function HomeSectionBoundary({
  children,
  sectionName,
}: HomeSectionBoundaryProps): React.ReactNode {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <SectionErrorFallback
        sectionName={sectionName}
        onRetry={() => setHasError(false)}
      />
    );
  }

  try {
    return <>{children}</>;
  } catch (error: unknown) {
    setHasError(true);
    return (
      <SectionErrorFallback
        sectionName={sectionName}
        onRetry={() => setHasError(false)}
      />
    );
  }
}
