import React from 'react';

import { useNewUserHomeData } from '../hooks/useNewUserHomeData';
import {
  useNewUserContainerModel,
  type NewUserContainerInput,
} from './NewUserHomeContainer';
import { HomeScreenInner } from './HomeScreenInner';

interface StageProps {
  sharedInput: NewUserContainerInput;
}

export function NewUserStage({ sharedInput }: StageProps): React.ReactNode {
  const model = useNewUserContainerModel(sharedInput);
  const data = useNewUserHomeData(model.controller);
  return <HomeScreenInner model={model} data={data} />;
}
