import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../../..');

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function normalize(value: string): string {
  return value.replaceAll('\\', '/');
}

function importSpecifiers(source: string): string[] {
  const matches = source.matchAll(
    /\b(?:import|export)\b[\s\S]*?\bfrom\s*['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)/g,
  );
  return Array.from(matches, (match) => match[1] ?? match[2] ?? '').map(
    normalize,
  );
}

function readImports(relativePath: string): string[] {
  return importSpecifiers(read(relativePath));
}

function expectNoStaticImport(
  files: string[],
  blockedSegments: string[],
): void {
  const violations = files.flatMap((file) =>
    readImports(file)
      .filter((specifier) =>
        blockedSegments.some((segment) => specifier.includes(segment)),
      )
      .map((specifier) => `${file} -> ${specifier}`),
  );
  expect(violations).toEqual([]);
}

describe('cold-start runtime policy', () => {
  const rootFiles = [
    'src/app/App.tsx',
    'src/app/bootstrap.ts',
    'src/app/providers/AppProviders.tsx',
  ];

  const rootNavigationFiles = [
    'src/navigation/RootNavigator.tsx',
    'src/navigation/RootStackScreens.tsx',
    'src/navigation/root-stack-authenticated-routes.tsx',
    'src/navigation/root-stack-feature-routes.tsx',
    'src/navigation/MainNavigator.tsx',
  ];

  it('app root imports no archived features', () => {
    expectNoStaticImport(rootFiles, [
      'features/spectacle',
      'features/emotion-retention',
      'features/retention',
      'archive/',
    ]);
  });

  it('bootstrap initializes no archived features', () => {
    const source = read('src/app/bootstrap.ts');
    expect(source).not.toMatch(
      /SpectacleOverlay|initializeEmotionRetention|StreakCreature|session-story/,
    );
  });

  it('first Home fallback does not query lane-heavy systems', () => {
    const fallback = read(
      'src/screens/home/containers/HomeColdStartFallback.tsx',
    );
    const resolver = read('src/screens/home/containers/HomeStageResolver.tsx');

    expect(resolver).toContain('if (!canHydrate)');
    expect(resolver).not.toMatch(
      /useHomeResolvedExperience|resolveInitialLane|getBehaviorSignals/,
    );
    expect(fallback).not.toMatch(
      /personalization|lane-engine|memory|useActiveStudyPlan|useActiveBoss/,
    );
  });

  it('premium offerings do not block first screen', () => {
    expectNoStaticImport(
      [
        ...rootNavigationFiles,
        'src/screens/home/containers/HomeStageResolver.tsx',
      ],
      [
        'shared/monetization',
        'screens/paywall',
        'premium-revenuecat-health-checks',
      ],
    );
    expect(read('src/navigation/RootNavigator.tsx')).not.toContain(
      'useFeatureHealth',
    );
  });

  it('memory and Study OS do not block first screen', () => {
    expectNoStaticImport(
      [
        'src/screens/home/containers/HomeStageResolver.tsx',
        'src/screens/home/containers/HomeColdStartFallback.tsx',
      ],
      [
        'features/content-study',
        'features/learning-execution',
        'features/lane-engine',
        'features/personalization',
      ],
    );
  });

  it('hidden systems do not appear in the root static dependency graph', () => {
    expectNoStaticImport(
      [...rootFiles, ...rootNavigationFiles],
      [
        'features/ai-coach',
        'features/boss',
        'features/content-study',
        'features/spectacle',
        'features/emotion-retention',
        'features/retention',
        'shared/monetization',
        'screens/paywall',
        'screens/boss',
      ],
    );
  });
});
