import { getSupabaseClient } from "../../../config/supabase";
import {
  CoachMessageSchema,
  type CoachMessage,
  type MessageStatus,
} from "../schemas";
import { RepositoryError } from "./error";

const supabase = getSupabaseClient();

export async function createCoachMessage(
  message: CoachMessage,
): Promise<CoachMessage> {
  const { data, error } = await supabase
    .from("coach_messages")
    .insert({
      id: message.id,
      user_id: message.userId,
      persona_id: message.personaId,
      category: message.category,
      content: message.content,
      delivery_method: message.deliveryMethod,
      priority: message.priority,
      status: message.status,
      created_at: message.createdAt,
      scheduled_for: message.scheduledFor,
      delivered_at: message.deliveredAt,
      read_at: message.readAt,
      dismissed_at: message.dismissedAt,
      action_taken: message.actionTaken,
      action_taken_at: message.actionTakenAt,
    })
    .select()
    .single();
  if (error) {
    throw new RepositoryError("createCoachMessage", error);
  }
  return CoachMessageSchema.parse(data);
}

export async function fetchRecentMessages(
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<CoachMessage[]> {
  const { data, error } = await supabase
    .from("coach_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
  if (error) {
    throw new RepositoryError("fetchRecentMessages", error);
  }
  return CoachMessageSchema.array().parse(data || []);
}

export async function fetchUserMessages(
  userId: string,
  limit: number = 50,
  status?: MessageStatus,
): Promise<CoachMessage[]> {
  let query = supabase.from("coach_messages").select("*").eq("user_id", userId);
  if (status) {
    query = query.eq("status", status);
  }
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    throw new RepositoryError("fetchUserMessages", error);
  }
  return CoachMessageSchema.array().parse(data || []);
}

export async function fetchUndeliveredMessages(
  userId: string,
): Promise<CoachMessage[]> {
  const { data, error } = await supabase
    .from("coach_messages")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["SCHEDULED", "SENT"])
    .order("priority", { ascending: false })
    .order("scheduled_for", { ascending: true });
  if (error) {
    throw new RepositoryError("fetchUndeliveredMessages", error);
  }
  return CoachMessageSchema.array().parse(data || []);
}

export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus,
  timestamp?: number,
): Promise<CoachMessage> {
  const updates: Record<string, unknown> = { status };
  if (timestamp) {
    if (status === "DELIVERED") {
      updates.delivered_at = timestamp;
    }
    if (status === "READ") {
      updates.read_at = timestamp;
    }
    if (status === "DISMISSED") {
      updates.dismissed_at = timestamp;
    }
  }
  const { data, error } = await supabase
    .from("coach_messages")
    .update(updates)
    .eq("id", messageId)
    .select()
    .single();
  if (error) {
    throw new RepositoryError("updateMessageStatus", error);
  }
  return CoachMessageSchema.parse(data);
}

export async function markMessageAction(
  messageId: string,
  action: string,
  timestamp: number,
): Promise<CoachMessage> {
  const { data, error } = await supabase
    .from("coach_messages")
    .update({
      action_taken: action,
      action_taken_at: timestamp,
      status: "DISMISSED",
    })
    .eq("id", messageId)
    .select()
    .single();
  if (error) {
    throw new RepositoryError("markMessageAction", error);
  }
  return CoachMessageSchema.parse(data);
}

export async function markMessageRead(
  messageId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("coach_messages")
    .update({ status: "READ", read_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("user_id", userId);

  if (error) {
    throw new RepositoryError("markMessageRead", error);
  }
}

export async function dismissMessage(
  messageId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("coach_messages")
    .update({ status: "DISMISSED", dismissed_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("user_id", userId);

  if (error) {
    throw new RepositoryError("dismissMessage", error);
  }
}

export async function fetchCoachHistory(
  userId: string,
  limit: number = 100,
): Promise<{ messages: CoachMessage[]; mutedCategories: string[] }> {
  const { data, error } = await supabase
    .from("coach_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    throw new RepositoryError("fetchCoachHistory", error);
  }

  const messages = CoachMessageSchema.array().parse(data || []);

  const mutedCategories = messages
    .filter((m) => m.status === "DISMISSED")
    .map((m) => m.category)
    .filter((v, i, a) => a.indexOf(v) === i);

  return { messages, mutedCategories };
}
