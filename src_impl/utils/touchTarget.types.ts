/**
 * Touch target props for Pressable/Touchable components
 */
export interface TouchTargetProps {
    /** Element width */
    width: number;
    /** Element height */
    height: number;
    /** Additional hitSlop (will be merged) */
    additionalHitSlop?: Insets;
}
