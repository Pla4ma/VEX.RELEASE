import { createSheet } from '@/shared/ui/create-sheet';


export const avatarStyles = createSheet({
  container: { position: 'relative' },
  image: { resizeMode: 'cover' },
  initialsContainer: { justifyContent: 'center', alignItems: 'center' },
  initials: { textAlign: 'center' },
  status: { position: 'absolute' },
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
});
