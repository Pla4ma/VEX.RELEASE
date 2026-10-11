import React from 'react';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import type { RootStackParams } from '../../../navigation/param-types';

export function StudyPathCta(): JSX.Element {
  const navigation = useNavigation<NavigationProp<RootStackParams>>();

  return (
    <Button
      accessibilityHint="Opens a focused study session"
      accessibilityLabel="Start a study session"
      accessibilityRole="button"
      onPress={() =>
        navigation.navigate('SessionStack', {
          screen: 'SessionSetup',
          params: { presetMode: 'STUDY' },
        })
      }
      size="sm"
      variant="primary"
    >
      <Text>Start a Study Session</Text>
    </Button>
  );
}
