import fs from 'fs';
import path from 'path';

const screensRoot = path.join(__dirname, '..', 'screens');

function collectScreenFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectScreenFiles(fullPath);
    }
    return entry.isFile() && entry.name.endsWith('Screen.tsx')
      ? [fullPath]
      : [];
  });
}

describe('screen error boundary audit', () => {
  it('wraps every screen with the shared screen error boundary', () => {
    const missing = collectScreenFiles(screensRoot)
      .filter(
        (file) =>
          !fs.readFileSync(file, 'utf8').includes('withScreenErrorBoundary'),
      )
      .map((file) => path.relative(process.cwd(), file).replace(/\\/g, '/'));

    expect(missing).toEqual([]);
  });
});
