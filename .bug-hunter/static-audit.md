# Static Audit Snapshot

- Generated: 2026-05-25T18:31:58.0626451-04:00
- Source files scanned: 2978
- Files over 200 lines: 367 total, 62 active
- Files with banned-pattern hits: 1490 total, 961 active
- Supabase access outside allowed files: 28 files
- Query/mutation calls outside hook layers: 6 files
- Feature folders missing mandatory files: 48
- String-literal navigation calls: 92

## Pattern Totals

| Pattern | Active hits | Total hits |
| --- | ---: | ---: |
| anyType | 29 | 1387 |
| tsIgnore | 5 | 5 |
| consoleLog | 92 | 147 |
| todo | 0 | 10 |
| styleSheetCreate | 1 | 77 |
| flatList | 5 | 5 |
| asyncStorage | 0 | 22 |
| rawFetch | 2 | 2 |
| reactNativeAnimated | 1381 | 2178 |
| supabaseAccess | 359 | 385 |
| useQueryInSource | 256 | 353 |
| revenueCatDirect | 21 | 32 |
| expoHapticsDirect | 5 | 11 |
| unsafeCast | 2491 | 5016 |
| hardcodedHexColor | 500 | 3464 |

## Active Files Over 200 Lines

- 5568 lines: src\types\supabase.ts
- 882 lines: supabase\functions\content-study\index.ts
- 516 lines: jobs\squad-wars\weekly-reset.ts
- 500 lines: supabase\functions\ai\index.ts
- 491 lines: src\session\components\ComboMeter.tsx
- 442 lines: src\session\presets\index.ts
- 435 lines: src\session\utils\StateMachine.ts
- 419 lines: src\session\antiCheat\AntiCheatEngine.ts
- 417 lines: src\session\components\SessionSummary.tsx
- 414 lines: src\session\engines\CompletionEngine.ts
- 398 lines: src\session\services\SessionLifecycleService.ts
- 395 lines: src\session\hooks\useSession.ts
- 394 lines: src\session\analytics\SessionAnalytics.ts
- 390 lines: supabase\functions\ai-coach\index.ts
- 382 lines: src\session\validation\schemas.ts
- 372 lines: src\features\ai-coach\service\coach-state-machine.ts
- 367 lines: src\session\components\ActiveSessionHUD.tsx
- 365 lines: src\session\utils\validation.ts
- 338 lines: src\session\components\SessionPresets.tsx
- 333 lines: src\session\recovery\RecoveryService.ts
- 330 lines: src\session\components\SessionHistory.tsx
- 328 lines: src\session\engines\TimerEngine.ts
- 328 lines: src\session\hooks\useSessionTimer.ts
- 314 lines: src\session\components\BossDamagePreview.tsx
- 314 lines: src\session\components\states\SessionConflictState.tsx
- 311 lines: jobs\notifications\weekly-report.ts
- 303 lines: src\session\components\CheckpointCelebration.tsx
- 302 lines: src\navigation\navigation-helpers.ts
- 294 lines: src\session\notifications\SessionNotifications.ts
- 293 lines: src\session\components\QualityIndicator.tsx
- 291 lines: scripts\performance-audit.js
- 284 lines: src\session\repository\SessionRepository.ts
- 280 lines: src\session\utils\persistence.ts
- 277 lines: src\shared\ui\PremiumErrorRecovery.tsx
- 273 lines: src\session\modes-enhanced.ts
- 272 lines: shared\jobs\schemas.ts
- 271 lines: shared\jobs\job-types.ts
- 271 lines: src\session\SessionOrchestrator.ts
- 269 lines: src\session\SessionOrchestratorCombatAdapter.ts
- 262 lines: jobs\maintenance\health-check.ts
- 255 lines: src\session\SessionService.ts
- 250 lines: shared\jobs\job-constants.ts
- 250 lines: src\session\utils\RetryStrategy.ts
- 247 lines: src\session\types\events.ts
- 247 lines: src\session\engines\TimeCalculator.ts
- 232 lines: src\session\components\states\SessionBackgroundedState.tsx
- 230 lines: jobs\coach\reminder-delivery.ts
- 230 lines: src\session\components\RecoveryPrompt.tsx
- 226 lines: src\screens\home\hooks\useHomeResolvedExperience.ts
- 226 lines: scripts\integration-audit.js
- 222 lines: jobs\challenges\daily-refresh.ts
- 220 lines: src\navigation\hooks\useNotificationNavigation.ts
- 219 lines: src\session\components\states\SessionDegradedState.tsx
- 214 lines: src\session\SessionEventEmitter.ts
- 210 lines: shared\jobs\job-events.ts
- 209 lines: src\session\modes-v2.ts
- 209 lines: jobs\notifications\batch-send.ts
- 206 lines: jobs\coach\cleanup.ts
- 204 lines: src\features\home-spine\priority-checkers.ts
- 204 lines: src\features\boss\display-policy.ts
- 203 lines: src\shared\ui\components\MicroRewardBanner.tsx
- 201 lines: src\session\components\SessionControls.tsx

