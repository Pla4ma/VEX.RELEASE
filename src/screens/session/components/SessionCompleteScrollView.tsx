import React from 'react';
import { ScrollView } from 'react-native';

import type { ReflectionStatus } from '../../../features/focus-contract/types';
import { ModeCompletionSurface } from '../../../features/mode-native/components/ModeCompletionSurface';
import type { CompletionSurface } from '../../../features/session-completion/completion-experience-policy';

import { SessionCompleteHeroSection } from './SessionCompleteHeroSection';
import { SessionCompleteRewardsPhase } from './SessionCompleteRewardsPhase';
import { SessionCompleteNextSteps } from './SessionCompleteNextSteps';
import { SessionContractReflectionCard } from './SessionContractReflectionCard';

import type { SessionCompleteContentProps } from './SessionCompleteContent.types';
import type { useSessionCompleteController } from '../../../features/session-completion/hooks';
import type { useTomorrowPreviewForSession } from '../../../features/home-spine/hooks';
import type { useContractForSession } from '../../../features/focus-contract/hooks';
import type { resolveCompletionExperiencePolicy } from '../../../features/session-completion/completion-experience-policy';
import type { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SessionCompleteScrollViewProps {
  controller: ReturnType<typeof useSessionCompleteController>;
  sessionId: string;
  summary: SessionCompleteContentProps['summary'];
  consequences: SessionCompleteContentProps['consequences'];
  policy: ReturnType<typeof resolveCompletionExperiencePolicy>;
  contract: ReturnType<typeof useContractForSession>['contract'];
  isContractPending: boolean;
  lane: string;
  tomorrowPreview: ReturnType<typeof useTomorrowPreviewForSession>;
  insets: ReturnType<typeof useSafeAreaInsets>;
  onReflectContract: (status: ReflectionStatus) => void;
  onOpenReflection: () => void;
}

export function SessionCompleteScrollView({
  controller,
  sessionId,
  summary,
  consequences,
  policy,
  contract,
  isContractPending,
  lane,
  tomorrowPreview,
  insets,
  onReflectContract,
  onOpenReflection,
}: SessionCompleteScrollViewProps): JSX.Element {
  const isHidden = (surface: CompletionSurface): boolean =>
    policy.hiddenCompletionSurfaces.includes(surface);

  return (
    <ScrollView
      ref={controller.scrollRef}
      contentContainerStyle={{
        paddingBottom:
          controller.theme.spacing[20] + controller.theme.spacing[12],
        paddingTop: insets.top + controller.theme.spacing[5],
      }}
      showsVerticalScrollIndicator={false}
    >
      <SessionCompleteHeroSection
        controller={controller}
        summary={summary}
      />

      {!isHidden('contract_reflection_card') ? (
        <SessionContractReflectionCard
          contract={contract}
          isPending={isContractPending}
          onReflect={onReflectContract}
        />
      ) : null}

      <ModeCompletionSurface
        lane={lane as 'game_like' | 'student' | 'deep_creative' | 'minimal_normal'}
        topic={contract?.taskDescription}
        task={contract?.taskDescription}
        project={contract?.taskDescription}
        action={contract?.taskDescription}
        onPrimaryAction={() => {
          controller.navigation.navigate({ name: 'Home', params: {} });
        }}
      />

      <SessionCompleteRewardsPhase
        controller={controller}
        summary={summary}
        sessionId={sessionId}
        policy={policy}
        consequences={consequences}
      />

      <SessionCompleteNextSteps
        controller={controller}
        tomorrowPreview={tomorrowPreview}
        bottomInset={Math.max(insets.bottom, controller.theme.spacing[4])}
        onShare={undefined}
        onOpenReflection={onOpenReflection}
      />
    </ScrollView>
  );
}
