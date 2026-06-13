import React from 'react';
import { View } from 'react-native';

import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { spacing } from '../../../theme/tokens';
import type {
  HomeUnlockPathItem,
  HomeUnlockPathModel,
} from '../services/home-unlock-path-schemas';
import { MilestoneCard } from './MilestoneCard';
import { MilestoneNode, type MilestoneState } from './MilestoneNode';

const ASSET_FOR_INDEX: Array<React.ComponentProps<typeof VexAssetImage>['name']> =
  ['orangeAnalytics', 'orangeHumanCoach', 'progressBars', 'orangeMastery'];

function stateFor(item: HomeUnlockPathItem, isNext: boolean): MilestoneState {
  if (item.isUnlocked) return 'unlocked';
  if (isNext) return 'current';
  return 'locked';
}

interface HomeUnlockMilestonesProps {
  model: HomeUnlockPathModel;
  onStartSession: () => void;
  onPeekLocked?: (item: HomeUnlockPathItem) => void;
}

export function HomeUnlockMilestones({
  model,
  onStartSession,
  onPeekLocked,
}: HomeUnlockMilestonesProps): JSX.Element {
  return (
    <View style={{ gap: spacing[3] }}>
      {model.items.map((item, index) => {
        const isNext = item.eyebrow === model.nextItem.eyebrow;
        const state = stateFor(item, isNext);
        const isLast = index === model.items.length - 1;
        const lineColor =
          state === 'locked' || (!item.isUnlocked && !isNext)
            ? vexLightGlass.glass.borderSubtle
            : vexLightGlass.mint[400];

        return (
          <View
            key={item.eyebrow}
            style={{ flexDirection: 'row', gap: spacing[3] }}
          >
            <View
              style={{
                alignItems: 'center',
                paddingTop: spacing[1],
                width: 44,
              }}
            >
              {index > 0 ? (
                <View
                  style={{
                    backgroundColor: lineColor,
                    height: spacing[2],
                    opacity: 0.55,
                    position: 'absolute',
                    top: -spacing[2],
                    width: 2,
                  }}
                />
              ) : null}
              <MilestoneNode state={state} />
              {!isLast ? (
                <View
                  style={{
                    backgroundColor: lineColor,
                    flex: 1,
                    marginTop: spacing[1],
                    opacity: 0.55,
                    width: 2,
                  }}
                />
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <MilestoneCard
                item={item}
                isNext={isNext}
                onPress={
                  state === 'locked'
                    ? () => onPeekLocked?.(item)
                    : state === 'current'
                      ? onStartSession
                      : undefined
                }
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
