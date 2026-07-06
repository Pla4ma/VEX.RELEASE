import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Skeleton } from '../../../components/ui/Skeleton';
import { lightColors } from '@/theme/tokens/colors';
import { styles } from './StudyPlanScreen.styles';

export function OfflineBanner(): React.ReactElement {
  return (
    <View
      style={{
        backgroundColor: lightColors.warning.light,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '500',
          color: lightColors.warning[500],
        }}
      >
        You are offline. Study plan generation requires a connection.
      </Text>
    </View>
  );
}

export function StudyPlanLoading(): React.ReactElement {
  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <View style={styles.loadingContainer}>
        <Skeleton width={60} height={20} variant="rounded" />
        <Text style={styles.loadingText}>Loading study plan...</Text>
      </View>
    </SafeAreaView>
  );
}
