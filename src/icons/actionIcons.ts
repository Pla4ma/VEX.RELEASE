import type { IconCollection } from './types';

export const navigationIcons: IconCollection = {
  'chevron-right': {
    name: 'chevron-right',
    outline: 'M9 5l7 7-7 7',
    solid: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  },
  'chevron-left': {
    name: 'chevron-left',
    outline: 'M15 19l-7-7 7-7',
    solid: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
  },
  'chevron-down': {
    name: 'chevron-down',
    outline: 'M19 9l-7 7-7-7',
    solid: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
  },
  'chevron-up': {
    name: 'chevron-up',
    outline: 'M5 15l7-7 7 7',
    solid: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z',
  },
  'arrow-right': {
    name: 'arrow-right',
    outline: 'M14 5l7 7m0 0l-7 7m7-7H3',
    solid: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
  },
};

export const actionIconPaths: IconCollection = {
  edit: {
    name: 'edit',
    outline: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    solid: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  },
  delete: {
    name: 'delete',
    outline: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    solid: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  },
  check: {
    name: 'check',
    outline: 'M5 13l4 4L19 7',
    solid: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  },
  'check-circle': {
    name: 'check-circle',
    outline: 'M9 12l2 2 4-4 M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    solid: 'M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14.2l-4.2-4.2 1.4-1.4 2.8 2.8 5.8-5.8 1.4 1.4-7.2 7.2z',
  },
  plus: {
    name: 'plus',
    outline: 'M12 4v16m8-8H4',
    solid: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  },
  minus: { name: 'minus', outline: 'M20 12H4', solid: 'M19 13H5v-2h14v2z' },
  star: {
    name: 'star',
    outline: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    solid: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  },
  play: {
    name: 'play',
    outline: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    solid: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z',
  },
};

export { statusIcons } from './statusIcons';
export { miscIcons } from './miscIcons';
