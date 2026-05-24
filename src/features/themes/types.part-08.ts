import type { LicenseType } from './types';

export interface AvatarState {
  name: string;
  border_color: string;
  background: string;
  color: string;
}

export interface ProgressTheme {
  base: ProgressBase;
  variants: ProgressVariant[];
  sizes: ProgressSize[];
  states: ProgressState[];
}

export interface ProgressBase {
  border_radius: string;
  height: string;
  background: string;
  transition: string;
}

export interface ProgressVariant {
  name: string;
  fill_color: string;
  background_color: string;
  striped: boolean;
}

export interface ProgressSize {
  name: string;
  height: string;
  border_radius: string;
}

export interface ProgressState {
  name: string;
  fill_color: string;
  background_color: string;
}

export interface TooltipTheme {
  base: TooltipBase;
  variants: TooltipVariant[];
  sizes: TooltipSize[];
  states: TooltipState[];
}

export interface TooltipBase {
  border_radius: string;
  background: string;
  color: string;
  shadow: string;
  transition: string;
}

export interface TooltipVariant {
  name: string;
  background: string;
  color: string;
  border_color: string;
}

export interface TooltipSize {
  name: string;
  padding: string;
  font_size: string;
  border_radius: string;
}

export interface TooltipState {
  name: string;
  opacity: string;
  transform: string;
}

export interface AnimationTheme {
  easings: AnimationEasing[];
  durations: AnimationDuration[];
  delays: AnimationDelay[];
  transitions: ComponentTransition[];
  keyframes: CustomKeyframe[];
}

export interface AnimationEasing {
  name: string;
  value: string;
  description: string;
}

export interface AnimationDuration {
  name: string;
  value: string;
  description: string;
}

export interface AnimationDelay {
  name: string;
  value: string;
  description: string;
}

export interface ComponentTransition {
  component: string;
  property: string;
  duration: string;
  easing: string;
  delay: string;
}

export interface CustomKeyframe {
  name: string;
  keyframes: KeyframeStep[];
  description: string;
}

export interface KeyframeStep {
  offset: number; // 0-1
  properties: Record<string, string>;
  easing?: string;
}

export interface ThemeMetadata {
  version: string;
  author: string;
  description: string;
  tags: string[];
  preview: ThemePreview;
  compatibility: ThemeCompatibility;
  usage: ThemeUsage;
  license: ThemeLicense;
}

export interface ThemePreview {
  primary: string;
  secondary: string;
  accent: string;
  screenshot?: string;
  thumbnail?: string;
  demo_url?: string;
}

export interface ThemeCompatibility {
  browsers: string[];
  platforms: string[];
  min_version: string;
  breaking_changes: string[];
}

export interface ThemeUsage {
  downloads: number;
  rating: number;
  reviews: number;
  categories: string[];
  use_cases: string[];
}

export interface ThemeLicense {
  type: LicenseType;
  commercial: boolean;
  attribution: boolean;
  modification: boolean;
  redistribution: boolean;
}