## Supabase Access Outside repository.ts/config/types

- archive\src\social\repository-enhanced.ts (1 hits)
- jobs\challenges\daily-refresh.ts (3 hits)
- jobs\seasons\finalize-season.ts (1 hits)
- jobs\squad-wars\weekly-reset.ts (5 hits)
- src\features\ai-coach\hooks-realtime.ts (5 hits)
- src\features\ai-coach\repository\memories.ts (7 hits)
- src\features\ai-coach\repository\messages.ts (1 hits)
- src\features\ai-coach\__tests__\memories-repository.test.ts (1 hits)
- src\features\analytics\repository\storage.ts (11 hits)
- src\features\battle-pass\repository\journey.ts (2 hits)
- src\features\boss\repository\enhanced.ts (7 hits)
- src\features\focus-identity\repository-focus-score.ts (6 hits)
- src\features\items\service.ts (9 hits)
- src\features\progression\repository\prestige.ts (1 hits)
- src\features\progression\repository\unified.ts (2 hits)
- src\features\rewards\repository\chests.ts (8 hits)
- src\features\rewards\repository\daily.ts (5 hits)
- src\features\rewards\repository\delivery-tracking.ts (10 hits)
- src\features\rewards\repository\enhanced.ts (9 hits)
- src\features\rewards\repository\ledger-service.ts (1 hits)
- src\features\session\repository\stakes.ts (3 hits)
- src\features\session-story\NarrativeQueries.ts (1 hits)
- src\features\squads\repository\persistence.ts (5 hits)
- src\features\squads\repository\squad-extended-queries.ts (2 hits)
- src\features\squads\repository\squad-streak-service.ts (5 hits)
- src\features\streaks\repository-insurance.ts (9 hits)
- src\features\streaks\repository\enhanced.ts (5 hits)
- supabase\functions\content-study\index.ts (3 hits)

## useQuery/useMutation Outside Allowed Hook Layers

- archive\phase0-dead-code\ai-coach-interventions\useInterventions.ts (5 hits)
- archive\phase0-dead-code\content-study-dead-components\DocumentHub.tsx (2 hits)
- archive\phase0-dead-code\phase5-retention-bloat\useSmartSchedule.ts (11 hits)
- src\features\focus-identity\hooks-focus-score.ts (3 hits)
- src\screens\home\containers\EngagedHomeContainer.tsx (1 hits)
- src\screens\home\containers\PowerUserHomeContainer.tsx (1 hits)

## Feature Layout Violations

