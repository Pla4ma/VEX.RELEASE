import { readFileSync } from "fs";
import { join } from "path";

export interface JestGroup {
  description: string;
  required: boolean;
  patterns: string[];
}

export interface GroupConfig {
  groups: Record<string, JestGroup>;
  rules: {
    blocking: string[];
    "non-blocking": string[];
    "ci-required": string[];
    "ci-optional": string[];
  };
}

export const GROUPS_PATH = join(process.cwd(), "jest.groups.json");

export function loadGroups(): GroupConfig {
  const raw = readFileSync(GROUPS_PATH, "utf-8");
  return JSON.parse(raw) as GroupConfig;
}

export function groupContains(group: JestGroup, testName: string): boolean {
  return group.patterns.some((pattern) => pattern.includes(testName));
}
