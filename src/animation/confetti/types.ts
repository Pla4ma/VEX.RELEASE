/**
 * Confetti Types
 *
 * Types and interfaces for the confetti celebration component.
 */

export interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  shape: 'circle' | 'square' | 'triangle';
  delay: number;
}

export interface ConfettiCelebrationProps {
  active: boolean;
  particleCount?: number;
  duration?: number;
  onComplete?: () => void;
  colors?: string[];
  origin?: { x: number; y: number };
}
