export interface SocialNotification {
    type: SocialNotificationType;
    recipientUserId: string;
    actorUserId: string;
    actorName: string;
    data: Record<string, unknown>;
}

export type SocialNotificationType = 'FEED_REACTION' | 'FEED_COMMENT' | 'NEW_FOLLOWER' | 'SQUAD_INVITE' | 'RIVAL_CHALLENGE' | 'ACHIEVEMENT_UNLOCKED';
