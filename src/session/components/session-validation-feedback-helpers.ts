/**
 * SessionValidationFeedback — Message formatting and shared styles.
 */

import { createSheet } from '@/shared/ui/create-sheet';


export function formatFieldName(field: string): string {
  return field
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const styles = createSheet({
  container: {
    width: '100%',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  compactIcon: {
    fontSize: 14,
  },
  errorGroup: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  bullet: {
    marginRight: 8,
    color: 'inherit',
  },
});
