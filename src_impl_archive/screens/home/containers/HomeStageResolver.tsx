/**
 * HomeStageResolver
 *
 * Determines user stage and renders the correct stage-specific container.
 * Each container component calls ONLY its own stage model hook and data hook.
 * No other stage hooks are imported, bundled, or executed.
 */
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme';
import { useHomeViewModel } from '../hooks/useHomeViewModel';
import { useNewUserContainerModel, type NewUserContainerInput } from './NewUserHomeContainer';
import { useActivatingContainerModel } from './ActivatingHomeContainer';
import { useEngagedContainerModel } from './EngagedHomeContainer';
import { usePowerUserContainerModel } from './PowerUserHomeContainer';
import { useNewUserHomeData } from '../hooks/useNewUserHomeData';
import { useActivatingHomeData } from '../hooks/useActivatingHomeData';
import { useEngagedHomeData } from '../hooks/useEngagedHomeData';
import { usePowerUserHomeData } from '../hooks/usePowerUserHomeData';
import { HomeScreenInner } from './HomeScreenInner';
import type { HomeViewModel } from '../hooks/home-view-model';
import type { HomeController } from '../hooks/home-controller-types';

interface ContainerResult extends HomeViewModel {
  controller: HomeController;
}

function NewUserContainer({ sharedInput }: { sharedInput: NewUserContainerInput }): JSX.Element {
  const model = useNewUserContainerModel(sharedInput);
  const data = useNewUserHomeData(model.controller);
  return React.createElement(HomeScreenInner, { model, data: data as unknown as import('./HomeScreenInner').HomeDataProps });
}

function ActivatingContainer({ sharedInput }: { sharedInput: NewUserContainerInput }): JSX.Element {
  const model = useActivatingContainerModel(sharedInput);
  const data = useActivatingHomeData(model.controller);
  return React.createElement(HomeScreenInner, { model, data: data as unknown as import('./HomeScreenInner').HomeDataProps });
}

function EngagedContainer({ sharedInput }: { sharedInput: NewUserContainerInput }): JSX.Element {
  const model = useEngagedContainerModel(sharedInput);
  const data = useEngagedHomeData(model.controller);
  return React.createElement(HomeScreenInner, { model, data: data as unknown as import('./HomeScreenInner').HomeDataProps });
}

function PowerUserContainer({ sharedInput }: { sharedInput: NewUserContainerInput }): JSX.Element {
  const model = usePowerUserContainerModel(sharedInput);
  const data = usePowerUserHomeData(model.controller);
  return React.createElement(HomeScreenInner, { model, data: data as unknown as import('./HomeScreenInner').HomeDataProps });
}

export function HomeStageResolver(): JSX.Element {
  const { theme } = useTheme();
  const vm = useHomeViewModel();
  const { sharedInput, stage, isLoading } = vm;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.primary }}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  switch (stage) {
    case 'NEW_USER':
      return <NewUserContainer sharedInput={sharedInput} />;
    case 'ACTIVATING':
      return <ActivatingContainer sharedInput={sharedInput} />;
    case 'ENGAGED':
      return <EngagedContainer sharedInput={sharedInput} />;
    default:
      return <PowerUserContainer sharedInput={sharedInput} />;
  }
}
