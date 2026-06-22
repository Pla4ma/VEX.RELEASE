import React from 'react';

import { useEngagedHomeData } from '../hooks/useEngagedHomeData';
import { type NewUserContainerInput } from './NewUserHomeContainer';
import { useEngagedContainerModel } from './EngagedHomeContainer';
import { HomeScreenInner } from './HomeScreenInner';

interface StageProps {
  sharedInput: NewUserContainerInput;
}

export function EngagedStage({ sharedInput }: StageProps): React.ReactNode {
  const model = useEngagedContainerModel(sharedInput);
  const data = useEngagedHomeData(model.controller);
  return <HomeScreenInner model={model} data={data} />;
}
