/**
 * Themes Feature Types
 *
 * Types for UI themes, visual customization, and user experience personalization.
 */
export interface Theme {
    id: string;
    name: string;
    description: string;
    type: ThemeType;
    category: ThemeCategory;
    status: ThemeStatus;
    configuration: ThemeConfiguration;
    colors: ColorPalette;
    typography: TypographyTheme;
    spacing: SpacingTheme;
    components: ComponentTheme;
    animations: AnimationTheme;
    metadata: ThemeMetadata;
    created_at: Date;
    updated_at: Date;
}

export interface ThemeConfiguration {
    mode: ThemeMode;
    auto_switch: AutoSwitchConfig;
    accessibility: AccessibilityConfig;
    performance: PerformanceConfig;
    compatibility: CompatibilityConfig;
}

export interface AutoSwitchConfig {
    enabled: boolean;
    schedule: SwitchSchedule;
    conditions: SwitchCondition[];
    transition: TransitionConfig;
}

export interface SwitchSchedule {
    type: 'time_based' | 'sunrise_sunset' | 'user_activity';
    light_start?: string;
    dark_start?: string;
    timezone: string;
}

export interface SwitchCondition {
    type: ConditionType;
    trigger: string;
    value: unknown;
    operator: string;
}

export interface TransitionConfig {
    enabled: boolean;
    duration: number;
    easing: string;
    type: TransitionType;
}

export interface AccessibilityConfig {
    high_contrast: boolean;
    reduced_motion: boolean;
    screen_reader: boolean;
    keyboard_navigation: boolean;
    color_blind_support: ColorBlindSupport;
    font_scaling: FontScaling;
}

export interface ColorBlindSupport {
    enabled: boolean;
    type: ColorBlindType;
    adjustments: ColorAdjustment[];
}

export interface ColorAdjustment {
    color: string;
    adjusted: string;
    algorithm: string;
}

export interface FontScaling {
    enabled: boolean;
    base_size: number;
    scale_factor: number;
    max_size: number;
    min_size: number;
}

export interface PerformanceConfig {
    gpu_acceleration: boolean;
    reduced_animations: boolean;
    lazy_loading: boolean;
    cache_optimization: boolean;
    memory_limit: number;
}

export interface CompatibilityConfig {
    browsers: BrowserSupport[];
    platforms: PlatformSupport[];
    versions: VersionSupport[];
    fallbacks: ThemeFallback[];
}

export interface BrowserSupport {
    name: string;
    min_version: string;
    supported_features: string[];
    polyfills: string[];
}

export interface PlatformSupport {
    platform: PlatformType;
    supported: boolean;
    limitations: string[];
    alternatives: string[];
}

export interface VersionSupport {
    component: string;
    min_version: string;
    max_version?: string;
    breaking_changes: string[];
}

export interface ThemeFallback {
    condition: string;
    fallback_theme: string;
    reason: string;
}

export interface ColorPalette {
    primary: ColorScale;
    secondary: ColorScale;
    accent: ColorScale;
    neutral: ColorScale;
    semantic: SemanticColors;
    system: SystemColors;
    custom: CustomColor[];
}

export interface ColorScale {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
}

export interface SemanticColors {
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
    background: BackgroundColors;
    text: TextColors;
    border: BorderColors;
    interactive: InteractiveColors;
}

export interface BackgroundColors {
    default: string;
    paper: string;
    elevated: string;
    overlay: string;
    modal: string;
    tooltip: string;
}

export interface TextColors {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
    link: string;
    visited: string;
}

export interface BorderColors {
    default: string;
    focus: string;
    hover: string;
    active: string;
    disabled: string;
    error: string;
    success: string;
}

export interface InteractiveColors {
    button: ButtonColors;
    input: InputColors;
    link: LinkColors;
    selection: SelectionColors;
}

export interface ButtonColors {
    primary: ButtonStateColors;
    secondary: ButtonStateColors;
    tertiary: ButtonStateColors;
    danger: ButtonStateColors;
    ghost: ButtonStateColors;
}

export interface ButtonStateColors {
    default: string;
    hover: string;
    active: string;
    disabled: string;
    focus: string;
}

