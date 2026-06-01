import { createSheet } from '@/shared/ui/create-sheet';


export type BannerVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'gradient';

interface BannerThemeColors {
  primary: { 500: string };
  success: { DEFAULT: string };
  warning: { DEFAULT: string };
  error: { DEFAULT: string };
  info: { DEFAULT: string };
  background: { secondary: string };
  text: { primary: string };
  accent: { purple: string };
}

export function getVariantStyles(
  variant: BannerVariant,
  colors: BannerThemeColors,
) {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.primary[500],
        textColor: '#ffffff',
        iconColor: '#ffffff',
        buttonVariant: 'secondary' as const,
      };
    case 'success':
      return {
        backgroundColor: colors.success.DEFAULT,
        textColor: '#ffffff',
        iconColor: '#ffffff',
        buttonVariant: 'secondary' as const,
      };
    case 'warning':
      return {
        backgroundColor: colors.warning.DEFAULT,
        textColor: colors.text.primary,
        iconColor: colors.text.primary,
        buttonVariant: 'primary' as const,
      };
    case 'error':
      return {
        backgroundColor: colors.error.DEFAULT,
        textColor: '#ffffff',
        iconColor: '#ffffff',
        buttonVariant: 'secondary' as const,
      };
    case 'info':
      return {
        backgroundColor: colors.info.DEFAULT,
        textColor: '#ffffff',
        iconColor: '#ffffff',
        buttonVariant: 'secondary' as const,
      };
    case 'gradient':
      return {
        backgroundColor: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.accent.purple})`,
        textColor: '#ffffff',
        iconColor: '#ffffff',
        buttonVariant: 'secondary' as const,
      };
    default:
      return {
        backgroundColor: colors.background.secondary,
        textColor: colors.text.primary,
        iconColor: colors.primary[500],
        buttonVariant: 'primary' as const,
      };
  }
}

export const sizeStyles = {
  sm: {
    padding: 12,
    iconSize: 20,
    titleSize: 'h4' as const,
    descSize: 'caption' as const,
  },
  md: {
    padding: 16,
    iconSize: 24,
    titleSize: 'h3' as const,
    descSize: 'body' as const,
  },
  lg: {
    padding: 20,
    iconSize: 32,
    titleSize: 'h2' as const,
    descSize: 'body' as const,
  },
};

export const styles = createSheet({
  container: { overflow: 'hidden', position: 'relative' },
  fullWidth: { width: '100%' },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: 'cover',
    opacity: 0.3,
  },
  content: { flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: { justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1 },
  actions: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  dismissButton: { marginLeft: 8, padding: 4 },
});
