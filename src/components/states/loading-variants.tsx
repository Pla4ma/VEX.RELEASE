/**
 * Spinner Loading Animation
 *
 * Simple circular spinner loading indicator.
 */
import { Skeleton } from '../ui/Skeleton';

export const Spinner: React.ComponentType<{ size: number; color: string }> = ({
  size,
  color,
}) => {
  return <Skeleton width={size} height={size} variant="circular" />;
};
