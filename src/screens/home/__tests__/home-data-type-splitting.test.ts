import { readFileSync } from 'fs';
import { resolve } from 'path';

const hooksDir = resolve(__dirname, '..', 'hooks');

function readSource(filename: string): string {
  return readFileSync(resolve(hooksDir, filename), 'utf8');
}

describe('HomeData type splitting — no unsafe casts in NewUser/Activating', () => {
  it('useNewUserHomeData does not contain `as unknown as` casts', () => {
    const source = readSource('useNewUserHomeData.ts');
    expect(source).not.toContain('as unknown as');
  });

  it('useActivatingHomeData does not contain `as unknown as` casts', () => {
    const source = readSource('useActivatingHomeData.ts');
    expect(source).not.toContain('as unknown as');
  });

  it('useNewUserHomeData does not contain `undefined as` casts', () => {
    const source = readSource('useNewUserHomeData.ts');
    expect(source).not.toContain('undefined as');
  });

  it('useActivatingHomeData does not contain `undefined as` casts', () => {
    const source = readSource('useActivatingHomeData.ts');
    expect(source).not.toContain('undefined as');
  });

  it('NewUserHomeData type has intervention: null', () => {
    const source = readSource('home-data-types.ts');
    const newUserDataIndex = source.indexOf('NewUserHomeData');
    const nextInterfaceIndex = source.indexOf(
      'interface A',
      newUserDataIndex + 1,
    );
    const section = source.slice(
      newUserDataIndex,
      nextInterfaceIndex > newUserDataIndex ? nextInterfaceIndex : undefined,
    );
    expect(section).toContain('intervention: null');
    expect(section).toContain('interventionLoading: false');
  });

  it('ActivatingHomeData type has intervention: null', () => {
    const source = readSource('home-data-types.ts');
    const activatingIndex = source.indexOf('interface ActivatingHomeData');
    const nextInterfaceIndex = source.indexOf(
      'interface E',
      activatingIndex + 1,
    );
    const section = source.slice(
      activatingIndex,
      nextInterfaceIndex > activatingIndex ? nextInterfaceIndex : undefined,
    );
    expect(section).toContain('intervention: null');
    expect(section).toContain('interventionLoading: false');
  });

  it('EngagedHomeData and PowerUserHomeData have ActiveIntervention type', () => {
    const source = readSource('home-data-types.ts');
    const engagedIndex = source.indexOf('interface EngagedHomeData');
    const powerIndex = source.indexOf('interface PowerUserHomeData');
    expect(engagedIndex).toBeGreaterThan(0);
    expect(powerIndex).toBeGreaterThan(0);
    expect(source).toContain('ActiveIntervention | null');
  });

  it('NewUserHomeData has no challenge/freeze/intervention advanced placeholders', () => {
    const source = readSource('useNewUserHomeData.ts');
    expect(source).toMatch(/intervention:\s*null/);
    expect(source).toMatch(/interventionLoading:\s*false as const/);
    expect(source).toMatch(/handleClaimReward/);
    expect(source).toMatch(/handleFreezeStreak/);
  });

  it('ActivatingHomeData has no advanced placeholders', () => {
    const source = readSource('useActivatingHomeData.ts');
    expect(source).toMatch(/intervention:\s*null/);
    expect(source).toMatch(/interventionLoading:\s*false as const/);
  });

  it('Type file exports all four data interfaces', () => {
    const source = readSource('home-data-types.ts');
    expect(source).toContain('export interface BaseHomeData');
    expect(source).toContain('export interface NewUserHomeData');
    expect(source).toContain('export interface ActivatingHomeData');
    expect(source).toContain('export interface EngagedHomeData');
    expect(source).toContain('export interface PowerUserHomeData');
  });
});

describe('HomeData split — hooks have explicit return types', () => {
  it('useNewUserHomeData returns NewUserHomeData', () => {
    const source = readSource('useNewUserHomeData.ts');
    expect(source).toContain('): NewUserHomeData {');
  });

  it('useActivatingHomeData returns ActivatingHomeData', () => {
    const source = readSource('useActivatingHomeData.ts');
    expect(source).toContain('): ActivatingHomeData {');
  });

  it('useEngagedHomeData returns EngagedHomeData', () => {
    const source = readSource('useEngagedHomeData.ts');
    expect(source).toContain('): EngagedHomeData {');
  });

  it('usePowerUserHomeData returns PowerUserHomeData', () => {
    const source = readSource('usePowerUserHomeData.ts');
    expect(source).toContain('): PowerUserHomeData {');
  });
});

describe('HomeData split — no advanced imports in NewUser/Activating', () => {
  function assertNoAdvancedImports(source: string): void {
    const banned = [
      /useActiveChallenges/,
      /useClaimChallengeReward/,
      /useSquadMembersFocusing/,
      /useActiveIntervention/,
      /useNotificationBadge/,
      /useFreezeStreak/,
      /useSavedTomorrowPreview/,
    ];
    for (const pattern of banned) {
      expect(source).not.toMatch(pattern);
    }
  }

  it('useNewUserHomeData has no advanced feature imports', () => {
    const source = readSource('useNewUserHomeData.ts');
    assertNoAdvancedImports(source);
  });

  it('useActivatingHomeData has no advanced feature imports', () => {
    const source = readSource('useActivatingHomeData.ts');
    assertNoAdvancedImports(source);
  });
});