- achievements: missing schemas.ts, events.ts, analytics.ts
- analytics: missing hooks.ts, analytics.ts
- battle-pass: missing hooks.ts, events.ts
- boss: missing events.ts
- boss-realtime: missing schemas.ts, repository.ts, hooks.ts, events.ts, analytics.ts
- challenges: missing hooks.ts, events.ts
- coach-presence: missing events.ts, analytics.ts
- companion: missing repository.ts, hooks.ts
- content-study: missing schemas.ts
- daily-mission: missing hooks.ts, events.ts
- economy: missing hooks.ts, events.ts
- emotion-retention: missing types.ts, schemas.ts, repository.ts, service.ts, hooks.ts, events.ts, analytics.ts
- feature-gate: missing types.ts, schemas.ts, repository.ts, service.ts, events.ts
- focus-identity: missing service.ts
- home-experience: missing repository.ts, events.ts, analytics.ts
- home-spine: missing repository.ts, events.ts, analytics.ts
- integration: missing types.ts, schemas.ts, repository.ts, service.ts, hooks.ts, events.ts
- inventory: missing hooks.ts, events.ts
- items: missing types.ts, repository.ts, hooks.ts, events.ts
- lane-engine: missing repository.ts
- learning-execution: missing events.ts, analytics.ts
- live-ops: missing types.ts, schemas.ts, repository.ts, service.ts, hooks.ts, events.ts, analytics.ts
- liveops-config: missing types.ts, schemas.ts, repository.ts, service.ts, hooks.ts, events.ts, analytics.ts
- mastery: missing hooks.ts, events.ts
- monetization: missing events.ts
- monthly-report: missing events.ts, analytics.ts
- notifications: missing hooks.ts
- onboarding: missing repository.ts, hooks.ts, events.ts, analytics.ts
- personal-bests: missing events.ts, analytics.ts
- progression: missing hooks.ts, events.ts
- retention: missing schemas.ts, repository.ts, service.ts, hooks.ts
- reward-ledger: missing events.ts, analytics.ts
- rewards: missing hooks.ts, events.ts
- seasons: missing types.ts, hooks.ts, events.ts, analytics.ts
- session: missing repository.ts, hooks.ts, events.ts, analytics.ts
- session-events: missing repository.ts, events.ts
- session-history: missing events.ts, analytics.ts
- session-recommendation: missing repository.ts, events.ts
- session-story: missing service.ts, hooks.ts
- settings: missing hooks.ts, analytics.ts
- shop: missing schemas.ts, repository.ts, service.ts, hooks.ts
- social: missing schemas.ts, hooks.ts, events.ts, analytics.ts
- spectacle: missing schemas.ts, repository.ts, hooks.ts, events.ts, analytics.ts
- squads: missing events.ts
- streaks: missing events.ts
- themes: missing schemas.ts, repository.ts, hooks.ts
- wallet: missing events.ts, analytics.ts
- weekly-quests: missing hooks.ts

## Route String Literal Samples

