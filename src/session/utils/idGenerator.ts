/**
 * ID Generator
 *
 * Utility for generating unique session and component IDs.
 */

import { v4 } from '../../utils/uuid';

let lastTimestamp = 0;
let counter = 0;

export function generateSessionId(): string {
  const timestamp = Date.now();

  // If same millisecond, increment counter
  if (timestamp === lastTimestamp) {
    counter++;
  } else {
    counter = 0;
    lastTimestamp = timestamp;
  }

  // Format: sess_{timestamp}_{random}_{counter}
  const random = Math.floor(Math.random() * 10000).toString(36);
  const count = counter.toString(36).padStart(2, '0');

  return `sess_${timestamp.toString(36)}_${random}_${count}`;
}

export function generateShortId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}_${timestamp}_${random}`;
}

export function generateUUID(): string {
  return v4();
}

export const IdGenerator = {
  generateSessionId,
  generateShortId,
  generateUUID,
};

export default IdGenerator;
