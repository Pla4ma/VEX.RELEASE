import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { spectacleService, type SpectacleEvent } from '../index';

interface SpectacleOverlayProps {
  children: React.ReactNode;
}

export function SpectacleOverlay({ children }: SpectacleOverlayProps): JSX.Element {
  const { theme } = useTheme();
  const [event, setEvent] = useState<SpectacleEvent | null>(null);

  useEffect(() => {
    const unsubscribe = spectacleService.subscribe((nextEvent) => {
      setEvent(nextEvent);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!event) {
      return undefined;
    }
    const timeout = setTimeout(() => setEvent(null), 3200);
    return () => clearTimeout(timeout);
  }, [event]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {event ? (
        <View
          pointerEvents="box-none"
          style={{
            bottom: theme.spacing[6],
            left: theme.spacing[4],
            position: 'absolute',
            right: theme.spacing[4],
          }}
        >
          <Pressable
            accessibilityHint="Dismisses the current VEX moment."
            accessibilityLabel={`${event.title}. ${event.body}`}
            accessibilityRole="button"
            onPress={() => setEvent(null)}
            style={{
              backgroundColor: theme.colors.background.elevated,
              borderColor: theme.colors.primary[200],
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              minHeight: 64,
              padding: theme.spacing[4],
            }}
          >
            <Text color={theme.colors.primary[500]} variant="label">
              {event.title}
            </Text>
            <Text color={theme.colors.text.secondary} mt={1} variant="bodySmall">
              {event.body}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default SpectacleOverlay;
