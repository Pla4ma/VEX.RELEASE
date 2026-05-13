interface BeatCandidate {
    type: StoryBeatType;
    priority: number;
    condition: (input: GenerateStoryInput) => boolean;
    generator: (input: GenerateStoryInput) => Omit<StoryBeat, 'id' | 'sequenceOrder'>;
}

interface CalculatedStory {
    title: string;
    subtitle: string;
    overallEmotion: EmotionalArc;
    beats: StoryBeat[];
    nextSessionHooks: Array<{
        type: 'STREAK_AT_RISK' | 'BOSS_ALMOST_DEFEATED' | 'MILESTONE_APPROACHING' | 'TIER_UNLOCK_SOON' | 'PERFECT_RUN_CONTINUING' | 'COMEBACK_MOMENTUM';
        description: string;
        urgency: 'LOW' | 'MEDIUM' | 'HIGH';
        }>;
}
