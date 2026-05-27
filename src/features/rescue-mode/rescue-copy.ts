import type { Lane } from "../lane-engine/types";
import type { RescueReason } from "./schemas";

export const LANE_RESCUE_COPY: Record<Lane, Record<RescueReason, string>> = {
  student: {
    too_big: "Open notes and review one weak section for 8 minutes.",
    tired: "Review one page of notes. No pressure beyond that.",
    distracted: "Put the phone away. One study block, 8 minutes.",
    anxious: "Open your notes. Just look. No quiz. 8 minutes.",
    unclear: "Open notes and review one weak section for 8 minutes.",
    no_time: "Review one topic. 5 minutes. That is enough.",
  },
  game_like: {
    too_big: "Recovery encounter: survive 10 clean minutes.",
    tired: "A short run. No boss. Just move for 10 minutes.",
    distracted: "One encounter. 10 minutes. Turn everything else off.",
    anxious: "Recovery encounter: survive 10 clean minutes.",
    unclear: "Recovery encounter: survive 10 clean minutes.",
    no_time: "Mini sprint. 5 minutes. Just one encounter.",
  },
  deep_creative: {
    too_big: "Re-enter the project for 7 minutes. Only identify the next move.",
    tired: "Open the project. Look at one file. 7 minutes max.",
    distracted:
      "Re-enter the project for 7 minutes. Only identify the next move.",
    anxious: "Re-enter the project for 7 minutes. Only identify the next move.",
    unclear: "Name the next concrete step. That is the session.",
    no_time: "7 minutes. Just the next move. Nothing else.",
  },
  minimal_normal: {
    too_big: "Do 5 minutes. Stop cleanly if needed.",
    tired: "Do 5 minutes. Stop cleanly if needed.",
    distracted: "Do 5 minutes. Stop cleanly if needed.",
    anxious: "Do 5 minutes. Stop cleanly if needed.",
    unclear: "Do 5 minutes. Stop cleanly if needed.",
    no_time: "Do 5 minutes. Stop cleanly if needed.",
  },
};
