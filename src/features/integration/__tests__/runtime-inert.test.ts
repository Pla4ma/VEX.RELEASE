import { readFileSync } from 'fs';

import { initializeFeatureIntegrations } from '../index';
import { getEventService } from '../../../events/EventService';

jest.mock('../../../events/EventBus', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn().mockReturnValue(jest.fn()),
  },
}));
jest.mock('../../../features/liveops-config/feature-access-store', () => ({
  getAvailabilityFor: jest.fn(() => ({
    state: 'disabled',
    canRenderEntryPoint: false,
    canNavigate: false,
    canQuery: false,
    canUseBackend: false,
    canRegisterRoute: false,
    canSubscribeToEvents: false,
    canShowNotification: false,
    reason: 'disabled',
  })),
}));
jest.mock('../progression-rewards', () => ({ initializeProgressionRewardsIntegration: jest.fn(() => jest.fn()) }));
jest.mock('../streaks-rewards', () => ({ initializeStreaksRewardsIntegration: jest.fn(() => jest.fn()) }));
jest.mock('../boss-rewards', () => ({ initializeBossRewardsIntegration: jest.fn(() => jest.fn()) }));
jest.mock('../sessions-feed', () => ({ initializeSessionsFeedIntegration: jest.fn(() => jest.fn()) }));
jest.mock('../economy-feed', () => ({ initializeEconomyFeedIntegration: jest.fn(() => jest.fn()) }));
jest.mock('../social-feed', () => ({ initializeSocialFeedIntegration: jest.fn(() => jest.fn()) }));
jest.mock('../../focus-identity/integration-focus-score', () => ({ initializeFocusScoreIntegration: jest.fn(() => jest.fn()) }));

const integrations = {
  progression: jest.requireMock('../progression-rewards') as { initializeProgressionRewardsIntegration: jest.Mock },
  streaks: jest.requireMock('../streaks-rewards') as { initializeStreaksRewardsIntegration: jest.Mock },
  boss: jest.requireMock('../boss-rewards') as { initializeBossRewardsIntegration: jest.Mock },
  sessions: jest.requireMock('../sessions-feed') as { initializeSessionsFeedIntegration: jest.Mock },
  economy: jest.requireMock('../economy-feed') as { initializeEconomyFeedIntegration: jest.Mock },
  social: jest.requireMock('../social-feed') as { initializeSocialFeedIntegration: jest.Mock },
};
const eventBusMock = jest.requireMock('../../../events/EventBus') as {
  eventBus: { subscribe: jest.Mock; publish: jest.Mock };
};

describe('runtime inert hidden systems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not initialize economy or social integrations by default', () => {
    const cleanup = initializeFeatureIntegrations();

    expect(integrations.progression.initializeProgressionRewardsIntegration).toHaveBeenCalled();
    expect(integrations.streaks.initializeStreaksRewardsIntegration).toHaveBeenCalled();
    expect(integrations.boss.initializeBossRewardsIntegration).toHaveBeenCalled();
    expect(integrations.sessions.initializeSessionsFeedIntegration).toHaveBeenCalled();
    expect(integrations.economy.initializeEconomyFeedIntegration).not.toHaveBeenCalled();
    expect(integrations.social.initializeSocialFeedIntegration).not.toHaveBeenCalled();
    cleanup();
  });

  it('does not subscribe EventService when seasonal systems are inactive', () => {
    getEventService('user-1');

    expect(eventBusMock.eventBus.subscribe).not.toHaveBeenCalled();
  });

  it('active session integration does not publish hidden systems', () => {
    const source = readFileSync('src/features/integration/sessions-feed.ts', 'utf8');

    expect(source).not.toContain("'social:activity'");
    expect(source).not.toContain("'seasons:challenge_progress'");
    expect(source).not.toContain("'leaderboards:score_update'");
    expect(source).not.toContain("type: 'COINS'");
    expect(source).not.toContain("type: 'GEMS'");
  });

  it('hidden systems have no routes, prefetch, notification, completion, or coach action leaks', () => {
    const routeSource = readFileSync('src/navigation/feature-route-registry.ts', 'utf8');
    const notificationSource = readFileSync('src/navigation/hooks/useNotificationNavigation.ts', 'utf8');
    const completionSource = readFileSync('src/screens/session/components/SessionCompleteRewardsPhase.tsx', 'utf8');
    const coachSource = readFileSync('src/features/coach-presence/copy-service.ts', 'utf8');
    const rewardsSource = readFileSync('src/features/rewards/service.ts', 'utf8');
    const sessionRewardSource = readFileSync('src/session/integration/session-reward-helpers.ts', 'utf8');
    const sessionRewardHandlersSource = readFileSync('src/session/integration/SessionRewardHandlers.ts', 'utf8');
    const hidden = /Shop|Inventory|Guild|BattlePass|Leaderboard|Rival|Wager|Chest/i;

    expect(routeSource).not.toMatch(/route:\s*['"](Shop|Inventory|Guild|BattlePass|Leaderboard|Rivals|Wagers)/);
    expect(notificationSource).not.toMatch(/notification:in_app_banner[\s\S]*(shop|inventory|battle_pass|rival|guild|wager)/i);
    expect(completionSource).not.toMatch(hidden);
    expect(coachSource).not.toMatch(/OPEN_SHOP|OPEN_INVENTORY|OPEN_GUILD|leaderboard|wager/i);
    expect(rewardsSource).not.toContain("eventBus.publish('economy:add_currency'");
    expect(sessionRewardSource).not.toContain('economy:add_currency');
    expect(sessionRewardSource).not.toContain('social:activity-created');
    expect(sessionRewardHandlersSource).not.toMatch(/battle-pass|fetchActiveSeason|addBattlePassXp/);
  });
});
