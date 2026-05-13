import React from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { Icon } from '../../../icons';
import { useHaptics } from '../../../utils/haptics';
import { useFocusIdentity } from '../../../features/focus-identity/hooks';
import type { HomeRecommendation } from '../services/HomeRecommendationEngine';
import { getHeroGradientColors, getHeroIcon, getHeroUrgencyColor } from './home-hero-card-helpers';
import { HomeHeroSecondaryActions } from './HomeHeroSecondaryActions';
interface HomeHeroCardProps {
  recommendation: HomeRecommendation | null;
  isLoading: boolean;
  onPressCta: (rec: HomeRecommendation) => void;
  onPressSecondary?: () => void;
  userId?: string | null;
}
export function HomeHeroCard({ recommendation, isLoading, onPressCta, onPressSecondary, userId }: HomeHeroCardProps): JSX.Element {
  const { theme } = useTheme();
  const haptics = useHaptics();
  const { profile, currentBand } = useFocusIdentity(userId ?? '');
  const containerStyle = {
      marginHorizontal: theme.spacing[4],
      marginTop: theme.spacing[4],
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden' as const,
      shadowColor: 'theme.colors.text.primary',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    };
  const gradientStyle = {
        padding: theme.spacing[5],
      };
  const urgencyStripStyle = {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        height: 4,
      };
  const headerStyle = {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: theme.spacing[3],
      };
  const iconContainerStyle = {
        width: 44,
        height: 44,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        marginRight: theme.spacing[3],
      };
  const headlineStyle = {
        flex: 1,
      };
  const subtextStyle = {
        marginBottom: theme.spacing[4],
        opacity: 0.9,
      };
  const coachMessageStyle = {
        flexDirection: 'row' as const,
        alignItems: 'flex-start' as const,
        marginBottom: theme.spacing[4],
        padding: theme.spacing[3],
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: theme.borderRadius.lg,
      };
  const coachIconStyle = {
        marginRight: theme.spacing[2],
        marginTop: 2,
      };
  const ctaButtonStyle = {
        width: '100%' as const,
      };
  const secondaryRowStyle = {
        flexDirection: 'row' as const,
        justifyContent: 'center' as const,
        marginTop: theme.spacing[3],
        gap: theme.spacing[4],
      };
  const secondaryButtonStyle = {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[3],
      };
  const secondaryTextStyle = {
        opacity: 0.8,
      };
  const loadingContainerStyle = {
        height: 280,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      };
  const handleCtaPress = () => {
    if (recommendation) {
      haptics.primaryAction();
      onPressCta(recommendation);
    }
  };
  if (isLoading || !recommendation) {
    return (
      <View
        style={[
          containerStyle,
          {
            backgroundColor: theme.colors.background.secondary,
            height: 280,
          },
        ]}
      >
        <View style={loadingContainerStyle}>
          <Text variant="body" color={theme.colors.text.secondary}>
            Loading your focus plan...
          </Text>
        </View>
      </View>
    );
  }
  const gradientColors = getHeroGradientColors(recommendation.urgency, recommendation.type, theme);
  const urgencyColor = getHeroUrgencyColor(recommendation.urgency, theme);
  const icon = getHeroIcon(recommendation.type);
  return (
    <View style={containerStyle}>
      <LinearGradient colors={gradientColors} style={gradientStyle}>
        {/* Urgency indicator strip */}
        {recommendation.urgency !== 'low' && (
          <View style={[urgencyStripStyle, { backgroundColor: urgencyColor }]} />
        )}
        {/* Focus Score Badge */}
        {profile && (
          <View
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
              alignItems: 'center',
            }}
          >
            <Text variant="caption" color="theme.colors.background.primary">
              Focus Score: {profile.currentScore}
            </Text>
          </View>
        )}
        {/* Header with icon and headline */}
        <View style={headerStyle}>
          <View style={iconContainerStyle}>
            <Icon name={icon} size={24} color="theme.colors.background.primary" />
          </View>
          <View style={headlineStyle}>
            <Text variant="h3" color="theme.colors.background.primary">
              {recommendation.headline}
            </Text>
          </View>
        </View>
        {/* Subtext */}
        <Text variant="body" color="theme.colors.background.primary" style={subtextStyle}>
          {recommendation.subtext}
        </Text>
        {/* AI Coach message (if present) */}
        {recommendation.aiCoachMessage && (
          <View style={coachMessageStyle}>
            <Icon
              name="message-circle"
              size={16}
              color="rgba(255,255,255,0.8)"
              style={coachIconStyle}
            />
            <Text variant="bodySmall" color="rgba(255,255,255,0.9)" style={{ flex: 1 }}>
              {recommendation.aiCoachMessage}
            </Text>
          </View>
        )}
        {/* Primary CTA */}
        <Button
          variant="secondary"
          size="lg"
          onPress={handleCtaPress}
          style={ctaButtonStyle}
        >
          {recommendation.ctaText}
        </Button>
        {/* Secondary actions */}
        <HomeHeroSecondaryActions onPress={onPressSecondary} rowStyle={secondaryRowStyle} buttonStyle={secondaryButtonStyle} textStyle={secondaryTextStyle} />
      </LinearGradient>
    </View>
  );
}
