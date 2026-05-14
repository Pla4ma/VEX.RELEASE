import { capture } from '../../shared/analytics/analytics-service';

export function trackCharacterRelationshipChanged(
  userId: string,
  sessionId: string,
  storyId: string,
  characterId: string,
  relationshipType: string,
  changeType: 'improved' | 'deteriorated' | 'transformed' | 'revealed' | 'ended',
  changedAt: Date,
  previousState: {
    level: number;
    nature: string;
    dynamics: string[];
  },
  currentState: {
    level: number;
    nature: string;
    dynamics: string[];
  },
  catalyst: {
    event: string;
    choice: string;
    action: string;
    revelation: string;
  },
  implications: {
    story: string[];
    character: string[];
    user: string[];
    future: string[];
  },
): void {
  capture('session_story_character_relationship_changed', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    character_id: characterId,
    relationship_type: relationshipType,
    change_type: changeType,
    changed_at: changedAt.toISOString(),
    previous_state: previousState,
    current_state: currentState,
    catalyst,
    implications,
  });
}

export function trackCharacterDevelopment(
  userId: string,
  sessionId: string,
  storyId: string,
  characterId: string,
  developmentType: 'growth' | 'regression' | 'transformation' | 'revelation' | 'redemption',
  developedAt: Date,
  development: {
    aspect: string;
    change: string;
    significance: string;
    permanence: string;
  },
  catalyst: {
    events: string[];
    choices: string[];
    interactions: string[];
    revelations: string[];
  },
  impact: {
    character: string[];
    relationships: string[];
    story: string[];
    user: string[];
  },
  future: {
    potential: string[];
    limitations: string[];
    opportunities: string[];
  },
): void {
  capture('session_story_character_development', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    character_id: characterId,
    development_type: developmentType,
    developed_at: developedAt.toISOString(),
    development,
    catalyst,
    impact,
    future,
  });
}

// ============================================================================
// WORLD ANALYTICS
// ============================================================================

export function trackWorldElementDiscovered(
  userId: string,
  sessionId: string,
  storyId: string,
  elementId: string,
  elementType: 'location' | 'lore' | 'history' | 'culture' | 'technology' | 'magic' | 'secret',
  discoveredAt: Date,
  discovery: {
    method: string;
    context: string;
    significance: string;
    surprise: number;
  },
  element: {
    name: string;
    description: string;
    properties: string[];
    connections: string[];
    importance: string;
  },
  implications: {
    understanding: string[];
    navigation: string[];
    interaction: string[];
    story: string[];
  },
): void {
  capture('session_story_world_element_discovered', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    element_id: elementId,
    element_type: elementType,
    discovered_at: discoveredAt.toISOString(),
    discovery,
    element,
    implications,
  });
}

