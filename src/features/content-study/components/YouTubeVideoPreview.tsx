import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Skeleton } from '../../../components/ui/Skeleton';
import { getOptimizedImageUrl } from '../../../shared/performance';

import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import { Icon } from '../../../icons';
import type { YouTubeInputProps } from '../types';
import { styles, formatDuration } from './YouTubeInputStyles';

type VideoInfo = NonNullable<YouTubeInputProps['videoInfo']>;

interface YouTubeVideoPreviewProps {
  videoInfo: VideoInfo | null | undefined;
  isExtracting: boolean;
  extractionError?: string | null;
  onExtract?: () => void;
}

export function YouTubeVideoPreview({
  videoInfo,
  isExtracting,
  extractionError,
  onExtract,
}: YouTubeVideoPreviewProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.previewCard,
        {
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.DEFAULT,
        },
      ]}
    >
      {isExtracting ? (
        <View style={styles.extractingContainer}>
          <Skeleton width={40} height={40} variant="circular" />
          <Text
            style={[
              styles.extractingText,
              { color: theme.colors.text.secondary },
            ]}
          >
            Extracting video transcript...
          </Text>
        </View>
      ) : videoInfo ? (
        <>
          {videoInfo.thumbnail && (
            <Image
              source={{ uri: getOptimizedImageUrl(videoInfo.thumbnail, { maxWidth: 320 }) }}
              style={styles.thumbnail}
              contentFit="cover"
              cachePolicy="disk"
            />
          )}
          <View style={styles.previewInfo}>
            <Text
              style={[
                styles.videoTitle,
                { color: theme.colors.text.primary },
              ]}
              numberOfLines={2}
            >
              {videoInfo.title || 'Video title unavailable'}
            </Text>
            {videoInfo.channelName && (
              <Text
                style={[
                  styles.channelName,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {videoInfo.channelName}
              </Text>
            )}
            {videoInfo.duration != null && videoInfo.duration > 0 && (
              <View style={styles.durationBadge}>
                <Icon
                  name="clock"
                  size="xs"
                  color={theme.colors.text.muted}
                />
                <Text
                  style={[
                    styles.durationText,
                    { color: theme.colors.text.muted },
                  ]}
                >
                  {formatDuration(videoInfo.duration ?? 0)}
                </Text>
              </View>
            )}
          </View>
        </>
      ) : null}
      {extractionError && (
        <View style={styles.extractionErrorContainer}>
          <Icon
            name="alert-circle"
            size="md"
            color={theme.colors.error[500]}
          />
          <Text
            style={[
              styles.extractionErrorText,
              { color: theme.colors.error[500] },
            ]}
          >
            {extractionError}
          </Text>
          {onExtract && (
            <Button variant="ghost"
              size="sm"
              onPress={onExtract}
              accessibilityLabel="Retry loading video"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              Retry
            </Button>
          )}
        </View>
      )}
    </View>
  );
}
