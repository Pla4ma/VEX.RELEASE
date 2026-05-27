/**
 * Feed Events
 */

export interface FeedEventDefinitions {
  "feed:item_created": {
    itemId?: string;
    userId: string;
    type: string;
    content?: string;
    visibility?: string;
    metadata?: Record<string, unknown>;
  };
  "feed:item_viewed": { itemId: string; viewerId: string };
  "feed:reaction_added": {
    itemId: string;
    userId: string;
    reactionType: string;
  };
  "feed:reaction_removed": {
    itemId: string;
    userId: string;
    reactionType: string;
  };
  "feed:comment_added": { itemId: string; userId: string; commentId: string };
  "feed:item_shared": { itemId: string; userId: string };
}
