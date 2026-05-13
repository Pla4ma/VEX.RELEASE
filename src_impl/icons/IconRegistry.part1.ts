import type { IconCollection, IconRegistryEntry } from "./types";


export const iconRegistry: IconCollection = {
  ...appIcons,
  ...navigationIcons,
  ...actionIcons,
  ...statusIcons,
  ...socialIcons,
};

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