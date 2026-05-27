import fs from "fs";
import path from "path";

const sourceRoot = path.join(process.cwd(), "src");

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir).flatMap((entry) => {
    const filePath = path.join(dir, entry);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return sourceFiles(filePath);
    }
    return /\.(ts|tsx)$/.test(entry) ? [filePath] : [];
  });
}

function readRelative(filePath: string): {
  relativePath: string;
  source: string;
} {
  return {
    relativePath: path.relative(process.cwd(), filePath),
    source: fs.readFileSync(filePath, "utf8"),
  };
}

describe("auth store import audit", () => {
  it("has no file importing a legacy auth store", () => {
    const offenders = sourceFiles(sourceRoot)
      .map(readRelative)
      .filter(({ source }) => /from ["'][^"']*legacy-store["']/.test(source))
      .map(({ relativePath }) => relativePath);

    expect(offenders).toEqual([]);
  });

  it("has no manual token auth path competing with Supabase auth", () => {
    const bannedPatterns = [
      "setSessionToken",
      "login: (userId: string, token",
      "getItem(TOKEN_KEY)",
      "sstorage",
    ];
    const offenders = sourceFiles(sourceRoot)
      .map(readRelative)
      .filter(
        ({ relativePath }) =>
          !relativePath.includes(`${path.sep}__tests__${path.sep}`),
      )
      .filter(({ source }) =>
        bannedPatterns.some((pattern) => source.includes(pattern)),
      )
      .map(({ relativePath }) => relativePath);

    expect(offenders).toEqual([]);
  });
});
