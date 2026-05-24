import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { ContentStudyStackParamList } from '../features/content-study/types';
import {
  ContentInputScreen,
  ContentReviewScreen,
  StudyPlanScreen,
  StudyLibraryScreen,
} from '../features/content-study/screens';

const Stack = createNativeStackNavigator<ContentStudyStackParamList>();

export function ContentStudyNavigator(): JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ContentInput" component={ContentInputScreen} />
      <Stack.Screen name="ContentReview" component={ContentReviewScreen} />
      <Stack.Screen name="StudyPlan" component={StudyPlanScreen} />
      <Stack.Screen name="ContentHistory" component={StudyLibraryScreen} />
    </Stack.Navigator>
  );
}

export default ContentStudyNavigator;
