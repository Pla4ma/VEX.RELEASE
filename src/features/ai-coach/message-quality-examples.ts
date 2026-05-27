import { MessageQualityElements } from "./message-quality-schema";

export const APPROVED_MESSAGE_EXAMPLES = [
  {
    category: "STREAK_RISK",
    content:
      "Your strongest sessions this week started after 8 PM. Try a 25-minute Recovery session tonight to protect your 5-day streak without overreaching.",
    expectedElements: [
      MessageQualityElements.REASON,
      MessageQualityElements.CONFIDENCE_LEVEL,
      MessageQualityElements.OBSERVED_BEHAVIOR,
      MessageQualityElements.SPECIFIC_RECOMMENDATION,
    ],
  },
  {
    category: "SESSION_SUGGESTION",
    content:
      "Based on your 92% average quality in evening sessions, a 30-minute Challenging session at 7 PM would likely maintain your momentum.",
    expectedElements: [
      MessageQualityElements.REASON,
      MessageQualityElements.CONFIDENCE_LEVEL,
      MessageQualityElements.OBSERVED_BEHAVIOR,
      MessageQualityElements.NEXT_ACTION,
    ],
  },
];

export const REJECTED_MESSAGE_EXAMPLES = [
  {
    category: "STREAK_RISK",
    content: "Keep going! You are doing great!",
    rejectionReasons: [
      "Generic pattern detected: keep going",
      "Generic pattern detected: you are doing great",
      "No specific user data referenced",
    ],
  },
  {
    category: "SESSION_SUGGESTION",
    content: "Try focusing more today.",
    rejectionReasons: [
      "Generic pattern detected: try focusing more",
      "Message too short (< 20 chars)",
      "No specific user data referenced",
    ],
  },
];
