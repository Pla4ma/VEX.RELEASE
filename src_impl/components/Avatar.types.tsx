export interface AvatarProps {
    /** Image source URL or require() */
    source?: string | { uri: string };
    /** User name for initials */
    name?: string;
    /** Avatar size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    /** Online/away/offline status */
    status?: 'online' | 'away' | 'offline' | 'busy' | 'none';
    /** Notification badge count */
    badge?: number;
    /** Custom border color */
    borderColor?: string;
    /** Border width */
    borderWidth?: number;
    /** Click handler */
    onPress?: () => void;
    /** Custom styles */
    style?: StyleProp<ViewStyle>;
    /** Background color for initials */
    backgroundColor?: string;
    /** Shape variant */
    shape?: 'circle' | 'rounded' | 'square';
}
