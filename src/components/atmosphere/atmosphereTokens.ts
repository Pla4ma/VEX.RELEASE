import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

export type AtmosphereVariant = 'home' | 'focus' | 'progress' | 'profile' | 'default';

interface MeshConfig {
  columns: number;
  rows: number;
  points: number[][];
  colors: string[];
}

const { background } = vexLightGlass;

const MESH_3X3_POINTS: number[][] = [
  [0, 0],
  [0.5, 0],
  [1, 0],
  [0, 0.5],
  [0.5, 0.5],
  [1, 0.5],
  [0, 1],
  [0.5, 1],
  [1, 1],
];

/**
 * Per-variant mesh gradient configs.
 * Colors are drawn from the VEX light-glass palette — mint, pearl, fire, cyan.
 * All meshes use a 3×3 grid (9 vertices) for smooth blending without excess GPU cost.
 */
export const atmosphereMesh: Record<AtmosphereVariant, MeshConfig> = {
  home: {
    columns: 3,
    rows: 3,
    points: MESH_3X3_POINTS,
    colors: [
      background.pageTop,
      background.atmosphericPearl,
      background.pageTop,
      background.atmosphericMint,
      background.pageMid,
      background.atmosphericCyan,
      background.pageMid,
      background.atmosphericMint,
      background.pageBottom,
    ],
  },
  focus: {
    columns: 3,
    rows: 3,
    points: MESH_3X3_POINTS,
    colors: [
      background.pageTop,
      background.pageTop,
      background.atmosphericPearl,
      background.pageMid,
      background.pageMid,
      background.atmosphericPearl,
      background.pageBottom,
      background.pageMid,
      background.pageBottom,
    ],
  },
  progress: {
    columns: 3,
    rows: 3,
    points: MESH_3X3_POINTS,
    colors: [
      background.pageTop,
      background.atmosphericPearl,
      background.atmosphericFire,
      background.atmosphericMint,
      background.pageMid,
      background.atmosphericCyan,
      background.pageBottom,
      background.atmosphericMint,
      background.pageBottom,
    ],
  },
  profile: {
    columns: 3,
    rows: 3,
    points: MESH_3X3_POINTS,
    colors: [
      background.atmosphericPearl,
      background.atmosphericFire,
      background.pageTop,
      background.atmosphericMint,
      background.pageMid,
      background.atmosphericCyan,
      background.pageMid,
      background.atmosphericMint,
      background.pageBottom,
    ],
  },
  default: {
    columns: 3,
    rows: 3,
    points: MESH_3X3_POINTS,
    colors: [
      background.pageTop,
      background.atmosphericPearl,
      background.pageTop,
      background.pageMid,
      background.pageMid,
      background.atmosphericPearl,
      background.pageBottom,
      background.pageMid,
      background.pageBottom,
    ],
  },
};
