/**
 * TanStack Query Provider
 *
 * Global QueryClient provider with optimized configuration for React Native.
 * Includes network-aware refetching and persistence.
 */

import React, { useEffect } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import { getNetInfoAdapter } from '../network';

/**
 * Query client configuration
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global query defaults
      staleTime: 1000 * 60 * 2, // 2 minutes - fresh enough for mobile, avoids duplicate fetch churn
      gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // prevent jarring refetches when user switches from another app mid-session
      refetchOnReconnect: true,
      refetchOnMount: false,
      networkMode: 'online',
    },
    mutations: {
      // Mutation defaults
      retry: 1,
      networkMode: 'online',
    },
  },
});

/**
 * Query Provider Props
 */
interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Query Provider Component
 *
 * Wraps the app with TanStack Query and sets up:
 * - App state awareness (pause queries in background)
 * - Network awareness (pause when offline)
 * - Focus management
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize network monitoring
    const netInfo = getNetInfoAdapter();
    netInfo.initialize();

    // Subscribe to network changes
    const unsubscribe = netInfo.subscribe((state) => {
      onlineManager.setOnline(
        state.isConnected && (state.isInternetReachable ?? false),
      );
    });

    // Handle app state changes
    const subscription = AppState.addEventListener(
      'change',
      (status: AppStateStatus) => {
        // React Query's focus manager
        const isFocused = status === 'active';
        focusManager.setFocused(isFocused);

        // Refetch when app comes to foreground
        if (isFocused) {
          queryClient.resumePausedMutations();
        }
      },
    );

    return () => {
      unsubscribe();
      subscription.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

/**
 * Export query client for direct access
 */
export { queryClient };

/**
 * Query keys factory for type-safe queries
 */
export const QueryKeys = {
  // Auth
  auth: ['auth'] as const,
  user: (userId: string) => ['user', userId] as const,
  session: ['session'] as const,

  // Content
  feed: (filters?: string) => ['feed', filters] as const,
  post: (postId: string) => ['post', postId] as const,

  // Economy
  wallet: (userId: string) => ['wallet', userId] as const,
  transactions: (userId: string) => ['transactions', userId] as const,

  // Social
  squad: (squadId: string) => ['squad', squadId] as const,
  squads: ['squads'] as const,

  // Progress
  achievements: ['achievements'] as const,
  streak: ['streak'] as const,

  // Settings
  settings: ['settings'] as const,
  notifications: ['notifications'] as const,
};
