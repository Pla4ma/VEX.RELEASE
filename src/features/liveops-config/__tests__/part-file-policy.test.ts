import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

function collectPartFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {return collectPartFiles(fullPath);}
    return /\.part-\d+\.ts$/.test(fullPath)
      ? [fullPath.replace(/\\/g, '/')]
      : [];
  });
}

describe('part file policy', () => {
  it('documents freeze and migration plan', () => {
    const policy = readFileSync('docs/PART_FILE_POLICY.md', 'utf8');

    expect(policy).toContain('No new files named');
    expect(policy).toContain('session-completion');
    expect(policy).toContain('session-start');
    expect(policy).toContain('notifications');
    expect(policy).toContain('FROZEN');
    expect(policy).toContain('retention');
  });

  it('does not create part files outside known frozen features', () => {
    const allowed = [
      'src/features/retention/',
      'src/features/session-story/',
      'src/features/shop/',
      'src/features/themes/',
    ];

    const unexpected = collectPartFiles('src').filter(
      (file) => !allowed.some((prefix) => file.startsWith(prefix)),
    );

    expect(unexpected).toEqual([]);
  });
});
