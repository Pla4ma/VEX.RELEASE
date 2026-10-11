import type { IconCollection, IconRegistryEntry } from './types';
import { appIcons } from './appIcons';
import { navigationIcons, actionIconPaths, statusIcons, miscIcons } from './actionIcons';
import { socialIcons } from './socialIcons';

export const iconRegistry: IconCollection = {
  ...appIcons,
  ...navigationIcons,
  ...actionIconPaths,
  ...statusIcons,
  ...miscIcons,
  ...socialIcons,
};

const ICON_ALIASES: Readonly<Record<string, string>> = {
  accountability: 'shield',
  activity: 'chart',
  alert: 'exclamation-circle',
  'alert-circle': 'exclamation-circle',
  arrowDown: 'arrow-right',
  arrowUp: 'arrow-right',
  'bar-chart': 'chart',
  'bar-chart-2': 'chart',
  blocker: 'shield',
  bolt: 'target',
  'book-open': 'book',
  brain: 'sparkles',
  camera: 'circle',
  coach: 'chat-bubble',
  commit: 'check',
  compass: 'target',
  crosshair: 'target',
  crown: 'award',
  deep: 'diamond',
  document: 'file',
  download: 'upload',
  eye: 'circle',
  'file-pdf': 'file',
  'file-text': 'file',
  filter: 'move',
  fire: 'flame',
  focus: 'target',
  focused: 'target',
  gear: 'cog',
  gem: 'diamond',
  'help-circle': 'info',
  image: 'app',
  insight: 'sparkles',
  layout: 'grid',
  loader: 'refresh',
  loading: 'refresh',
  'message-circle': 'chat-bubble',
  'message-square': 'chat-bubble',
  mic: 'chat-bubble',
  mod: 'cog',
  monitor: 'grid',
  palette: 'diamond',
  'pen-tool': 'edit',
  'play-circle': 'play',
  pod: 'chat-bubble',
  presence: 'circle',
  pro: 'award',
  progress: 'chart',
  proof: 'shield',
  quiz: 'book',
  recovery: 'refresh',
  'refresh-cw': 'refresh',
  repeat: 'refresh',
  review: 'check',
  run: 'move',
  save: 'file',
  search: 'circle',
  'shield-check': 'shield',
  skull: 'exclamation-circle',
  sliders: 'setting',
  sprint: 'target',
  sun: 'circle',
  sword: 'target',
  text: 'file',
  trophy: 'award',
  type: 'file',
  users: 'user',
  vibrate: 'activity',
  'volume-2': 'activity',
  video: 'play',
  'wifi-off': 'exclamation-circle',
  x: 'close',
  close: 'close',
  zap: 'target',
  clock: 'timer',
};

const closeIcon: IconRegistryEntry = {
  name: 'close',
  outline: 'M6 6l12 12M18 6L6 18',
  solid: 'M6 6l12 12M18 6L6 18',
};

iconRegistry.close = closeIcon;
iconRegistry.x = { ...closeIcon, name: 'x' };
iconRegistry.pause = {
  name: 'pause',
  outline: 'M7 4v16M17 4v16',
  solid: 'M6 4h4v16H6V4zm8 0h4v16h-4V4z',
};

for (const [alias, target] of Object.entries(ICON_ALIASES)) {
  const targetEntry = iconRegistry[target];
  if (targetEntry && !iconRegistry[alias]) {
    iconRegistry[alias] = { ...targetEntry, name: alias };
  }
}

export function getIcon(name: string): IconRegistryEntry | undefined {
  return iconRegistry[name];
}

export function hasIcon(name: string): boolean {
  return name in iconRegistry;
}

export function getIconNames(): string[] {
  return Object.keys(iconRegistry);
}

export function registerIcon(name: string, entry: IconRegistryEntry): void {
  iconRegistry[name] = entry;
}

export function registerIcons(icons: IconCollection): void {
  Object.assign(iconRegistry, icons);
}
