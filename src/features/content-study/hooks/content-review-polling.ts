import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { captureException } from '../../../config/sentry';
import {
  buildContentStudyTimeoutFallback,
  pollContentStatus,
} from '../ContentStudyService';
import type { StudyContent } from '../types';
import { contentStudyQueryKeys } from './queryKeys';

export function useContentExtractionPolling(
  contentId: string,
  content: StudyContent | null,
  onExtractingChange: (isExtracting: boolean) => void,
  onError: (message: string) => void,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!contentId || !content) {
      return;
    }

    const needsPolling = ['PENDING', 'EXTRACTING', 'PROCESSING'].includes(
      content.status,
    );

    if (!needsPolling) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const status = await pollContentStatus(contentId);
        if (
          status.status === 'EXTRACTED' ||
          status.status === 'READY' ||
          status.status === 'FAILED'
        ) {
          clearInterval(pollInterval);
          void queryClient.invalidateQueries({
            queryKey: contentStudyQueryKeys.content(contentId),
          });
        }
        onExtractingChange(
          ['PENDING', 'EXTRACTING', 'PROCESSING'].includes(status.status),
        );
      } catch (error) {
        captureException(
          error instanceof Error ? error : new Error('Poll failed'),
          {
            area: 'content-study.review.poll',
            contentId,
          },
        );
        const fallback = buildContentStudyTimeoutFallback();
        onError(fallback.body);
        onExtractingChange(false);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [contentId, content, queryClient, onExtractingChange, onError]);
}
