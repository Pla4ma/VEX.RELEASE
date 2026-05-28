import { hexColors0D } from "./hex-colors-0-d";
import { hexColorsDF } from "./hex-colors-d-ff";
import { rgbaColors } from "./rgba-colors";

export const launchColors = {
  ...hexColors0D,
  ...hexColorsDF,
  ...rgbaColors,
} as const;
