import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Skeleton } from './SkeletonBase';
import { styles } from './skeleton-styles';

export const StudyPlanSkeleton: React.ComponentType = () => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      {}
      <View style={styles.header}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.headerText}>
          <Skeleton width={180} height={20} borderRadius={4} />
          <Skeleton
            width={120}
            height={14}
            borderRadius={4}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>

      {}
      <View style={styles.statsRow}>
        <Skeleton width={80} height={32} borderRadius={8} />
        <Skeleton width={80} height={32} borderRadius={8} />
        <Skeleton width={80} height={32} borderRadius={8} />
      </View>

      {}
      <Skeleton
        width={100}
        height={18}
        borderRadius={4}
        style={{ marginTop: 24 }}
      />
      <View style={styles.taskList}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.taskItem}>
            <Skeleton width={24} height={24} borderRadius={12} />
            <View style={styles.taskText}>
              <Skeleton
                width={`${85 - i * 10}%`}
                height={16}
                borderRadius={4}
              />
              <Skeleton
                width={60}
                height={12}
                borderRadius={4}
                style={{ marginTop: 6 }}
              />
            </View>
          </View>
        ))}
      </View>

      {}
      <Skeleton
        width={100}
        height={18}
        borderRadius={4}
        style={{ marginTop: 24 }}
      />
      <View style={styles.quizList}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.quizItem}>
            <Skeleton width="100%" height={16} borderRadius={4} />
            <View style={styles.options}>
              <Skeleton
                width="100%"
                height={40}
                borderRadius={8}
                style={{ marginTop: 8 }}
              />
              <Skeleton
                width="100%"
                height={40}
                borderRadius={8}
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export const ContentHistorySkeleton: React.ComponentType = () => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.list,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.listItem,
            { backgroundColor: theme.colors.background.secondary },
          ]}
        >
          <View style={styles.itemIcon}>
            <Skeleton width={40} height={40} borderRadius={20} />
          </View>
          <View style={styles.itemContent}>
            <Skeleton width={`${70 - i * 5}%`} height={16} borderRadius={4} />
            <Skeleton
              width={100}
              height={12}
              borderRadius={4}
              style={{ marginTop: 8 }}
            />
          </View>
          <Skeleton width={60} height={24} borderRadius={12} />
        </View>
      ))}
    </View>
  );
};

export const ExtractionSkeleton: React.ComponentType = () => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.extractionCard,
        { backgroundColor: theme.colors.background.secondary },
      ]}
    >
      <View style={styles.extractionHeader}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.extractionText}>
          <Skeleton width={140} height={20} borderRadius={4} />
          <Skeleton
            width={100}
            height={14}
            borderRadius={4}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>

      <Skeleton
        width="100%"
        height={8}
        borderRadius={4}
        style={{ marginTop: 20 }}
      />

      <View style={styles.stages}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.stage}>
            <Skeleton width={12} height={12} borderRadius={6} />
            <Skeleton
              width={50}
              height={10}
              borderRadius={4}
              style={{ marginTop: 6 }}
            />
          </View>
        ))}
      </View>
    </View>
  );
};
