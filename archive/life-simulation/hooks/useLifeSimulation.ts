/**
 * Life Simulation Hook
 * 
 * Hook for managing life simulation features including avatar creation,
 * life events, career progression, relationships, health tracking,
 * financial management, and achievement systems.
 */

import { useState, useEffect, useCallback } from 'react';

// Types
export interface Avatar {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  appearance: {
    hairColor: string;
    eyeColor: string;
    skinTone: string;
    height: number;
    build: 'slim' | 'average' | 'athletic' | 'heavy';
  };
  personality: {
    traits: string[];
    interests: string[];
    skills: string[];
  };
  stats: {
    health: number;
    happiness: number;
    intelligence: number;
    social: number;
    creativity: number;
    energy: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LifeEvent {
  id: string;
  type: 'career' | 'relationship' | 'health' | 'education' | 'financial' | 'social' | 'achievement' | 'random';
  title: string;
  description: string;
  impact: {
    health?: number;
    happiness?: number;
    intelligence?: number;
    social?: number;
    creativity?: number;
    energy?: number;
    money?: number;
  };
  choices?: Array<{
    id: string;
    text: string;
    impact: LifeEvent['impact'];
    requirements?: Record<string, number>;
  }>;
  timestamp: Date;
  resolved?: boolean;
  selectedChoice?: string;
}

export interface Career {
  id: string;
  name: string;
  category: 'business' | 'technology' | 'creative' | 'healthcare' | 'education' | 'service' | 'skilled_trade';
  level: number;
  experience: number;
  salary: number;
  requirements: {
    education?: string;
    skills?: string[];
    minimumAge?: number;
  };
  progression: Array<{
    level: number;
    title: string;
    salary: number;
    requirements: Career['requirements'];
  }>;
}

export interface Relationship {
  id: string;
  type: 'family' | 'friend' | 'romantic' | 'colleague' | 'acquaintance';
  name: string;
  age: number;
  relationshipLevel: number;
  traits: string[];
  interests: string[];
  history: Array<{
    type: 'meeting' | 'event' | 'conversation' | 'conflict' | 'support';
    description: string;
    impact: number;
    timestamp: Date;
  }>;
  status: 'active' | 'inactive' | 'ended';
  createdAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'career' | 'relationship' | 'health' | 'financial' | 'education' | 'social' | 'lifestyle';
  requirements: Record<string, number>;
  progress: number;
  completed: boolean;
  unlockedAt?: Date;
  reward: {
    points: number;
    title?: string;
    statBonus?: Partial<Avatar['stats']>;
  };
}

export interface LifeStats {
  totalEvents: number;
  careerChanges: number;
  relationshipsFormed: number;
  achievementsUnlocked: number;
  moneyEarned: number;
  moneySpent: number;
  educationCompleted: string[];
  skillsLearned: string[];
  lifeYears: number;
}

export interface UseLifeSimulationReturn {
  // State
  avatar: Avatar | null;
  lifeEvents: LifeEvent[];
  currentCareer: Career | null;
  relationships: Relationship[];
  achievements: Achievement[];
  lifeStats: LifeStats;
  loading: boolean;
  error: string | null;

  // Avatar Management
  createAvatar: (avatar: Omit<Avatar, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAvatar: (updates: Partial<Avatar>) => Promise<void>;
  updateStats: (stats: Partial<Avatar['stats']>) => Promise<void>;

  // Life Events
  generateLifeEvent: () => Promise<void>;
  resolveEvent: (eventId: string, choiceId: string) => Promise<void>;
  skipEvent: (eventId: string) => Promise<void>;

  // Career Management
  startCareer: (careerId: string) => Promise<void>;
  changeCareer: (careerId: string) => Promise<void>;
  promoteCareer: () => Promise<void>;
  quitCareer: () => Promise<void>;

  // Relationship Management
  createRelationship: (relationship: Omit<Relationship, 'id' | 'createdAt' | 'history'>) => Promise<void>;
  updateRelationship: (id: string, updates: Partial<Relationship>) => Promise<void>;
  endRelationship: (id: string) => Promise<void>;

  // Achievement Management
  checkAchievements: () => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;

  // Utility
  ageUp: () => Promise<void>;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  resetGame: () => Promise<void>;
}

// Mock data
const mockAvatar: Avatar = {
  id: '1',
  name: 'Alex Johnson',
  age: 25,
  gender: 'other',
  appearance: {
    hairColor: 'brown',
    eyeColor: 'blue',
    skinTone: 'medium',
    height: 175,
    build: 'average',
  },
  personality: {
    traits: ['ambitious', 'creative', 'friendly'],
    interests: ['technology', 'music', 'travel'],
    skills: ['programming', 'guitar', 'languages'],
  },
  stats: {
    health: 85,
    happiness: 75,
    intelligence: 90,
    social: 80,
    creativity: 85,
    energy: 70,
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

const mockCareers: Career[] = [
  {
    id: '1',
    name: 'Software Developer',
    category: 'technology',
    level: 1,
    experience: 0,
    salary: 75000,
    requirements: {
      education: 'Bachelor Degree',
      skills: ['programming'],
      minimumAge: 22,
    },
    progression: [
      { level: 1, title: 'Junior Developer', salary: 75000, requirements: { education: 'Bachelor Degree', skills: ['programming'] } },
      { level: 2, title: 'Developer', salary: 95000, requirements: { education: 'Bachelor Degree', skills: ['programming', 'databases'] } },
      { level: 3, title: 'Senior Developer', salary: 120000, requirements: { education: 'Bachelor Degree', skills: ['programming', 'databases', 'architecture'] } },
    ],
  },
  {
    id: '2',
    name: 'Graphic Designer',
    category: 'creative',
    level: 1,
    experience: 0,
    salary: 55000,
    requirements: {
      skills: ['design', 'creativity'],
      minimumAge: 20,
    },
    progression: [
      { level: 1, title: 'Junior Designer', salary: 55000, requirements: { skills: ['design', 'creativity'] } },
      { level: 2, title: 'Designer', salary: 70000, requirements: { skills: ['design', 'creativity', 'branding'] } },
      { level: 3, title: 'Senior Designer', salary: 85000, requirements: { skills: ['design', 'creativity', 'branding', 'leadership'] } },
    ],
  },
];

const mockEvents: LifeEvent[] = [
  {
    id: '1',
    type: 'career',
    title: 'Job Opportunity',
    description: 'A tech company is offering you a position with better pay and benefits.',
    impact: {
      happiness: 10,
      money: 15000,
    },
    choices: [
      {
        id: 'accept',
        text: 'Accept the offer',
        impact: { happiness: 10, money: 15000, social: 5 },
      },
      {
        id: 'decline',
        text: 'Decline and stay current',
        impact: { happiness: -5, social: -2 },
      },
    ],
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'relationship',
    title: 'New Friend',
    description: 'You meet someone interesting at a local event.',
    impact: {
      social: 8,
      happiness: 5,
    },
    choices: [
      {
        id: 'befriend',
        text: 'Get to know them',
        impact: { social: 8, happiness: 5 },
      },
      {
        id: 'ignore',
        text: 'Keep to yourself',
        impact: { social: -2 },
      },
    ],
    timestamp: new Date(),
  },
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Create your first avatar',
    category: 'lifestyle',
    requirements: { avatarCreated: 1 },
    progress: 100,
    completed: true,
    unlockedAt: new Date('2024-01-01'),
    reward: { points: 100 },
  },
  {
    id: '2',
    title: 'Career Starter',
    description: 'Get your first job',
    category: 'career',
    requirements: { careerStarted: 1 },
    progress: 0,
    completed: false,
    reward: { points: 250, statBonus: { happiness: 5 } },
  },
  {
    id: '3',
    title: 'Social Butterfly',
    description: 'Form 10 relationships',
    category: 'social',
    requirements: { relationships: 10 },
    progress: 20,
    completed: false,
    reward: { points: 300, statBonus: { social: 10 } },
  },
];

export function useLifeSimulation(userId: string): UseLifeSimulationReturn {
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [currentCareer, setCurrentCareer] = useState<Career | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [lifeStats, setLifeStats] = useState<LifeStats>({
    totalEvents: 0,
    careerChanges: 0,
    relationshipsFormed: 0,
    achievementsUnlocked: 0,
    moneyEarned: 0,
    moneySpent: 0,
    educationCompleted: [],
    skillsLearned: [],
    lifeYears: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    loadGame();
  }, [userId]);

  // Avatar Management
  const createAvatar = useCallback(async (newAvatar: Omit<Avatar, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const createdAvatar: Avatar = {
        ...newAvatar,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAvatar(createdAvatar);
      
      // Check for avatar creation achievement
      const avatarAchievement = achievements.find(a => a.id === '1');
      if (avatarAchievement && !avatarAchievement.completed) {
        unlockAchievement('1');
      }
    } catch (err) {
      setError('Failed to create avatar');
    } finally {
      setLoading(false);
    }
  }, [achievements]);

  const updateAvatar = useCallback(async (updates: Partial<Avatar>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      if (avatar) {
        setAvatar({ ...avatar, ...updates, updatedAt: new Date() });
      }
    } catch (err) {
      setError('Failed to update avatar');
    } finally {
      setLoading(false);
    }
  }, [avatar]);

  const updateStats = useCallback(async (stats: Partial<Avatar['stats']>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      if (avatar) {
        const updatedStats = { ...avatar.stats, ...stats };
        setAvatar({ ...avatar, stats: updatedStats, updatedAt: new Date() });
        checkAchievements();
      }
    } catch (err) {
      setError('Failed to update stats');
    } finally {
      setLoading(false);
    }
  }, [avatar]);

  // Life Events
  const generateLifeEvent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      const newEvent: LifeEvent = {
        ...randomEvent,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      setLifeEvents(prev => [...prev, newEvent]);
      setLifeStats(prev => ({ ...prev, totalEvents: prev.totalEvents + 1 }));
    } catch (err) {
      setError('Failed to generate life event');
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveEvent = useCallback(async (eventId: string, choiceId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLifeEvents(prev => prev.map(event => {
        if (event.id === eventId) {
          const choice = event.choices?.find(c => c.id === choiceId);
          return {
            ...event,
            resolved: true,
            selectedChoice: choiceId,
          };
        }
        return event;
      }));

      // Apply choice impact to avatar stats
      const event = lifeEvents.find(e => e.id === eventId);
      const choice = event?.choices?.find(c => c.id === choiceId);
      if (choice && choice.impact && avatar) {
        updateStats(choice.impact);
      }
    } catch (err) {
      setError('Failed to resolve event');
    } finally {
      setLoading(false);
    }
  }, [lifeEvents, avatar, updateStats]);

  const skipEvent = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      setLifeEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, resolved: true } : event
      ));
    } catch (err) {
      setError('Failed to skip event');
    } finally {
      setLoading(false);
    }
  }, []);

  // Career Management
  const startCareer = useCallback(async (careerId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const career = mockCareers.find(c => c.id === careerId);
      if (career) {
        setCurrentCareer(career);
        setLifeStats(prev => ({ ...prev, careerChanges: prev.careerChanges + 1 }));
        
        // Check for career achievement
        const careerAchievement = achievements.find(a => a.id === '2');
        if (careerAchievement && !careerAchievement.completed) {
          unlockAchievement('2');
        }
      }
    } catch (err) {
      setError('Failed to start career');
    } finally {
      setLoading(false);
    }
  }, [achievements]);

  const changeCareer = useCallback(async (careerId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const career = mockCareers.find(c => c.id === careerId);
      if (career) {
        setCurrentCareer(career);
        setLifeStats(prev => ({ ...prev, careerChanges: prev.careerChanges + 1 }));
      }
    } catch (err) {
      setError('Failed to change career');
    } finally {
      setLoading(false);
    }
  }, []);

  const promoteCareer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      if (currentCareer && currentCareer.level < currentCareer.progression.length) {
        const nextLevel = currentCareer.progression.find(p => p.level === currentCareer.level + 1);
        if (nextLevel) {
          setCurrentCareer({
            ...currentCareer,
            level: nextLevel.level,
            salary: nextLevel.salary,
          });
        }
      }
    } catch (err) {
      setError('Failed to promote career');
    } finally {
      setLoading(false);
    }
  }, [currentCareer]);

  const quitCareer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentCareer(null);
    } catch (err) {
      setError('Failed to quit career');
    } finally {
      setLoading(false);
    }
  }, []);

  // Relationship Management
  const createRelationship = useCallback(async (newRelationship: Omit<Relationship, 'id' | 'createdAt' | 'history'>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const createdRelationship: Relationship = {
        ...newRelationship,
        id: Date.now().toString(),
        createdAt: new Date(),
        history: [],
      };
      setRelationships(prev => [...prev, createdRelationship]);
      setLifeStats(prev => ({ ...prev, relationshipsFormed: prev.relationshipsFormed + 1 }));
      
      // Update social achievement progress
      checkAchievements();
    } catch (err) {
      setError('Failed to create relationship');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRelationship = useCallback(async (id: string, updates: Partial<Relationship>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setRelationships(prev => prev.map(rel => 
        rel.id === id ? { ...rel, ...updates } : rel
      ));
    } catch (err) {
      setError('Failed to update relationship');
    } finally {
      setLoading(false);
    }
  }, []);

  const endRelationship = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setRelationships(prev => prev.map(rel => 
        rel.id === id ? { ...rel, status: 'ended' } : rel
      ));
    } catch (err) {
      setError('Failed to end relationship');
    } finally {
      setLoading(false);
    }
  }, []);

  // Achievement Management
  const checkAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAchievements(prev => prev.map(achievement => {
        if (achievement.completed) return achievement;
        
        let progress = 0;
        switch (achievement.id) {
          case '2': // Career Starter
            progress = currentCareer ? 100 : 0;
            break;
          case '3': // Social Butterfly
            progress = Math.min((relationships.length / 10) * 100, 100);
            break;
        }
        
        return { ...achievement, progress };
      }));
    } catch (err) {
      setError('Failed to check achievements');
    } finally {
      setLoading(false);
    }
  }, [currentCareer, relationships]);

  const unlockAchievement = useCallback(async (achievementId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAchievements(prev => prev.map(achievement => {
        if (achievement.id === achievementId && !achievement.completed) {
          return {
            ...achievement,
            completed: true,
            unlockedAt: new Date(),
          };
        }
        return achievement;
      }));
      
      setLifeStats(prev => ({ ...prev, achievementsUnlocked: prev.achievementsUnlocked + 1 }));
      
      // Apply achievement rewards
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement?.reward.statBonus && avatar) {
        updateStats(achievement.reward.statBonus);
      }
    } catch (err) {
      setError('Failed to unlock achievement');
    } finally {
      setLoading(false);
    }
  }, [achievements, avatar, updateStats]);

  // Utility Functions
  const ageUp = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (avatar) {
        const newAge = avatar.age + 1;
        setAvatar({ ...avatar, age: newAge, updatedAt: new Date() });
        setLifeStats(prev => ({ ...prev, lifeYears: prev.lifeYears + 1 }));
        
        // Generate age-up event
        generateLifeEvent();
      }
    } catch (err) {
      setError('Failed to age up');
    } finally {
      setLoading(false);
    }
  }, [avatar, generateLifeEvent]);

  const saveGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Game saved successfully');
    } catch (err) {
      setError('Failed to save game');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAvatar(mockAvatar);
      setLifeEvents([]);
      setCurrentCareer(null);
      setRelationships([]);
      setAchievements(mockAchievements);
    } catch (err) {
      setError('Failed to load game');
    } finally {
      setLoading(false);
    }
  }, []);

  const resetGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAvatar(null);
      setLifeEvents([]);
      setCurrentCareer(null);
      setRelationships([]);
      setAchievements(mockAchievements.filter(a => a.id === '1')); // Keep only first achievement
      setLifeStats({
        totalEvents: 0,
        careerChanges: 0,
        relationshipsFormed: 0,
        achievementsUnlocked: 1,
        moneyEarned: 0,
        moneySpent: 0,
        educationCompleted: [],
        skillsLearned: [],
        lifeYears: 0,
      });
    } catch (err) {
      setError('Failed to reset game');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    avatar,
    lifeEvents,
    currentCareer,
    relationships,
    achievements,
    lifeStats,
    loading,
    error,

    // Avatar Management
    createAvatar,
    updateAvatar,
    updateStats,

    // Life Events
    generateLifeEvent,
    resolveEvent,
    skipEvent,

    // Career Management
    startCareer,
    changeCareer,
    promoteCareer,
    quitCareer,

    // Relationship Management
    createRelationship,
    updateRelationship,
    endRelationship,

    // Achievement Management
    checkAchievements,
    unlockAchievement,

    // Utility
    ageUp,
    saveGame,
    loadGame,
    resetGame,
  };
}
