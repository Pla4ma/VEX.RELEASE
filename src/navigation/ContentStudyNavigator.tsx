import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { ContentStudyStackParamList } from '../features/content-study/types';
import { ContentInputScreen } from '../features/content-study/screens/ContentInputScreen';
import { ContentReviewScreen } from '../features/content-study/screens/ContentReviewScreen';
import { StudyPlanScreen } from '../features/content-study/screens/StudyPlanScreen';
import { StudyLibraryScreen } from '../features/content-study/screens/StudyLibraryScreen';

const Stack = createNativeStackNavigator<ContentStudyStackParamList>();

export function ContentStudyNavigator(): React.ReactNode {
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
