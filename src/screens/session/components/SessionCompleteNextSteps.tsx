import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { SessionCompleteFooter } from './SessionCompleteFooter';
import { SessionReturnReasonCard } from './SessionReturnReasonCard';
import { TomorrowPreviewSession } from '../../../features/home-spine/components/TomorrowPreview';
import { useSessionCompleteController } from '../../../features/session-completion/hooks';
import type { SessionSummary } from '../../../session/types';
import { TomorrowPreviewData } from '../../../features/home-spine/tomorrowPreviewService';

type SessionCompleteController = ReturnType<typeof useSessionCompleteController>;
type TomorrowPreview = TomorrowPreviewData;

interface SessionCompleteNextStepsProps {
  controller: SessionCompleteController;
  summary: SessionSummary;
  sessionId: string;
  tomorrowPreview: TomorrowPreview | null;
  bottomInset: number;
  onShare?: () => void;
  onOpenReflection: () => void;
}

export function SessionCompleteNextSteps({
  controller,
  summary,
  sessionId,
  tomorrowPreview,
  bottomInset,
  onShare,
  onOpenReflection,
}: SessionCompleteNextStepsProps): JSX.Element {
  return (
    <>
      {tomorrowPreview && (
        <Box px={6} mt={8}>
          <TomorrowPreviewSession
            preview={tomorrowPreview}
            onPress={() => {
              controller.navigation.navigate({ name: 'Home', params: {} });
            }}
          />
        </Box>
      )}

      {controller.rewards.showCtas && (
        <Box px={6} mt={6}>
          <Button
            variant="secondary"
            onPress={() =>
              controller.navigation.navigate('PostSessionStory', { sessionId, summary })
            }
            accessibilityLabel="View your session story"
            accessibilityRole="button"
          >
            View Session Story
          </Button>
        </Box>
      )}

      {controller.rewards.showCtas ? (
        <Box px={6} mt={8}>
          <SessionReturnReasonCard
            body={controller.returnPlan.returnReasonBody}
            theme={controller.theme}
            title={controller.returnPlan.returnReasonTitle}
          />
        </Box>
      ) : null}

      <SessionCompleteFooter
        bottomInset={bottomInset}
        homeCtaLabel={controller.returnPlan.homeCtaLabel}
        nextSessionLabel={controller.nextAction?.ctaLabel ?? controller.returnPlan.nextSessionLabel}
        onOpenReflection={onOpenReflection}
        onStartNextSession={() =>
          controller.navigation.navigate({
            name: 'SessionSetup',
            params: controller.nextAction?.routeParams ?? {},
          })
        }
        onShare={onShare}
        showCtas={controller.rewards.showCtas}
        theme={controller.theme}
      />
    </>
  );
}
