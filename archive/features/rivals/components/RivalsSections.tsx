import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useTheme } from '../../../theme';
import {
  useAcceptRivalChallenge,
  useDeclineRivalChallenge,
  useSendRivalChallenge,
  type RivalChallenge,
  type RivalsHookResult,
} from '../hooks';
import type { CurrentRival, RivalMatchResult } from '../schemas';
import { RivalCard } from './RivalCard';
import { RivalChallengeCard } from './RivalChallengeCard';
import { SuggestedRivalCard } from './SuggestedRivalCard';

export function MyRivalsSection({
  rivalsResult,
}: {
  rivalsResult: RivalsHookResult<CurrentRival[]>;
}): JSX.Element {
  if (rivalsResult.isLoading) {
    return <SectionState title="My Rivals" skeletonHeight={180} />;
  }

  if (rivalsResult.isError) {
    return <SectionError title="My Rivals" errorTitle="Failed to load your rivals" onRetry={rivalsResult.refetch} />;
  }

  if (rivalsResult.isEmpty || !rivalsResult.data) {
    return (
      <SectionEmpty
        title="My Rivals"
        icon="VS"
        emptyTitle="No Active Rival"
        body="Find a rival to compete weekly with someone at your level."
      />
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(400)}>
      <SectionTitle>My Rivals</SectionTitle>
      {rivalsResult.data.map((rival) => (
        <RivalCard key={rival.relationshipId} rival={rival} />
      ))}
    </Animated.View>
  );
}

export function ActiveChallengesSection({
  challengesResult,
  userId,
}: {
  challengesResult: RivalsHookResult<RivalChallenge[]>;
  userId: string;
}): JSX.Element {
  const acceptMutation = useAcceptRivalChallenge();
  const declineMutation = useDeclineRivalChallenge();

  if (challengesResult.isLoading) {
    return <SectionState title="Active Challenges" skeletonHeight={120} />;
  }

  if (challengesResult.isError) {
    return <SectionError title="Active Challenges" errorTitle="Failed to load challenges" onRetry={challengesResult.refetch} />;
  }

  if (challengesResult.isEmpty || !challengesResult.data) {
    return (
      <SectionEmpty
        title="Active Challenges"
        icon="24h"
        emptyTitle="No Active Challenges"
        body="Challenge a rival to a focused 24-hour duel."
      />
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(100)}>
      <SectionTitle>Active Challenges</SectionTitle>
      {challengesResult.data.map((challenge) => (
        <RivalChallengeCard
          key={challenge.id}
          challenge={challenge}
          currentUserId={userId}
          isLoading={acceptMutation.isPending || declineMutation.isPending}
          onAccept={() => acceptMutation.mutate({ challengeId: challenge.id, userId })}
          onDecline={() => declineMutation.mutate({ challengeId: challenge.id, userId })}
        />
      ))}
    </Animated.View>
  );
}

export function SuggestedRivalsSection({
  suggestionsResult,
  userId,
}: {
  suggestionsResult: RivalsHookResult<RivalMatchResult[]>;
  userId: string;
}): JSX.Element {
  const sendChallengeMutation = useSendRivalChallenge();

  if (suggestionsResult.isLoading) {
    return <SectionState title="Suggested Rivals" skeletonHeight={200} />;
  }

  if (suggestionsResult.isError) {
    return <SectionError title="Suggested Rivals" errorTitle="Failed to load suggestions" onRetry={suggestionsResult.refetch} />;
  }

  if (suggestionsResult.isEmpty || !suggestionsResult.data) {
    return (
      <SectionEmpty
        title="Suggested Rivals"
        icon="?"
        emptyTitle="No Suggestions Yet"
        body="VEX is looking for players near your level. Check back soon."
      />
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(200)}>
      <SectionTitle>Suggested Rivals</SectionTitle>
      {suggestionsResult.data.map((rival) => (
        <SuggestedRivalCard
          key={rival.userId}
          rival={rival}
          isLoading={sendChallengeMutation.isPending}
          onAddAsRival={() =>
            sendChallengeMutation.mutate({
              challengerId: userId,
              challengedId: rival.userId,
              type: 'FOCUS_TIME_24H',
            })
          }
        />
      ))}
    </Animated.View>
  );
}

function SectionTitle({ children }: { children: string }): JSX.Element {
  const { theme } = useTheme();
  return (
    <Text variant="h4" color={theme.colors.text.primary} style={{ marginBottom: theme.spacing[3] }}>
      {children}
    </Text>
  );
}

function SectionState({
  title,
  skeletonHeight,
}: {
  title: string;
  skeletonHeight: number;
}): JSX.Element {
  return (
    <Animated.View>
      <SectionTitle>{title}</SectionTitle>
      <Skeleton height={skeletonHeight} variant="rounded" />
    </Animated.View>
  );
}

function SectionError({
  title,
  errorTitle,
  onRetry,
}: {
  title: string;
  errorTitle: string;
  onRetry: () => void;
}): JSX.Element {
  return (
    <Animated.View>
      <SectionTitle>{title}</SectionTitle>
      <ErrorState title={errorTitle} description="VEX could not refresh this rivalry data." onRetry={onRetry} />
    </Animated.View>
  );
}

function SectionEmpty({
  title,
  icon,
  emptyTitle,
  body,
}: {
  title: string;
  icon: string;
  emptyTitle: string;
  body: string;
}): JSX.Element {
  return (
    <Animated.View>
      <SectionTitle>{title}</SectionTitle>
      <EmptyState icon={icon} title={emptyTitle} body={body} />
    </Animated.View>
  );
}