export interface InputColors {
    default: InputStateColors;
    error: InputStateColors;
    success: InputStateColors;
}

export interface InputStateColors {
    background: string;
    border: string;
    text: string;
    placeholder: string;
    focus: string;
}

export interface LinkColors {
    default: string;
    hover: string;
    active: string;
    visited: string;
    focus: string;
}

export interface SelectionColors {
    background: string;
    text: string;
    border: string;
}

export interface SystemColors {
    statusBar: string;
    navigationBar: string;
    tabBar: string;
    splash: string;
    loading: string;
    overlay: string;
}

export interface CustomColor {
    name: string;
    value: string;
    type: 'hex' | 'rgb' | 'hsl' | 'named';
    usage: string[];
    importance: 'low' | 'medium' | 'high';
}

export interface TypographyTheme {
    font_families: FontFamily[];
    font_sizes: FontSizes;
    font_weights: FontWeights;
    line_heights: LineHeights;
    letter_spacing: LetterSpacing;
    text_styles: TextStyle[];
}

export interface FontFamily {
    name: string;
    stack: string[];
    category: FontCategory;
    fallback: string;
    loading: FontLoading;
}

export interface FontLoading {
    strategy: LoadingStrategy;
    preload: boolean;
    fallback_display: FallbackDisplay;
}

export interface FontSizes {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
    '7xl': string;
    '8xl': string;
    '9xl': string;
}

export interface FontWeights {
    thin: number;
    extralight: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
}

export interface LineHeights {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
}

export interface LetterSpacing {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
}

export interface TextStyle {
    name: string;
    font_family: string;
    font_size: string;
    font_weight: number;
    line_height: number;
    letter_spacing: string;
    color: string;
    text_transform: TextTransform;
    text_decoration: TextDecoration;
    usage: string[];
}

export interface SpacingTheme {
    scale: SpacingScale;
    spacing: SpacingValues;
    layout: LayoutSpacing;
    components: ComponentSpacing;
}

export interface SpacingScale {
    base: number;
    ratio: number;
    unit: string;
}

export interface SpacingValues {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    8: string;
    10: string;
    12: string;
    16: string;
    20: string;
    24: string;
    32: string;
    40: string;
    48: string;
    56: string;
    64: string;
    80: string;
    96: string;
}

export interface LayoutSpacing {
    container: ContainerSpacing;
    section: SectionSpacing;
    grid: GridSpacing;
    flex: FlexSpacing;
}

export interface ContainerSpacing {
    padding: ContainerPadding;
    margin: ContainerMargin;
    gap: ContainerGap;
}

export interface ContainerPadding {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
}

