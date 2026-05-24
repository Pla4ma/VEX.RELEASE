import React from 'react';
import { View, Text } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import type { MainStackParams } from '../../../navigation/types';
import { useAuthStore } from '../../../store';
import { useThemeObject } from '../../../theme';
import { Button, Card } from '../../../components';
import { createSheet } from '@/shared/ui/create-sheet';
import { SquadHub } from './SquadHub';

type SquadRoute = RouteProp<MainStackParams, 'Guild'>;

export function SquadRouteHub(): JSX.Element {
  const theme = useThemeObject();
  const route = useRoute<SquadRoute>();
  const userId = useAuthStore((state) => state.user?.id);
  const squadId = route.params?.guildId;

  if (!squadId || !userId) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <Card style={styles.card}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>No squad selected</Text>
          <Text style={[styles.copy, { color: theme.colors.text.secondary }]}>
            Open a squad from the Social tab to manage members and shared focus.
          </Text>
          <Button variant="secondary" onPress={() => undefined}
  accessibilityLabel="Back to Social button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            Back to Social
          </Button>
        </Card>
      </View>
    );
  }

  return <SquadHub squadId={squadId} userId={userId} />;
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
