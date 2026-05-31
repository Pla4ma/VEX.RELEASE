import { v4 as uuidv4 } from '../../utils/uuid';
import type { SessionPreset } from '../types';
import { ValidateSessionPresetSchema } from '../validation/schemas';
import { createDebugger } from '../../utils/debug';
import { DEFAULT_PRESETS } from './default-presets';
import { buildExportPresets, buildImportPresets } from './preset-io';
import {
  buildCustomPresetData,
  loadUserPresetsFromStorage,
  saveUserPresetsToStorage,
  initializeSystemPresetsData,
} from './preset-manager-helpers';

const debug = createDebugger('session:presets');

export class PresetService {
  private userId: string | null = null;
  private userPresets: Map<string, SessionPreset> = new Map();
  private static initialized = false;
  private static systemPresets: SessionPreset[] = [];

  constructor(userId?: string) {
    this.userId = userId ?? null;
    this.initializeSystemPresets();
    this.loadUserPresets();
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.loadUserPresets();
    debug.info('PresetService user set: %s', userId);
  }

  private initializeSystemPresets(): void {
    if (PresetService.initialized) {
      return;
    }
    PresetService.systemPresets = initializeSystemPresetsData(DEFAULT_PRESETS);
    PresetService.initialized = true;
    debug.info(
      'Initialized %d system presets',
      PresetService.systemPresets.length,
    );
  }

  async createPreset(
    presetData: Omit<
      SessionPreset,
      'id' | 'createdAt' | 'updatedAt' | 'userId'
    >,
  ): Promise<SessionPreset> {
    if (!this.userId) {
      throw new Error('PresetService: No user set');
    }
    const now = Date.now();
    const preset: SessionPreset = {
      ...presetData,
      id: uuidv4(),
      userId: this.userId,
      createdAt: now,
      updatedAt: now,
    };
    const validation = ValidateSessionPresetSchema.safeParse(preset);
    if (!validation.success) {
      throw new Error(`Invalid preset data: ${validation.error.message}`);
    }
    this.userPresets.set(preset.id, preset);
    await this.saveUserPresets();
    debug.info('Created preset: %s (%s)', preset.name, preset.id);
    return preset;
  }

  async updatePreset(
    presetId: string,
    updates: Partial<Omit<SessionPreset, 'id' | 'createdAt' | 'userId'>>,
  ): Promise<SessionPreset> {
    if (!this.userId) {
      throw new Error('PresetService: No user set');
    }
    const existing = this.userPresets.get(presetId);
    if (!existing) {
      throw new Error(`Preset not found: ${presetId}`);
    }
    const updated: SessionPreset = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    const validation = ValidateSessionPresetSchema.safeParse(updated);
    if (!validation.success) {
      throw new Error(`Invalid preset data: ${validation.error.message}`);
    }
    this.userPresets.set(presetId, updated);
    await this.saveUserPresets();
    debug.info('Updated preset: %s', presetId);
    return updated;
  }

  async deletePreset(presetId: string): Promise<void> {
    if (!this.userId) {
      throw new Error('PresetService: No user set');
    }
    const existing = this.userPresets.get(presetId);
    if (!existing) {
      throw new Error(`Preset not found: ${presetId}`);
    }
    this.userPresets.delete(presetId);
    await this.saveUserPresets();
    debug.info('Deleted preset: %s', presetId);
  }

  getPresetById(presetId: string): SessionPreset | undefined {
    const userPreset = this.userPresets.get(presetId);
    if (userPreset) {
      return userPreset;
    }
    return PresetService.systemPresets.find((p) => p.id === presetId);
  }

  getAllPresets(): SessionPreset[] {
    return [
      ...PresetService.systemPresets,
      ...Array.from(this.userPresets.values()),
    ];
  }

  getSystemPresets(): SessionPreset[] {
    return [...PresetService.systemPresets];
  }

  getUserPresets(): SessionPreset[] {
    return Array.from(this.userPresets.values());
  }

  getPresetsByCategory(category: string): SessionPreset[] {
    return this.getAllPresets().filter((p) => p.category === category);
  }

  getDefaultPreset(): SessionPreset {
    return PresetService.systemPresets[1]!;
  }

  getCategories(): string[] {
    const allPresets = this.getAllPresets();
    const categories = new Set(
      allPresets.map((p) => p.category).filter(Boolean),
    );
    return Array.from(categories) as string[];
  }

  createCustomPreset(config: {
    name: string;
    duration: number;
    breakDuration?: number;
    intervals?: number;
    category?: string;
    strictMode?: boolean;
    dndEnabled?: boolean;
    description?: string;
  }): Promise<SessionPreset> {
    return this.createPreset(buildCustomPresetData(config));
  }

  private async loadUserPresets(): Promise<void> {
    if (!this.userId) {
      return;
    }
    this.userPresets = await loadUserPresetsFromStorage(this.userId);
  }

  private async saveUserPresets(): Promise<void> {
    if (!this.userId) {
      return;
    }
    await saveUserPresetsToStorage(this.userId, this.userPresets);
  }

  exportPresets(): string {
    return buildExportPresets(this.userPresets);
  }

  async importPresets(jsonData: string): Promise<number> {
    return buildImportPresets(
      jsonData,
      this.userId!,
      this.userPresets,
      (id, updates) => this.updatePreset(id, updates),
      (data) => this.createPreset(data),
    );
  }
}

export { getPresetService } from './preset-manager-singleton';
