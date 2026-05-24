import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { SessionCompleteFooter } from './SessionCompleteFooter';
import { SessionReturnReasonCard } from './SessionReturnReasonCard';
import { TomorrowPreviewSession } from '../../../features/home-spine/components/TomorrowPreview';
import { useSessionCompleteController } from '../../../features/session-completion/hooks';
import { TomorrowPreviewData } from '../../../features/home-spine/tomorrowPreviewService';

type SessionCompleteController = ReturnType<typeof useSessionCompleteController>;
type TomorrowPreview = TomorrowPreviewData;

interface SessionCompleteNextStepsProps {
  controller: SessionCompleteController;
  tomorrowPreview: TomorrowPreview | null;
  bottomInset: number;
  onShare?: () => void;
  onOpenReflection: () => void;
}

export function SessionCompleteNextSteps({
  controller,
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
