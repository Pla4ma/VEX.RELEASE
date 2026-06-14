import React from 'react';
import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useHomeViewModel } from '../../screens/home/hooks/useHomeViewModel';
import { FloatingActionButton } from '../fab/components/FloatingActionButton';
import { useCaptureForm } from '../capture/hooks';
import type { Lane } from '../lane-engine/types';
import { useBehaviorLane } from '../lane-engine/hooks';
import { StudentHomeSurface } from './StudentHomeSurface';
import { GameLikeHomeSurface } from './GameLikeHomeSurface';
import { CreativeHomeSurface } from './CreativeHomeSurface';
import { MinimalHomeSurface } from './MinimalHomeSurface';
import { buildLaneViewModel } from './service';
import type { LaneViewModel } from './service';

const CAPTURE_ACTIONS = [
  { id: 'braindump', label: 'Brain Dump', icon: 'message-circle', color: '#12BFA0', priority: 1 },
  { id: 'voice', label: 'Voice Note', icon: 'mic', color: '#3B82F6', priority: 2 },
  { id: 'photo', label: 'Photo', icon: 'camera', color: '#F97316', priority: 3 },
  { id: 'link', label: 'Link', icon: 'link', color: '#8B5CF6', priority: 4 },
];

export function LaneHomeContainer(): React.JSX.Element {
  const laneProfile = useBehaviorLane({
    completedSessions: 0,
    studyUsageRatio: 0,
    deepCreativeUsageRatio: 0,
    bossEngagement: 'none',
    bossDismissals: 0,
    challengeClicks: 0,
    notificationDismissals: 0,
  });
  const lane = laneProfile.primaryLane as Lane | null;
  const homeModel = useHomeViewModel();
  const vmLoading = homeModel.isLoading;
  const { setType, setContent } = useCaptureForm();
  const viewModel = buildLaneViewModel(homeModel);

  if (vmLoading) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <Text variant="body" color="text.secondary">
          Loading your space...
        </Text>
      </Box>
    );
  }

  const laneSurface = renderLaneSurface(lane, viewModel);

  return (
    <Box flex={1}>
      <Box flex={1} p="md" gap="md">
        {laneSurface}
      </Box>

      <FloatingActionButton
        actions={CAPTURE_ACTIONS}
        onActionPress={(actionId) => {
          setType(actionId as 'braindump' | 'voice' | 'photo' | 'link');
          setContent('');
        }}
      />
    </Box>
  );
}

function renderLaneSurface(
  lane: Lane | null,
  viewModel: LaneViewModel,
): React.JSX.Element {
  switch (lane) {
    case 'student':
      return <StudentHomeSurface viewModel={viewModel} />;
    case 'game_like':
      return <GameLikeHomeSurface viewModel={viewModel} />;
    case 'deep_creative':
      return <CreativeHomeSurface viewModel={viewModel} />;
    case 'minimal_normal':
      return <MinimalHomeSurface viewModel={viewModel} />;
    default:
      return <MinimalHomeSurface viewModel={viewModel} />;
  }
}
