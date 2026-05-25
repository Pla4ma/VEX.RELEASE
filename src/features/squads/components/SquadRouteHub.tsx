import React from 'react';
import { View, Text } from 'react-native';

import { useAuthStore } from '../../../store';
import { useThemeObject } from '../../../theme';
import { Button, Card } from '../../../components';
import { createSheet } from '@/shared/ui/create-sheet';
import { SquadHub } from './SquadHub';

export function SquadRouteHub(): JSX.Element {
  const theme = useThemeObject();
  const userId = useAuthStore((state) => state.user?.id);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Squad detail paused</Text>
        <Text style={[styles.copy, { color: theme.colors.text.secondary }]}>
          Squad management is simplified for this release. Focus momentum is tracked automatically while you do sessions.
        </Text>
        <Button variant="secondary" onPress={() => undefined}
  accessibilityLabel="Back button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          Back
        </Button>
      </Card>
    </View>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  copy: {
    fontSize: 14,
    marginBottom: 16,
  },
});
