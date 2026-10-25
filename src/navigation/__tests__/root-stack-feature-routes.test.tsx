jest.mock('../../features/ai-coach/components/CoachScreen', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../screens/companion/CompanionDetailScreen', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../screens/notifications/NotificationsScreen', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../screens/challenges/ChallengesScreen', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../screens/profile/MasteryScreen', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../screens/profile/MemoryConsoleScreen', () => ({
  __esModule: true,
  default: () => null,
}));
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { buildFeatureAccess } from '../../features/liveops-config/feature-access';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access-types';
import type { ExtendedRootStackParams } from '../types';
import { renderRootStackFeatureRoutes } from '../root-stack-feature-routes';

describe('root stack feature route registration', () => {
  it('does not register Study when FeatureAvailability denies route access', () => {
    const features = buildFeatureAccess({ totalCompletedSessions: 0 }).features;
    const unavailableFeatures: FeatureAccessMap = {
      ...features,
      content_study: {
        ...features.content_study,
        isVisible: false,
        isUnlocked: false,
        isTeased: false,
        releaseState: 'archived',
      },
    };
    const Stack = createNativeStackNavigator<ExtendedRootStackParams>();
    const routes = renderRootStackFeatureRoutes({
      features: unavailableFeatures,
      Stack,
    });
    const routeNames = React.Children.toArray(routes.props.children).flatMap(
      (element) =>
        React.isValidElement<{ name?: string }>(element) &&
        typeof element.props.name === 'string'
          ? [element.props.name]
          : [],
    );

    expect(routeNames).not.toContain('ContentStudy');
  });
});
