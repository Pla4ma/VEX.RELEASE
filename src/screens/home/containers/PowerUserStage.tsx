import React from 'react';

import { usePowerUserHomeData } from '../hooks/usePowerUserHomeData';
import { type NewUserContainerInput } from './NewUserHomeContainer';
import { usePowerUserContainerModel } from './PowerUserHomeContainer';
import { HomeScreenInner } from './HomeScreenInner';

interface StageProps {
  sharedInput: NewUserContainerInput;
}

export function PowerUserStage({ sharedInput }: StageProps): React.ReactNode {
  const model = usePowerUserContainerModel(sharedInput);
  const data = usePowerUserHomeData(model.controller);
  return <HomeScreenInner model={model} data={data} />;
}

export default PowerUserStage;
