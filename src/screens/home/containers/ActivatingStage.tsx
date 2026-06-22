import React from 'react';

import { useActivatingHomeData } from '../hooks/useActivatingHomeData';
import { type NewUserContainerInput } from './NewUserHomeContainer';
import { useActivatingContainerModel } from './ActivatingHomeContainer';
import { HomeScreenInner } from './HomeScreenInner';

interface StageProps {
  sharedInput: NewUserContainerInput;
}

export function ActivatingStage({ sharedInput }: StageProps): React.ReactNode {
  const model = useActivatingContainerModel(sharedInput);
  const data = useActivatingHomeData(model.controller);
  return <HomeScreenInner model={model} data={data} />;
}