- src\features\content-study\screens\ContentInputScreen.tsx:63 navigation.navigate('ContentReview', { contentId: result.contentId });
- src\features\content-study\screens\ContentReviewScreen.tsx:3 type RouteProps=RouteProp<ContentStudyStackParamList,'ContentReview'>;type NavigationProp={navigate:(screen:keyof ContentStudyStackParamList,params?:unknown)=>void;goBack:()=>void;};export function ContentReviewScreen(){const navigation = useNavigation<NavigationProp>(); const route = useRoute<RouteProps>(); const{contentId} = route.params; const{content,editedText,isEditing,isGenerating,isLoading,error,canGenerate,isProcessing,isExtracted,isFailed,startEditing,cancelEditing,setEditedText,saveEdits,generate,refetch} = useContentReview(contentId); const handleGenerate = useCallback(async()=>{try{const result = await generate(); navigation.navigate('StudyPlan',{generationId:result.generationId,contentId:result.contentId});}catch(error){captureSilentFailure(error,{feature:'content-study',operation:'ui-fallback',type:'ui'});}},[generate,navigation]); const renderStatus = ()=>{if(!content){return null;}const config = CONTENT_STATUS_CONFIG[content.status]; return<View style={[styles.statusContainer,{backgroundColor:`${config.color}20`,borderColor:`${config.color}40`}]}>
- src\features\content-study\screens\StudyLibraryScreen.tsx:69 </Pressable>;}export function StudyLibraryScreen():JSX.Element{const{theme} = useTheme(); const navigation = useNavigation<ContentStudyNavigationProp>(); const{content,isLoading,error,refetch,deleteContent} = useContentHistory(); const[statusFilter,setStatusFilter] = useState<ContentStatus|'all'>('all'); const[typeFilter,setTypeFilter] = useState<ContentSourceType|'all'>('all'); const filteredContent = useMemo(()=>{return content.filter((item:StudyContent)=>{const matchesStatus = statusFilter === 'all' || item.status === statusFilter; const matchesType = typeFilter === 'all' || item.sourceType === typeFilter; return matchesStatus && matchesType;});},[content,statusFilter,typeFilter]); const handleContentPress = useCallback((contentId:string)=>{navigation.navigate('ContentReview',{contentId});},[navigation]); const handleDelete = useCallback((contentId:string)=>{deleteContent(contentId);},[deleteContent]); const handleRefresh = useCallback(()=>{void (refetch)();},[refetch]); const renderContentItem:ListRenderItem<StudyContent> = ({item,index})=><ContentItemCard content={item}index={index}onPress={()=>handleContentPress(item.id)}onDelete={()=>handleDelete(item.id)}/>; const renderEmptyState = ():JSX.Element|null=>{if(isLoading){return<>
- src\features\content-study\screens\StudyLibraryScreen.tsx:89 {content.length === 0 && <Button variant="primary"size="sm"mt="md"onPress={()=>navigation.navigate('ContentInput',{})}accessibilityLabel="Add Your First Content button"accessibilityRole="button"accessibilityHint="Activates this control">
- src\features\content-study\screens\StudyLibraryScreen.tsx:104 <Button variant="outline"size="sm"onPress={()=>navigation.navigate('ContentInput',{})}accessibilityLabel="+ Add New button"accessibilityRole="button"accessibilityHint="Activates this control">
- src\features\content-study\screens\StudyPlanScreen.tsx:3 type RouteProps=RouteProp<ContentStudyStackParamList,'StudyPlan'>;type NavigationProp={navigate:(screen:string,params?:unknown)=>void;goBack:()=>void;};const Icon = ({name:_name,color}:{name:string;color?:string;})=>{const{theme} = useTheme(); return<Text style={[styles.icon,{color:color ?? theme.colors.text.secondary}]}>?</Text>;}; export function StudyPlanScreen(){const navigation = useNavigation<NavigationProp>(); const route = useRoute<RouteProps>(); const{generationId,contentId} = route.params; const{generation,content,isLoading,isStartingSession,error,startSession} = useStudyPlan(generationId); const[revealedAnswers,setRevealedAnswers] = useState<Set<string>>(new Set()); const[userRating,setUserRating] = useState<number|null>(null); const toggleAnswer = useCallback((quizId:string)=>{setRevealedAnswers(prev=>{const next = new Set(prev); if(next.has(quizId)){next.delete(quizId);}else{next.add(quizId);}return next;});},[]); const handleStartSession = useCallback(async()=>{const sessionConfig = await startSession(); if(sessionConfig && generation){navigation.navigate('SessionStack',{screen:'SessionSetup',params:{suggestedDurationSeconds:sessionConfig.duration,suggestedDifficulty:sessionConfig.difficulty,goal:sessionConfig.goal,focusAreas:generation.keyConcepts.slice(0,3),sessionCategory:sessionConfig.category,sessionTags:sessionConfig.tags,source:'content-study',generationId,studyPlanId:generationId,contentId}});}},[contentId,generation,generationId,navigation,startSession]); const formatDuration = (seconds:number):string=>{const minutes = Math.floor(seconds / 60); if(minutes < 60){return`${minutes} min`;}const hours = Math.floor(minutes / 60); const remainingMinutes = minutes % 60; return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;}; const renderSummary = ()=>{if(!generation){return null;}return<View style={styles.section}>
- src\features\economy\components\EarnMoreSheet.tsx:30 navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} });
- src\features\economy\components\PremiumGate.tsx:78 navigation.navigate('Paywall', {
- src\features\economy\components\SimpleWalletBadge.tsx:113 navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} });
- src\features\focus-identity\FocusScoreDashboard.tsx:180 navigation.navigate('Analytics', {
- src\features\focus-identity\components\FocusScoreWidget.tsx:25 navigation.navigate('FocusScoreDashboard');
- src\features\monthly-report\components\MonthlyFocusReportScreen.tsx:40 navigation.navigate('SessionStack', { screen: 'SessionSetup' });
- src\features\monthly-report\components\MonthlyFocusReportScreen.tsx:43 navigation.navigate('Paywall', { source: 'monthly-report', gatedFeature: 'monthly-report' });
- src\features\monthly-report\components\MonthlyFocusReportScreen.tsx:86 onPress={() => navigation.navigate('SessionStack', { screen: 'SessionSetup' })}
- src\navigation\navigation-helpers.ts:42 navigation.navigate("Auth", { screen: route, params });
- src\navigation\navigation-helpers.ts:50 navigation.navigate("Main", { screen: route, params });
- src\navigation\navigation-helpers.ts:72 navigation.navigate("SessionStack", { screen: route, params });
- src\navigation\navigation-helpers.ts:80 navigation.navigate("Settings", { screen: route, params });
- src\navigation\notification-routing-core.ts:126 navigation.navigate('Boss', undefined);
- src\navigation\notification-routing-core.ts:130 navigation.navigate('Main', { screen: 'Progress' });
- src\navigation\notification-routing-core.ts:133 navigation.navigate('Main', { screen: 'Profile' });
- src\navigation\notification-routing-core.ts:137 navigation.navigate('AICoach', undefined);
- src\navigation\notification-routing-core.ts:142 navigation.navigate('ContentStudy', undefined);
- src\navigation\notification-routing-core.ts:146 navigation.navigate('Settings', {});
- src\navigation\notification-routing-core.ts:150 navigation.navigate('Main', { screen: 'Home' });
- src\navigation\notification-routing-core.ts:193 navigation.navigate('SessionStack', { screen: 'SessionSetup', params });
- src\screens\auth\VerifyEmailScreen.tsx:67 navigation.navigate('Login', { email });
- src\screens\boss\BossScreen.tsx:170 onStartSession={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })}
- src\screens\boss\BossScreenContent.tsx:90 navigation.navigate('SessionStack', {
- src\screens\home\components\HomeContent.tsx:98 navigation.navigate('Challenges');
- src\screens\home\components\HomeContent.tsx:106 navigation.navigate('CompanionDetail');
- src\screens\home\components\HomeContentLower.tsx:46 if (canNavChallenges) { navigation.navigate('Challenges'); return; }
- src\screens\home\components\HomeContentLower.tsx:79 navigation.navigate('FocusScoreDashboard');
- src\screens\home\components\HomeHeroSection.tsx:109 navigation.navigate('Boss');
- src\screens\home\components\HomeHeroSection.tsx:128 navigation.navigate('Challenges');
- src\screens\home\components\HomeInterventionBanner.tsx:55 navigation.navigate('SessionStack', {
- src\screens\home\components\MiniBossPreview.tsx:47 navigation.navigate('Boss');
- src\screens\home\containers\ActivatingHomeContainer.tsx:56 navigation.navigate('SessionStack', { screen: 'SessionSetup', params: (params ?? {}) as SessionStackParams['SessionSetup'] });
- src\screens\home\containers\ActivatingHomeContainer.tsx:59 const openProgress = useCallback(() => { navigation.navigate('Main', { screen: 'Progress' }); }, [navigation]);
- src\screens\home\containers\EngagedHomeContainer.tsx:83 navigation.navigate('SessionStack', { screen: 'SessionSetup', params: (params ?? {}) as SessionStackParams['SessionSetup'] });
- src\screens\home\containers\EngagedHomeContainer.tsx:86 const openProgress = useCallback(() => navigation.navigate('Main', { screen: 'Progress' }), [navigation]);
- src\screens\home\containers\EngagedHomeContainer.tsx:88 navigation.navigate('Main', canNavigateSocial ? { screen: 'Profile', params: { tab: 'social' } } : { screen: 'Profile', params: { tab: 'stats' } });
- src\screens\home\containers\EngagedHomeContainer.tsx:92 navigation.navigate('ContentStudy');
- src\screens\home\containers\HomeScreenInner.tsx:124 navigation.navigate('SessionStack', { screen: 'SessionSetup', params });
- src\screens\home\containers\NewUserHomeContainer.tsx:88 navigation.navigate('SessionStack', {
- src\screens\home\containers\NewUserHomeContainer.tsx:97 navigation.navigate('Main', { screen: 'Progress' });
- src\screens\home\containers\PowerUserHomeContainer.tsx:87 navigation.navigate('SessionStack', { screen: 'SessionSetup', params: (params ?? {}) as SessionStackParams['SessionSetup'] });
- src\screens\home\containers\PowerUserHomeContainer.tsx:89 const openProgress = useCallback(() => navigation.navigate('Main', { screen: 'Progress' }), [navigation]);
- src\screens\home\containers\PowerUserHomeContainer.tsx:91 navigation.navigate('Main', canNavigateSocial ? { screen: 'Profile', params: { tab: 'social' } } : { screen: 'Profile', params: { tab: 'stats' } });
- src\screens\home\containers\PowerUserHomeContainer.tsx:95 navigation.navigate('ContentStudy');
- src\screens\home\hooks\useActivatingHomeModel.ts:78 navigation.navigate('SessionStack', { screen: 'SessionSetup', params: (params ?? {}) as SessionStackParams['SessionSetup'] });
- src\screens\home\hooks\useActivatingHomeModel.ts:81 const openProgress = useCallback((): void => { navigation.navigate('Main', { screen: 'Progress' }); }, [navigation]);
- src\screens\home\hooks\useEngagedHomeModel.ts:85 navigation.navigate('SessionStack', { screen: 'SessionSetup', params: (params ?? {}) as SessionStackParams['SessionSetup'] });
- src\screens\home\hooks\useEngagedHomeModel.ts:88 const openProgress = useCallback(() => navigation.navigate('Main', { screen: 'Progress' }), [navigation]);
- src\screens\home\hooks\useEngagedHomeModel.ts:90 navigation.navigate('Main', canNavigateSocial ? { screen: 'Profile', params: { tab: 'social' } } : { screen: 'Profile', params: { tab: 'stats' } });
- src\screens\home\hooks\useEngagedHomeModel.ts:94 navigation.navigate('ContentStudy');
- src\screens\home\hooks\useHomeNavigationActions.ts:38 navigation.navigate('SessionStack', { screen: 'SessionSetup', params: params ?? {} });
- src\screens\home\hooks\useHomeNavigationActions.ts:42 () => navigation.navigate('Main', { screen: 'Progress' }),
- src\screens\home\hooks\useHomeNavigationActions.ts:46 () => navigation.navigate('Main', canNavigateSocial ? { screen: 'Profile', params: { tab: 'social' } } : { screen: 'Profile', params: { tab: 'stats' } }),
- src\screens\home\hooks\useHomeNavigationActions.ts:54 navigation.navigate('ContentStudy');
- src\screens\home\hooks\useHomeNavigationActions.ts:66 navigation.navigate('ContentStudy', {
- src\screens\home\hooks\useNewUserHomeModel.ts:59 navigation.navigate('SessionStack', { screen: 'SessionSetup', params: (params ?? {}) as SessionStackParams['SessionSetup'] });
- src\screens\home\hooks\useNewUserHomeModel.ts:63 navigation.navigate('Main', { screen: 'Progress' });
- src\screens\home\hooks\usePowerUserHomeModel.ts:88 navigation.navigate('SessionStack', { screen: 'SessionSetup', params: (params ?? {}) as SessionStackParams['SessionSetup'] });
- src\screens\home\hooks\usePowerUserHomeModel.ts:91 const openProgress = useCallback(() => navigation.navigate('Main', { screen: 'Progress' }), [navigation]);
- src\screens\home\hooks\usePowerUserHomeModel.ts:93 navigation.navigate('Main', canNavigateSocial ? { screen: 'Profile', params: { tab: 'social' } } : { screen: 'Profile', params: { tab: 'stats' } });
- src\screens\home\hooks\usePowerUserHomeModel.ts:97 navigation.navigate('ContentStudy');
- src\screens\home\__tests__\home-screen-recommendations.test.tsx:124 navigation.navigate('SessionStack', {
- src\screens\onboarding\OnboardingFlowScreen.tsx:158 navigation.navigate('SessionStack', {
- src\screens\profile\ProfileScreen.tsx:14 <Pressable onPress={()=>navigation.navigate('Settings',{screen:'SettingsMain'})}style={{padding:8}}accessibilityLabel="Open settings"accessibilityRole="button"accessibilityHint="Opens account and app settings"><Icon name="setting"size={24}color={theme.colors.text.inverse}/></Pressable>
- src\screens\profile\ProfileScreen.tsx:16 <Pressable onPress={()=>navigation.navigate('Notifications')}style={{padding:8}}accessibilityLabel="Open notifications"accessibilityRole="button"accessibilityHint="Shows your VEX notifications"><Icon name="notification"size={24}color={theme.colors.text.inverse}/></Pressable>
- src\screens\profile\ProfileScreen.tsx:48 <Pressable onPress={()=>{if(isFeatureAvailableForNavigation(getFeatureAvailability(disclosure.features.achievements)))navigation.navigate('Mastery')}}accessibilityLabel="View Mastery details"accessibilityRole="button"accessibilityHint="Opens the full mastery progression screen">
- src\screens\profile\ProfileScreen.tsx:59 {activeTab==='achievements'?achievementLoading?<Card size="lg"style={{backgroundColor:theme.colors.background.secondary}}><Skeleton lines={6}height={22}borderRadius={10}spacing={12}/></Card>:achievementsQuery.isError?<Card size="lg"style={{backgroundColor:theme.colors.background.secondary}}><EmptyState icon="!"title="Achievements unavailable"body="Your identity rewards could not load right now. Retry from the achievements screen or come back after your next session."actionLabel="Open achievements"onAction={()=>navigation.navigate('Achievements')}/></Card>:profileAchievements.length===0?<Card size="lg"style={{backgroundColor:theme.colors.background.secondary}}><EmptyState icon="+"title="No earned proof yet"body="Complete your first focus session to unlock real achievements on this profile."actionLabel="Start session"onAction={()=>navigation.navigate('SessionStack',{screen:'SessionSetup',params:{}})}/></Card>:<Box gap={12}>{profileAchievements.map(item=><Pressable key={item.id}onPress={()=>navigation.navigate('Achievements')}accessibilityLabel={item.accessibilityLabel}accessibilityRole="button"accessibilityHint="Opens the full achievement collection"><Card size="md"style={{backgroundColor:theme.colors.background.secondary,opacity:item.statusTone==='success'?1:0.7}}><Box flexDirection="row"alignItems="center"gap={12}><Box width={44}height={44}borderRadius={12}justifyContent="center"alignItems="center"style={{backgroundColor:item.statusTone==='success'?theme.colors.primary[100]:theme.colors.background.tertiary}}><Text variant="h3"color="text.primary">{item.icon}</Text></Box><Box flex={1}><Text variant="h4"color="text.primary">{item.title}</Text><Text variant="caption"color="text.secondary">{item.description}</Text><Text variant="caption"color="text.tertiary"style={{marginTop:4}}>{item.progressLabel}</Text></Box><Badge variant={item.statusTone}size="sm">{item.statusLabel}</Badge></Box></Card></Pressable>)}</Box>:null}
- src\screens\profile\ProfileScreen.tsx:61 {activeTab==='activity'?historyQuery.isLoading?<Card size="lg"style={{backgroundColor:theme.colors.background.secondary}}><Skeleton lines={5}height={52}borderRadius={14}spacing={12}/></Card>:historyQuery.error?<Card size="lg"style={{backgroundColor:theme.colors.background.secondary}}><EmptyState icon="!"title="Activity unavailable"body="We couldn't load your recent sessions right now."actionLabel="Start session"onAction={()=>navigation.navigate('SessionStack',{screen:'SessionSetup',params:{}})}/></Card>:historyQuery.history.length===0?<Card size="lg"style={{backgroundColor:theme.colors.background.secondary}}><EmptyState icon="+"title="No recent activity"body="Start a session to turn your profile into a live record of wins, streaks, and progression."actionLabel="Start session"onAction={()=>navigation.navigate('SessionStack',{screen:'SessionSetup',params:{}})}/></Card>:<Box style={{height:Math.max(360,historyQuery.history.length*86)}}>
- src\screens\progress\ProgressScreen.tsx:46 navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} });
- src\screens\progress\ProgressScreen.tsx:51 navigation.navigate('ContentStudy');
- src\screens\progress\ProgressScreen.tsx:86 navigation.navigate('Paywall', {
- src\screens\rewards\VaultScreen.tsx:68 navigation.navigate('SessionStack', { screen: 'SessionSetup' });
- src\screens\session\SessionHistoryScreen.tsx:61 navigation.navigate('SessionComplete', {
- src\screens\session\components\SessionSetupStakesCard.tsx:45 navigation.navigate('Boss');
