import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "../../config/supabase";
import { type CoachMessage, type CoachState, type ComebackPlan, type SessionRecommendation } from "./schemas";
import { COACH_QUERY_KEYS } from "./hooks-enhanced";
import { createDebugger } from "../../utils/debug";


export function useRealtimeCoach(userId: string) {
  useRealtimeCoachMessages(userId);
  useRealtimeCoachState(userId);
  useRealtimeComebackPlan(userId);
  useRealtimeRecommendations(userId);
}