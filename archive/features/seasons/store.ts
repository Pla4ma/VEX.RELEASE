/**
 * Seasons Feature - Zustand Store
 *
 * Client state for season UI
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStorageManager } from '../../persistence';

// ============================================================================
// Store Types
// ============================================================================

interface SeasonState {
  // UI State
  selectedSeasonId: string | null;
  activeTab: 'progress' | 'challenges' | 'rewards' | 'leaderboard';
  showPremiumModal: boolean;
  selectedTier: number | null;

  // View State
  hasSeenWelcome: boolean;
  lastViewedAt: number | null;
  dismissedBanners: string[];
}

interface SeasonActions {
  setSelectedSeasonId: (seasonId: string | null) => void;
  setActiveTab: (tab: SeasonState['activeTab']) => void;
  setShowPremiumModal: (show: boolean) => void;
  setSelectedTier: (tier: number | null) => void;
  markWelcomeSeen: () => void;
  markLastViewed: () => void;
  dismissBanner: (bannerId: string) => void;
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: SeasonState = {
  selectedSeasonId: null,
  activeTab: 'progress',
  showPremiumModal: false,
  selectedTier: null,
  hasSeenWelcome: false,
  lastViewedAt: null,
  dismissedBanners: [],
};

// ============================================================================
// Store Creation
// ============================================================================

export const useSeasonStore = create<SeasonState & SeasonActions>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedSeasonId: (seasonId) => set({ selectedSeasonId: seasonId }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setShowPremiumModal: (show) => set({ showPremiumModal: show }),

      setSelectedTier: (tier) => set({ selectedTier: tier }),

      markWelcomeSeen: () => set({ hasSeenWelcome: true }),

      markLastViewed: () => set({ lastViewedAt: Date.now() }),

      dismissBanner: (bannerId) =>
        set((state) => ({
          dismissedBanners: [...state.dismissedBanners, bannerId],
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'vex-seasons-store',
      storage: {
        getItem: async (name) => {
          const storage = getStorageManager();
          const value = await storage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          const storage = getStorageManager();
          await storage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          const storage = getStorageManager();
          await storage.removeItem(name);
        },
      },
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export function useSeasonUIState() {
  return useSeasonStore((state) => ({
    selectedSeasonId: state.selectedSeasonId,
    activeTab: state.activeTab,
    showPremiumModal: state.showPremiumModal,
    selectedTier: state.selectedTier,
  }));
}

export function useSeasonViewState() {
  return useSeasonStore((state) => ({
    hasSeenWelcome: state.hasSeenWelcome,
    lastViewedAt: state.lastViewedAt,
    dismissedBanners: state.dismissedBanners,
  }));
}
