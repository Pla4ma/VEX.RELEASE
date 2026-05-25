import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../../..');

jest.mock('../../network', () => ({
  getNetInfoAdapter: jest.fn(() => ({ initialize: jest.fn() })),
}));
jest.mock('../../lib/offline/queue', () => ({
  getQueueLength: jest.fn(() => 0),
  startAutoProcessing: jest.fn(),
}));
jest.mock('../../utils/debug', () => ({
  createDebugger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
}));
jest.mock('../../shared/analytics', () => ({
  analyticsService: { initialize: jest.fn(async () => false) },
  capture: jest.fn(),
  initializeAnalyticsEventBridge: jest.fn(),
  ProductAnalyticsEvents: { APP_OPENED: 'APP_OPENED' },
}));
jest.mock('../../config/sentry', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));
jest.mock('../../features/session-completion/completion-orchestrator', () => ({
  initializeSessionCompletionOrchestrator: jest.fn(),
}));
jest.mock('../../features/session-story/SessionStoryEngine', () => ({
  initializeSessionStoryEngine: jest.fn(() => jest.fn()),
}));
jest.mock('../../features/emotion-retention', () => ({
  initializeEmotionRetention: jest.fn(() => jest.fn()),
}));
jest.mock('../../errors', () => ({
  setupGlobalErrorHandler: jest.fn(),
  setupRejectionHandler: jest.fn(),
}));
jest.mock('../../constants/app', () => ({ IS_DEVELOPMENT: true }));

function readProjectFile(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('SessionStory runtime policy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('bootstrapApp does not initialize SessionStory automatically', () => {
    const { bootstrapApp } = require('../bootstrap') as { bootstrapApp: () => void };
    const storyEngine = require('../../features/session-story/SessionStoryEngine') as {
      initializeSessionStoryEngine: jest.Mock;
    };

    bootstrapApp();

    expect(storyEngine.initializeSessionStoryEngine).not.toHaveBeenCalled();
  });

  it('AppProviders source does not initialize SessionStory automatically', () => {
    const source = readProjectFile('src/app/providers/AppProviders.tsx');

    expect(source).not.toContain('initializeSessionStoryEngine');
  });

  it('importing session-story has no EventBus side effects', () => {
    jest.doMock('../../events', () => ({
      eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
    }));

    jest.isolateModules(() => {
      require('../../features/session-story');
      const { eventBus } = require('../../events') as {
        eventBus: { subscribe: jest.Mock };
      };
      expect(eventBus.subscribe).not.toHaveBeenCalled();
    });
  });

  it('PostSessionStory is not registered in the root stack by default', () => {
    const source = readProjectFile('src/navigation/RootStackScreens.tsx');

    expect(source).not.toContain('name="PostSessionStory"');
  });

  it('normal completion does not expose a default PostSessionStory CTA', () => {
    const source = readProjectFile('src/screens/session/components/SessionCompleteNextSteps.tsx');

    expect(source).not.toContain('PostSessionStory');
    expect(source).not.toContain('View Session Story');
  });

  it('completing a session does not warm cinematic story by default', () => {
    const source = readProjectFile('src/screens/session/SessionCompleteScreen.tsx');

    expect(source).not.toContain('usePostSessionStoryViewModel');
  });

  it('root runtime cannot create duplicate SessionStory session subscribers', () => {
    const bootstrap = readProjectFile('src/app/bootstrap.ts');
    const providers = readProjectFile('src/app/providers/AppProviders.tsx');

    expect(`${bootstrap}\n${providers}`).not.toContain('initializeSessionStoryEngine');
  });

  it('archived PostSessionStory route cannot be opened by notification routing', () => {
    const source = readProjectFile('src/navigation/notification-routing-types.ts');

    expect(source).not.toContain('PostSessionStory');
    expect(source).not.toContain('post_session_story');
    expect(source).not.toContain('VIEW_STORY');
  });

  it('archived PostSessionStory route cannot be opened by notification routing core', () => {
    const core = readProjectFile('src/navigation/notification-routing-core.ts');

    expect(core).not.toContain('PostSessionStory');
  });

  it('notification navigation hook cannot route to PostSessionStory', () => {
    const hook = readProjectFile('src/navigation/hooks/useNotificationNavigation.ts');

    expect(hook).not.toContain('PostSessionStory');
    expect(hook).not.toContain('view_story');
  });

  it('streak funeral navigation does not open archived story route', () => {
    const hook = readProjectFile('src/navigation/hooks/useStreakFuneralNavigation.ts');

    expect(hook).not.toContain('PostSessionStory');
  });

  it('archived SessionStory keeps only safety and calculator tests', () => {
    const testRoot = path.join(root, 'src/features/session-story');
    const testFiles = fs
      .readdirSync(testRoot, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.test.ts'))
      .map((entry) => entry.name);

    expect(testFiles).toEqual(
      expect.arrayContaining([
        'archive-generation.test.ts',
        'archive-import-engine.test.ts',
        'StoryBeatCalculator.test.ts',
      ]),
    );
    expect(testFiles).not.toEqual(
      expect.arrayContaining([
        'SessionStoryOverlay.test.tsx',
        'StoryMoment.test.tsx',
        'PostSessionStory.test.tsx',
      ]),
    );
  });
});
