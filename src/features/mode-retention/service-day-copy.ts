import type { Lane } from "../lane-engine/types";
import { MODE_RETENTION_MANIFEST } from "./copy";
import type { ModeDayCopy } from "./schemas";
import { normalizeLane } from "./service";

export function getModeDayCopy(lane: unknown, day: number): ModeDayCopy {
  const l = normalizeLane(lane);
  const manifest = MODE_RETENTION_MANIFEST[l];
  const day1Copy = manifest.day1Copy;
  const hookCopy = manifest.hookCopy;

  if (day === 0) {
    return {
      lane: l,
      day: 0,
      homeMessage: `VEX helps you ${l === "student" ? "study the right thing" : l === "game_like" ? "build momentum" : l === "deep_creative" ? "pick up where you left off" : "start one useful action"}.`,
      primaryCta: l === "student"
        ? "Start first study block"
        : l === "game_like"
          ? "Start first run"
          : l === "deep_creative"
            ? "Start first project session"
            : "Start first clean block",
      completionPayoff: manifest.returnReason,
      nextActionCopy: `Return tomorrow. ${hookCopy}`,
      returnReason: manifest.returnReason,
      sessionMinutes: l === "student" ? 15 : l === "game_like" ? 15 : l === "deep_creative" ? 20 : 10,
    };
  }

  if (day === 1) {
    return {
      lane: l,
      day: 1,
      homeMessage: day1Copy,
      primaryCta: l === "student"
        ? "Start 15-min study block"
        : l === "game_like"
          ? "Start 15-min run"
          : l === "deep_creative"
            ? "Continue project thread"
            : "Start 10-min block",
      completionPayoff: `Rhythm forming. ${manifest.returnReason}`,
      nextActionCopy: `Tomorrow VEX will show what you've built.`,
      returnReason: manifest.returnReason,
      sessionMinutes: 15,
    };
  }

  if (day === 3) {
    return {
      lane: l,
      day: 3,
      homeMessage: manifest.day3Memory,
      primaryCta: l === "student"
        ? "See your study pattern"
        : l === "game_like"
          ? "See your run pattern"
          : l === "deep_creative"
            ? "See your project path"
            : "See your rhythm",
      completionPayoff: `Three sessions. ${manifest.returnReason}`,
      nextActionCopy: `Keep going. ${hookCopy}`,
      returnReason: manifest.returnReason,
      sessionMinutes: l === "student" ? 20 : l === "game_like" ? 15 : l === "deep_creative" ? 25 : 10,
    };
  }

  if (day === 7) {
    return {
      lane: l,
      day: 7,
      homeMessage: manifest.day7Intelligence,
      primaryCta: l === "student"
        ? "See study intelligence"
        : l === "game_like"
          ? "See run intelligence"
          : l === "deep_creative"
            ? "See project continuity map"
            : "See your week pattern",
      completionPayoff: `One week of ${l === "student" ? "study" : l === "game_like" ? "run" : l === "deep_creative" ? "project" : "clean"} data. ${manifest.returnReason}`,
      nextActionCopy: `Week 2 starts tomorrow. ${hookCopy}`,
      returnReason: manifest.returnReason,
      sessionMinutes: l === "student" ? 25 : l === "game_like" ? 20 : l === "deep_creative" ? 30 : 15,
    };
  }

  return {
    lane: l,
    day,
    homeMessage: hookCopy,
    primaryCta: "Start session",
    completionPayoff: manifest.returnReason,
    nextActionCopy: `Return tomorrow. ${hookCopy}`,
    returnReason: manifest.returnReason,
    sessionMinutes: 15,
  };
}