export interface ContainerMargin {
    auto: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface ContainerGap {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface SectionSpacing {
    padding: SectionPadding;
    margin: SectionMargin;
}

export interface SectionPadding {
    top: string;
    bottom: string;
    left: string;
    right: string;
    x: string;
    y: string;
}

export interface SectionMargin {
    top: string;
    bottom: string;
    left: string;
    right: string;
    x: string;
    y: string;
}

export interface GridSpacing {
    gap: GridGap;
    padding: GridPadding;
}

export interface GridGap {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface GridPadding {
    cell: string;
    container: string;
}

export interface FlexSpacing {
    gap: FlexGap;
    padding: FlexPadding;
}

export interface FlexGap {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface FlexPadding {
    container: string;
    item: string;
}

export interface ComponentSpacing {
    button: ButtonSpacing;
    input: InputSpacing;
    card: CardSpacing;
    modal: ModalSpacing;
    navigation: NavigationSpacing;
    form: FormSpacing;
}

export interface ButtonSpacing {
    padding: ButtonPadding;
    margin: ButtonMargin;
    gap: ButtonGap;
}

export interface ButtonPadding {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface ButtonMargin {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface ButtonGap {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface InputSpacing {
    padding: InputPadding;
    margin: InputMargin;
    gap: InputGap;
}

export interface InputPadding {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface InputMargin {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface InputGap {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface CardSpacing {
    padding: CardPadding;
    margin: CardMargin;
    gap: CardGap;
}

export interface CardPadding {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface CardMargin {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface CardGap {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface ModalSpacing {
    padding: ModalPadding;
    margin: ModalMargin;
    gap: ModalGap;
}

export interface ModalPadding {
    container: string;
    content: string;
    header: string;
    footer: string;
}

export interface ModalMargin {
    container: string;
    overlay: string;
}

export interface ModalGap {
    header: string;
    content: string;
    footer: string;
}

export interface NavigationSpacing {
    padding: NavigationPadding;
    margin: NavigationMargin;
    gap: NavigationGap;
}

export interface NavigationPadding {
    container: string;
    item: string;
    submenu: string;
}

export interface NavigationMargin {
    container: string;
    item: string;
    submenu: string;
}

export interface NavigationGap {
    container: string;
    item: string;
    submenu: string;
}

export interface FormSpacing {
    padding: FormPadding;
    margin: FormMargin;
    gap: FormGap;
}

export interface FormPadding {
    container: string;
    field: string;
    group: string;
}

export interface FormMargin {
    container: string;
    field: string;
    group: string;
}

export interface FormGap {
    field: string;
    group: string;
    section: string;
}

export interface ComponentTheme {
    buttons: ButtonTheme;
    inputs: InputTheme;
    cards: CardTheme;
    modals: ModalTheme;
    navigation: NavigationTheme;
    forms: FormTheme;
    tables: TableTheme;
    lists: ListTheme;
    badges: BadgeTheme;
    avatars: AvatarTheme;
    progress: ProgressTheme;
    tooltips: TooltipTheme;
}

export interface ButtonTheme {
    base: ButtonBase;
    variants: ButtonVariant[];
    sizes: ButtonSize[];
    states: ButtonState[];
}

export interface ButtonBase {
    border_radius: string;
    border_width: string;
    font_weight: number;
    text_transform: TextTransform;
    transition: string;
}

export interface ButtonVariant {
    name: string;
    background: string;
    color: string;
    border_color: string;
    hover: ButtonStateColors;
    active: ButtonStateColors;
    disabled: ButtonStateColors;
}

export interface ButtonSize {
    name: string;
    padding: string;
    font_size: string;
    min_height: string;
    border_radius: string;
}

export interface ButtonState {
    name: string;
    background: string;
    color: string;
    border_color: string;
    shadow: string;
    transform: string;
}

export interface InputTheme {
    base: InputBase;
    variants: InputVariant[];
    sizes: InputSize[];
    states: InputState[];
}

export interface InputBase {
    border_radius: string;
    border_width: string;
    font_size: string;
    padding: string;
    transition: string;
}

export interface InputVariant {
    name: string;
    background: string;
    border_color: string;
    color: string;
    placeholder_color: string;
    focus: InputStateColors;
    error: InputStateColors;
    disabled: InputStateColors;
}

export interface InputSize {
    name: string;
    padding: string;
    font_size: string;
    min_height: string;
    border_radius: string;
}

export interface InputState {
    name: string;
    background: string;
    border_color: string;
    color: string;
    shadow: string;
}

export interface CardTheme {
    base: CardBase;
    variants: CardVariant[];
    sizes: CardSize[];
    states: CardState[];
}

export interface CardBase {
    border_radius: string;
    border_width: string;
    shadow: string;
    transition: string;
}

export interface CardVariant {
    name: string;
    background: string;
    border_color: string;
    shadow: string;
    hover: CardStateColors;
    active: CardStateColors;
}

export interface CardSize {
    name: string;
    padding: string;
    border_radius: string;
    shadow: string;
}

export interface CardState {
    name: string;
    background: string;
    border_color: string;
    shadow: string;
    transform: string;
}

export interface CardStateColors {
    background: string;
    border_color: string;
    shadow: string;
}

export interface ModalTheme {
    base: ModalBase;
    variants: ModalVariant[];
    sizes: ModalSize[];
    states: ModalState[];
}

export interface ModalBase {
    border_radius: string;
    shadow: string;
    backdrop: string;
    transition: string;
}

export interface ModalVariant {
    name: string;
    background: string;
    border_color: string;
    shadow: string;
}

export interface ModalSize {
    name: string;
    width: string;
    max_width: string;
    border_radius: string;
}

export interface ModalState {
    name: string;
    opacity: string;
    transform: string;
}

export interface NavigationTheme {
    base: NavigationBase;
    variants: NavigationVariant[];
    sizes: NavigationSize[];
    states: NavigationState[];
}

export interface NavigationBase {
    background: string;
    border_color: string;
    shadow: string;
    transition: string;
}

export interface NavigationVariant {
    name: string;
    background: string;
    border_color: string;
    item_color: string;
    item_hover: string;
    item_active: string;
}

export interface NavigationSize {
    name: string;
    height: string;
    padding: string;
    font_size: string;
}

export interface NavigationState {
    name: string;
    background: string;
    item_color: string;
    item_hover: string;
    item_active: string;
}

export interface FormTheme {
    base: FormBase;
    variants: FormVariant[];
    sizes: FormSize[];
    states: FormState[];
}

export interface FormBase {
    spacing: string;
    label_color: string;
    error_color: string;
    success_color: string;
}

export interface FormVariant {
    name: string;
    layout: FormLayout;
    label_position: LabelPosition;
    field_style: string;
}

export interface FormSize {
    name: string;
    field_spacing: string;
    label_spacing: string;
}

export interface FormState {
    name: string;
    field_style: string;
    label_style: string;
}

export interface TableTheme {
    base: TableBase;
    variants: TableVariant[];
    sizes: TableSize[];
    states: TableState[];
}

export interface TableBase {
    border_width: string;
    border_color: string;
    cell_padding: string;
    header_background: string;
    striped_background: string;
}

export interface TableVariant {
    name: string;
    border_style: string;
    header_style: string;
    row_style: string;
}

export interface TableSize {
    name: string;
    cell_padding: string;
    font_size: string;
    border_width: string;
}

export interface TableState {
    name: string;
    row_background: string;
    row_border: string;
}

export interface ListTheme {
    base: ListBase;
    variants: ListVariant[];
    sizes: ListSize[];
    states: ListState[];
}

export interface ListBase {
    spacing: string;
    padding: string;
    marker_color: string;
}

export interface ListVariant {
    name: string;
    marker_style: string;
    item_padding: string;
    item_border: string;
}

export interface ListSize {
    name: string;
    item_spacing: string;
    font_size: string;
}

export interface ListState {
    name: string;
    item_background: string;
    item_color: string;
}

export interface BadgeTheme {
    base: BadgeBase;
    variants: BadgeVariant[];
    sizes: BadgeSize[];
    states: BadgeState[];
}

export interface BadgeBase {
    border_radius: string;
    font_weight: number;
    text_transform: TextTransform;
    padding: string;
}

export interface BadgeVariant {
    name: string;
    background: string;
    color: string;
    border_color: string;
}

export interface BadgeSize {
    name: string;
    padding: string;
    font_size: string;
    border_radius: string;
}

export interface BadgeState {
    name: string;
    background: string;
    color: string;
    border_color: string;
}

export interface AvatarTheme {
    base: AvatarBase;
    variants: AvatarVariant[];
    sizes: AvatarSize[];
    states: AvatarState[];
}

export interface AvatarBase {
    border_radius: string;
    border_width: string;
    font_weight: number;
    background: string;
    color: string;
}

export interface AvatarVariant {
    name: string;
    border_color: string;
    background: string;
    color: string;
}

export interface AvatarSize {
    name: string;
    size: string;
    font_size: string;
    border_radius: string;
}

export interface AvatarState {
    name: string;
    border_color: string;
    background: string;
    color: string;
}

export interface ProgressTheme {
    base: ProgressBase;
    variants: ProgressVariant[];
    sizes: ProgressSize[];
    states: ProgressState[];
}

export interface ProgressBase {
    border_radius: string;
    height: string;
    background: string;
    transition: string;
}

export interface ProgressVariant {
    name: string;
    fill_color: string;
    background_color: string;
    striped: boolean;
}

export interface ProgressSize {
    name: string;
    height: string;
    border_radius: string;
}

export interface ProgressState {
    name: string;
    fill_color: string;
    background_color: string;
}

export interface TooltipTheme {
    base: TooltipBase;
    variants: TooltipVariant[];
    sizes: TooltipSize[];
    states: TooltipState[];
}

export interface TooltipBase {
    border_radius: string;
    background: string;
    color: string;
    shadow: string;
    transition: string;
}

export interface TooltipVariant {
    name: string;
    background: string;
    color: string;
    border_color: string;
}

export interface TooltipSize {
    name: string;
    padding: string;
    font_size: string;
    border_radius: string;
}

export interface TooltipState {
    name: string;
    opacity: string;
    transform: string;
}

export interface AnimationTheme {
    easings: AnimationEasing[];
    durations: AnimationDuration[];
    delays: AnimationDelay[];
    transitions: ComponentTransition[];
    keyframes: CustomKeyframe[];
}

export interface AnimationEasing {
    name: string;
    value: string;
    description: string;
}

export interface AnimationDuration {
    name: string;
    value: string;
    description: string;
}

export interface AnimationDelay {
    name: string;
    value: string;
    description: string;
}

export interface ComponentTransition {
    component: string;
    property: string;
    duration: string;
    easing: string;
    delay: string;
}

export interface CustomKeyframe {
    name: string;
    keyframes: KeyframeStep[];
    description: string;
}

export interface KeyframeStep {
    offset: number;
    properties: Record<string, string>;
    easing?: string;
}

export interface ThemeMetadata {
    version: string;
    author: string;
    description: string;
    tags: string[];
    preview: ThemePreview;
    compatibility: ThemeCompatibility;
    usage: ThemeUsage;
    license: ThemeLicense;
}

export interface ThemePreview {
    primary: string;
    secondary: string;
    accent: string;
    screenshot?: string;
    thumbnail?: string;
    demo_url?: string;
}

export interface ThemeCompatibility {
    browsers: string[];
    platforms: string[];
    min_version: string;
    breaking_changes: string[];
}

export interface ThemeUsage {
    downloads: number;
    rating: number;
    reviews: number;
    categories: string[];
    use_cases: string[];
}

export interface ThemeLicense {
    type: LicenseType;
    commercial: boolean;
    attribution: boolean;
    modification: boolean;
    redistribution: boolean;
}

export interface UserThemePreference {
    user_id: string;
    theme_id: string;
    customizations: ThemeCustomization[];
    settings: UserSettings;
    created_at: Date;
    updated_at: Date;
}

export interface ThemeCustomization {
    component: string;
    property: string;
    value: string;
    original_value?: string;
}

export interface UserSettings {
    auto_switch: boolean;
    accessibility: boolean;
    performance: boolean;
    custom_css: string;
    custom_js: string;
}

export interface ThemeAnalytics {
    theme_id: string;
    usage: ThemeUsage;
    performance: ThemePerformance;
    feedback: ThemeFeedback[];
    trends: ThemeTrend[];
}

export interface ThemePerformance {
    load_time: number;
    render_time: number;
    memory_usage: number;
    bundle_size: number;
    score: number;
}

export interface ThemeFeedback {
    user_id: string;
    rating: number;
    comment?: string;
    issues: ThemeIssue[];
    suggestions: string[];
    created_at: Date;
}

export interface ThemeIssue {
    type: IssueType;
    severity: IssueSeverity;
    description: string;
    component?: string;
    browser?: string;
    platform?: string;
}

export interface ThemeTrend {
    metric: string;
    period: TrendPeriod;
    data: TrendData[];
    trend: 'up' | 'down' | 'stable';
    significance: 'low' | 'medium' | 'high';
}

export interface TrendData {
    timestamp: Date;
    value: number;
    change: number;
}

export interface ThemeEvent {
    type: 'theme_applied' | 'theme_customized' | 'theme_created' | 'theme_deleted' | 'theme_shared';
    userId: string;
    themeId: string;
    data: Record<string, unknown>;
    timestamp: Date;
}
