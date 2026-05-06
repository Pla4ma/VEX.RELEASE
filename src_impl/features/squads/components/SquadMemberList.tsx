/**
 * Squad Member List
 *
 * Display list of squad members.
 *
 * @phase 4 - Deepening: UI component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { createSheet } from '@/shared/ui/create-sheet';

interface SquadMember {
  userId: string;
  name: string;
  role: 'FOUNDER' | 'LEADER' | 'ELITE' | 'MEMBER';
  joinedAt: number;
  lastActive: number;
}

interface SquadMemberListProps {
  members: SquadMember[];
}

export function SquadMemberList({ members }: SquadMemberListProps): JSX.Element {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'FOUNDER':
        return '#FFD700';
      case 'LEADER':
        return '#C0C0C0';
      case 'ELITE':
        return '#CD7F32';
      default:
        return '#9E9E9E';
    }
  };

  const renderMember: ListRenderItem<SquadMember> = ({ item }) => (
    <View style={styles.memberRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>👤</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={[styles.role, { color: getRoleColor(item.role) }]}>
          {item.role}
        </Text>
      </View>
    </View>
  );

  return (
    <FlashList
      data={members}
      renderItem={renderMember}
      keyExtractor={(item: SquadMember) => item.userId}
      contentContainerStyle={styles.container}
      estimatedItemSize={64}
    />
  );
}

const styles = createSheet({
  container: {
    padding: 16,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3a3a4e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  role: {
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});

export default SquadMemberList;
