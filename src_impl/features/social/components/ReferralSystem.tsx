import React, { useCallback } from 'react';
import { Pressable, Share, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { buildSquadInviteLink, buildSquadInviteMessage } from '../referral-links';

export interface ReferralData {
  code: string;
  joinedCount: number;
  activeCount: number;
  gemsEarned: number;
  nextMilestone: number;
  inProgressCount: number;
  recentReferrals?: Array<{
    name: string;
    avatar?: string;
    status: 'joined' | 'active' | 'completed';
    joinedAt: number;
  }>;
}

interface ReferralSystemProps {
  data: ReferralData;
  appUrlScheme?: string;
  squadName?: string;
  inviterName?: string;
  onCopyCode?: (code: string) => void;
  onShare?: () => void;
  onViewAll?: () => void;
}

export function ReferralSystem({
  data,
  appUrlScheme = 'vex://',
  squadName,
  inviterName,
  onCopyCode,
  onShare,
  onViewAll,
}: ReferralSystemProps): JSX.Element {
  const { theme } = useTheme();
  const inviteLink = buildSquadInviteLink(appUrlScheme, data.code, squadName);

  const handleShare = useCallback(async (): Promise<void> => {
    const result = await Share.share({
      message: buildSquadInviteMessage({ code: data.code, link: inviteLink, squadName, inviterName }),
      url: inviteLink,
    });
    if (result.action === Share.sharedAction) {onShare?.();}
  }, [data.code, inviteLink, inviterName, onShare, squadName]);

  return (
    <Animated.View entering={FadeInUp.duration(400)}>
      <View style={{ gap: theme.spacing[4], padding: theme.spacing[4] }}>
        <View style={{ alignItems: 'center', gap: theme.spacing[2] }}>
          <Text variant="h2" color={theme.colors.text.primary} textAlign="center">
            Recruit Your Squad
          </Text>
          <Text variant="body" color={theme.colors.text.secondary} textAlign="center">
            Invite links now carry squad context, instant join, and first-session rewards.
          </Text>
        </View>

        <View style={{ padding: theme.spacing[4], gap: theme.spacing[3], backgroundColor: theme.colors.background.secondary, ...getPremiumCardStyle('large') }}>
          <Text variant="label" color={theme.colors.primary[500]}>
            Squad Invite Link
          </Text>
          <Text variant="h3" color={theme.colors.text.primary} fontWeight="800">
            {data.code}
          </Text>
          <Text variant="bodySmall" color={theme.colors.text.secondary}>
            {squadName ? `Accepting opens ${squadName} and joins immediately.` : 'Accepting opens the invited squad and joins immediately.'}
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing[3], flexWrap: 'wrap' }}>
            <Button
              accessibilityLabel="Share squad invite"
              accessibilityRole="button"
              accessibilityHint="Opens the native share sheet with the squad invite link"
              onPress={handleShare}
            >
              Share Invite
            </Button>
            <Button
              variant="outline"
              accessibilityLabel="Copy referral code"
              accessibilityRole="button"
              accessibilityHint="Copies or records the referral code for sharing"
              onPress={() => onCopyCode?.(data.code)}
            >
              Copy Code
            </Button>
          </View>
        </View>

        <ReferralStats data={data} />
        <ReferralRewards />

        <Pressable
          accessibilityLabel="View all referrals"
          accessibilityRole="button"
          accessibilityHint="Opens the complete referral history"
          onPress={onViewAll}
          style={{ minHeight: theme.spacing[8], alignItems: 'center', justifyContent: 'center' }}
        >
          <Text variant="bodySmall" color={theme.colors.primary[500]} fontWeight="700">
            View All Referrals
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function ReferralStats({ data }: { data: ReferralData }): JSX.Element {
  const { theme } = useTheme();
  const stats = [
    { label: 'Joined', value: data.joinedCount },
    { label: 'Active', value: data.activeCount },
    { label: 'In progress', value: data.inProgressCount },
  ];
  return (
    <View style={{ flexDirection: 'row', gap: theme.spacing[3] }}>
      {stats.map((stat) => (
        <View key={stat.label} style={{ flex: 1, padding: theme.spacing[3], alignItems: 'center', backgroundColor: theme.colors.background.secondary, ...getPremiumCardStyle('medium') }}>
          <Text variant="h3" color={theme.colors.primary[500]} fontWeight="800">{stat.value}</Text>
          <Text variant="caption" color={theme.colors.text.secondary}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

function ReferralRewards(): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ padding: theme.spacing[4], gap: theme.spacing[2], backgroundColor: theme.colors.background.secondary, ...getPremiumCardStyle('medium') }}>
      <Text variant="label" color={theme.colors.primary[500]}>Reward Hook</Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>Inviter: 100 coins after the invitee completes their first session.</Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>Invitee: 50 coins and 2x XP on the first accepted invite session.</Text>
    </View>
  );
}

export function ReferralBanner({
  code,
  gemsEarned,
  onPress,
}: {
  code: string;
  gemsEarned: number;
  onPress?: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityLabel="Open referral rewards"
      accessibilityRole="button"
      accessibilityHint="Shows invite progress and sharing options"
      onPress={onPress}
      style={{ padding: theme.spacing[3], backgroundColor: theme.colors.background.secondary, ...getPremiumCardStyle('medium') }}
    >
      <Text variant="bodySmall" color={theme.colors.text.primary} fontWeight="700">
        {`Code ${code} - ${gemsEarned} gems earned`}
      </Text>
    </Pressable>
  );
}

export default ReferralSystem;
