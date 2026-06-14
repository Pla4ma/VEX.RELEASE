import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { useUpdatePlanItemStatus } from '../../features/plan/hooks';

interface PlanScreenActions {
  openAddItemSheet: () => void;
  completeItem: (itemId: string) => void;
  startSessionFromItem: (itemId: string, title: string) => void;
  openAddProjectSheet: () => void;
  openAddStudyPlanSheet: () => void;
  selectProject: (projectId: string) => void;
  selectStudyPlan: (studyPlanId: string) => void;
}

export function usePlanScreenActions(): PlanScreenActions {
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const updateStatus = useUpdatePlanItemStatus();

  const openAddItemSheet = useCallback(() => {
    navigation.navigate('SessionStack', {
      screen: 'SessionSetup',
      params: { source: 'plan' },
    });
  }, [navigation]);

  const completeItem = useCallback(
    (itemId: string) => {
      updateStatus.mutate({ itemId, status: 'done' });
    },
    [updateStatus],
  );

  const startSessionFromItem = useCallback(
    (itemId: string, title: string) => {
      navigation.navigate('SessionStack', {
        screen: 'SessionSetup',
        params: { goal: title, source: 'plan' },
      });
    },
    [navigation],
  );

  const openAddProjectSheet = useCallback(() => {
    navigation.navigate('SessionStack', {
      screen: 'SessionSetup',
      params: { goal: 'Move one project forward', source: 'plan' },
    });
  }, [navigation]);

  const openAddStudyPlanSheet = useCallback(() => {
    navigation.navigate('ContentStudy');
  }, [navigation]);

  const selectProject = useCallback(
    (projectId: string) => {
      navigation.navigate('SessionStack', {
        screen: 'SessionSetup',
        params: { goal: 'Project work block', source: 'plan' },
      });
    },
    [navigation],
  );

  const selectStudyPlan = useCallback(
    (studyPlanId: string) => {
      navigation.navigate('SessionStack', {
        screen: 'SessionSetup',
        params: { goal: 'Study plan block', source: 'plan', studyPlanId },
      });
    },
    [navigation],
  );

  return {
    openAddItemSheet,
    completeItem,
    startSessionFromItem,
    openAddProjectSheet,
    openAddStudyPlanSheet,
    selectProject,
    selectStudyPlan,
  };
}
