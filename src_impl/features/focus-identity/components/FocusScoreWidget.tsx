
import React from 'react';
import { useFocusScore } from '../hooks-focus-score';
import { Box, Text, Stack, Skeleton } from '../../../components/primitives';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParams } from '../../../navigation/types';

const FocusScoreWidgetSkeleton = () => (
  <Box p="m" bg="surface" borderRadius="m">
    <Stack space="s">
      <Skeleton width={80} height={16} />
      <Skeleton width={60} height={24} />
      <Skeleton width={100} height={14} />
    </Stack>
  </Box>
);

export const FocusScoreWidget = () => {
  const { score, status, error } = useFocusScore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();

  const handlePress = () => {
    navigation.navigate('FocusScoreDashboard');
  };

  if (status === 'pending') {
    return <FocusScoreWidgetSkeleton />;
  }

  if (status === 'error') {
    return (
      <Box><Text>Error: {error?.message}</Text></Box>
    );
  }

  if (!score) {
    return (
      <Box>
        <Text>Start your first session to see your Focus Score.</Text>
      </Box>
    );
  }

  const { currentScore, band, lastChangeReason, previousScore } = score;
  const delta = currentScore - previousScore;

  return (
    <TouchableOpacity onPress={handlePress}>
        <Stack p="m" space="s">
            <Text>Focus Score</Text>
            <Text>{currentScore}</Text>
            <Text>{band}</Text>
            <Text>{delta > 0 ? `+${delta}` : delta}</Text>
            <Text>{lastChangeReason}</Text>
        </Stack>
    </TouchableOpacity>
  );
};
