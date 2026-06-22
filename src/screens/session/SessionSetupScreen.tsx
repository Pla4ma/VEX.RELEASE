import React, { useState } from 'react';
import {
  useNavigation,
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '../../components/primitives/Box';
import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';

import { SESSION_SETUP_SOURCE_ONBOARDING } from '../../features/session-start/schemas';
import type { SessionDifficulty } from '../../features/session-start/components/DifficultySelector';
import { useSessionStartController } from '../../features/session-start/hooks';
import type {
  ExtendedRootStackParams,
  SessionStackParams,
} from '../../navigation/types';
import { FirstSessionView } from './components/SessionSetupFirstSessionView';
import { ReturningUserView } from './components/SessionSetupReturningUserView';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { Text as VexText } from '../../components/primitives/Text';

type SessionNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SessionStackParams>,
  NativeStackNavigationProp<ExtendedRootStackParams>
>;
type SessionSetupRouteProp = RouteProp<SessionStackParams, 'SessionSetup'>;

function SessionSetupScreenContent(): React.JSX.Element {
    const navigation = useNavigation<SessionNavigationProp>();
    const route = useRoute<SessionSetupRouteProp>();

    const [contractText, setContractText] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] =
      useState<SessionDifficulty>('FOCUSED');

    const controller = useSessionStartController({
      navigation,
      routeParams: route.params,
      focusContractText: contractText.trim().length >= 3 ? contractText : null,
    });

    const isFirstSessionSetup =
      route.params?.source === SESSION_SETUP_SOURCE_ONBOARDING;

    if (isFirstSessionSetup) {
      return (
        <FirstSessionView
          navigation={navigation}
          onBack={() => navigation.goBack()}
        />
      );
    }

    if (!controller.userId) {
      return (
        <Box
          flex={1}
          bg="background.primary"
          justifyContent="center"
          alignItems="center"
          p="lg"
        >
          <Text variant="h4" color="error.DEFAULT" mb="md">
            Not authenticated
          </Text>
          <Button variant="primary"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Returns to the previous screen"
          >
            <VexText>Go Back</VexText>
          </Button>
        </Box>
      );
    }

    return (
      <ReturningUserView
        controller={controller}
        contractText={contractText}
        setContractText={setContractText}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        navigation={navigation}
        route={route}
      />
    );
}

export const SessionSetupScreen = withScreenErrorBoundary(
  SessionSetupScreenContent,
  'Session Setup',
);

export { SessionSetupScreen }