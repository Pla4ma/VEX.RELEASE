
import React from 'react';
import { useFocusScore } from '../hooks-focus-score';
import { Box, Text, Stack } from '../../../components/primitives';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// TODO: Create a skeleton component
const FocusScoreWidgetSkeleton = () => <Text>Loading...</Text>;

export const FocusScoreWidget = () => {
  const { score, status, error } = useFocusScore();
  const navigation = useNavigation();

  const handlePress = () => {
    // @ts-ignore - navigation types are not set up
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
