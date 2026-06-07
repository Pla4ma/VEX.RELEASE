import React from 'react';
import { View, ScrollView } from 'react-native';
import { useThemeObject } from '../../../theme';
import { Card } from '../../../components';
import { SkeletonItem } from '../../../shared/ui/components/SkeletonItem';
import { styles } from './challenge-hub-styles';

export const ChallengeHubSkeleton: React.FC = () => {
  const theme = useThemeObject();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.statsCard}>
        <SkeletonItem variant="title" width="50%" style={{ marginBottom: 12 }} />
        <View style={styles.statsGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.statItem}>
              <SkeletonItem variant="text" width={32} height={24} />
              <SkeletonItem variant="text" width={48} height={12} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
        <SkeletonItem variant="text" height={8} style={{ borderRadius: 4, marginTop: 8 }} />
      </Card>

      <View style={styles.filterContainer}>
        <View style={[styles.filterContent, { flexDirection: 'row' }]}>
          {['ALL', 'DAILY', 'WEEKLY', 'SPECIAL'].map((filter) => (
            <SkeletonItem
              key={filter}
              variant="button"
              width={80}
              height={36}
              style={{ borderRadius: 20 }}
            />
          ))}
        </View>
      </View>

      {[0, 1, 2].map((i) => (
        <Card key={i} style={{ padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <SkeletonItem variant="button" width={60} height={24} style={{ borderRadius: 12 }} />
            <SkeletonItem variant="button" width={60} height={24} style={{ borderRadius: 12 }} />
            <SkeletonItem variant="button" width={60} height={24} style={{ borderRadius: 12 }} />
          </View>
          <SkeletonItem variant="title" width="80%" style={{ marginBottom: 8 }} />
          <SkeletonItem variant="text" style={{ marginBottom: 4 }} />
          <SkeletonItem variant="text" width="60%" style={{ marginBottom: 16 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <SkeletonItem variant="text" width={80} height={14} />
            <SkeletonItem variant="text" width={40} height={14} />
          </View>
          <SkeletonItem variant="text" height={8} style={{ borderRadius: 4, marginBottom: 12 }} />
          <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border.light, paddingTop: 12 }}>
            <SkeletonItem variant="text" width="50%" height={14} />
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border.light, paddingTop: 12, marginTop: 12 }}>
            <SkeletonItem variant="button" width={140} height={44} />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};
