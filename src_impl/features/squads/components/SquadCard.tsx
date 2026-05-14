/**
 * Squad Card
 *
 * Display squad information in card format.
 *
 * @phase 4 - Deepening: UI component
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';

interface SquadCardProps {
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  synergyLevel: number;
  onPress?: () => void;
}

export function SquadCard({
  name,
  description,
  memberCount,
  maxMembers,
  synergyLevel,
  onPress,
}: SquadCardProps): JSX.Element {
  return (
    <Pressable style={({ pressed }) => [styles.container, pressed && { opacity: 0.8 }]} onPress={onPress}
      accessibilityLabel="Interactive control"
      accessibilityRole="button"
      accessibilityHint="Activates this control">
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👥</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{memberCount}/{maxMembers}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>Lv.{synergyLevel}</Text>
          <Text style={styles.statLabel}>Synergy</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = createSheet({
  container: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3a3a4e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default SquadCard;
