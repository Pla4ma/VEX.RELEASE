import { useEffect } from 'react';
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { getSupabaseClient } from '../../config/supabase';
import type { SocialPost } from './types';
import { getFeed, getPost, getReactionCounts, getSquadFeed, reactToPost } from './repository';

type FeedPage = { items: SocialPost[]; nextCursor: number | null };
type FeedCache = InfiniteData<FeedPage, number | null>;
type ReactionInput = {
  userId: string;
  postId: string;
  reaction: 'fire' | 'strong' | 'clap' | 'mind_blown';
};

export const SOCIAL_QUERY_KEYS = {
  all: ['social'] as const,
  feed: (userId: string) => [...SOCIAL_QUERY_KEYS.all, 'feed', userId] as const,
  squadFeed: (squadId: string) =>
    [...SOCIAL_QUERY_KEYS.all, 'squad-feed', squadId] as const,
};

function updateCachedReaction(
  cache: FeedCache | undefined,
  input: ReactionInput,
): FeedCache | undefined {
  if (!cache) {return cache;}
  return {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => {
        if (item.id !== input.postId) {return item;}
        const counts = { ...item.reactionCounts };
        if (item.userReaction)
          {counts[item.userReaction] = Math.max(
            0,
            counts[item.userReaction] - 1,
          );}
        counts[input.reaction] += 1;
        return {
          ...item,
          reactionCounts: counts,
          userReaction: input.reaction,
        };
      }),
    })),
  };
}

export function useFeed(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: SOCIAL_QUERY_KEYS.feed(userId ?? ''),
    queryFn: () => getFeed(userId!, 20),
    initialPageParam: null as number | null,
    getNextPageParam: () => null,
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(userId),
  });
}

export function useSquadFeed(squadId: string | undefined, userId?: string) {
  return useInfiniteQuery({
    queryKey: SOCIAL_QUERY_KEYS.squadFeed(squadId ?? ''),
    queryFn: ({ pageParam }) => getSquadFeed(squadId!, userId, pageParam, 20),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60,
    enabled: Boolean(squadId),
  });
}

export function useReactToPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReactionInput) => {
      await reactToPost(input.userId, input.postId, input.reaction);
      return { input, counts: await getReactionCounts(input.postId) };
    },
    onMutate: async (input) => {
      const snapshots = queryClient.getQueriesData<FeedCache>({
        queryKey: SOCIAL_QUERY_KEYS.all,
      });
      await queryClient.cancelQueries({ queryKey: SOCIAL_QUERY_KEYS.all });
      for (const [key, value] of snapshots as Array<
        [QueryKey, FeedCache | undefined]
      >) {
        queryClient.setQueryData<FeedCache>(
          key,
          updateCachedReaction(value, input),
        );
      }
      return { snapshots };
    },
    onError: (_error, _input, context) => {
      for (const [key, value] of (context?.snapshots ?? []) as Array<
        [QueryKey, FeedCache | undefined]
      >) {
        queryClient.setQueryData<FeedCache>(key, value);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.all });
    },
  });
}

export function useSubscribeToFeed(userId: string | undefined): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!userId) {return;}
    const channel = getSupabaseClient()
      .channel(`social-feed-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'social_posts' },
        (payload) => {
          const postId =
            typeof payload.new.id === 'string' ? payload.new.id : null;
          if (!postId) {return;}
          void (async () => {
            const post = await getPost(postId);
            if (!post) {return;}
            queryClient.setQueryData<FeedCache>(
              SOCIAL_QUERY_KEYS.feed(userId),
              (current) => {
                if (!current || current.pages.length === 0) {
                  return {
                    pages: [{ items: [post], nextCursor: null }],
                    pageParams: [null],
                  };
                }
                const [first, ...rest] = current.pages;
                return {
                  ...current,
                  pages: [{ ...first, items: [post, ...first.items] }, ...rest],
                };
              },
            );
          })();
        },
      );
    void channel.subscribe();
    return () => {
      void channel.unsubscribe();
    };
  }, [queryClient, userId]);
}
