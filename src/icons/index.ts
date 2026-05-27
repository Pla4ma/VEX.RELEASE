/**
 * Icon System Export
 */

// Types
export type {
  IconProps,
  IconButtonProps,
  IconRegistryEntry,
  IconCollection,
  IconSize,
  IconColor,
  IconStrokeWidth,
  IconVariant,
} from "./types";
export { ICON_SIZE_VALUES, ICON_STROKE_WIDTH_VALUES } from "./types";

// Registry
export {
  iconRegistry,
  getIcon,
  hasIcon,
  getIconNames,
  registerIcon,
  registerIcons,
} from "./IconRegistry";

// Components
export { Icon, IconButton, createIcon, createIconButton } from "./components";
