import React,{useState,useEffect,useCallback,useMemo}from'react'; import{View}from'react-native'; import Animated,{useAnimatedStyle,useSharedValue,withTiming,withSpring,interpolate,Extrapolation,runOnJS}from'react-native-reanimated'; import{useTheme}from'../../../theme'; import{Text}from'../../../components/primitives/Text'; import{Button}from'../../../components/primitives/Button'; import{useHaptics}from'../../../utils/haptics'; import{executeCombatAbility,COMBAT_ABILITIES,type CombatActionResult}from'../../../features/boss/active-combat-system'; import{eventBus}from'../../../events'; import{trackCombatAbilityActivated}from'../../../features/boss/analytics'; interface BossCombatHUDProps{encounterId:string;userId:string;sessionProgress:number;purityScore:number;currentMode:string;isPaused:boolean;userStreakDays?:number;bossHealth?:number;bossMaxHealth?:number;currentPhase?:'CALM'|'AGITATED'|'ENRAGED'|'DESPERATE';currentAttackPattern?:string|null;}const PHASE_COLORS:Record<'CALM'|'AGITATED'|'ENRAGED'|'DESPERATE',{bg:string;text:string;border:string;}> = {CALM:{bg:'#3B82F6',text:'#1E40AF',border:'#60A5FA'},AGITATED:{bg:'#F97316',text:'#9A3412',border:'#FB923C'},ENRAGED:{bg:'#EF4444',text:'#991B1B',border:'#F87171'},DESPERATE:{bg:'#A855F7',text:'#6B21A8',border:'#C084FC'}}; const ATTACK_NAMES:Record<string,string> = {DISTRACTION_WAVE:'⚡ Distraction Wave',PROCRASTINATION_BEAM:'🔥 Procrastination Beam',NOTIFICATION_BLAST:'💥 Notification Blast',SOCIAL_MEDIA_TRAP:'🕸️ Social Media Trap',MULTITASKING_TEMPEST:'🌪️ Multitasking Tempest'}; export function BossCombatHUD({encounterId,userId,sessionProgress,purityScore,currentMode,isPaused,userStreakDays = 0,bossHealth = 100,bossMaxHealth = 100,currentPhase = 'CALM',currentAttackPattern}:BossCombatHUDProps):JSX.Element{const{theme} = useTheme(); const haptics = useHaptics(); const[cooldownEnd,setCooldownEnd] = useState<number>(0); const[lastResult,setLastResult] = useState<CombatActionResult|null>(null); const[showToast,setShowToast] = useState(false); const healthPercent = Math.max(0,Math.min(100,bossHealth / bossMaxHealth * 100)); const phaseColors = PHASE_COLORS[currentPhase] ?? PHASE_COLORS.CALM; const availableAbility = useMemo(()=>{const match = COMBAT_ABILITIES.find(a=>userStreakDays >= a.requiresStreak && a.focusEnergyCost <= 50 && a.cooldownSeconds <= 15); if(match)return match; const first = COMBAT_ABILITIES[0]; if(!first)throw new Error('COMBAT_ABILITIES must not be empty'); return first;},[userStreakDays]); const cooldownProgress = useSharedValue(0); useEffect(()=>{const now = Date.now(); if(cooldownEnd > now){const remaining = cooldownEnd - now; cooldownProgress.value = withTiming(1,{duration:remaining});}else{cooldownProgress.value = 0;}},[cooldownEnd,cooldownProgress]); const cooldownStyle = useAnimatedStyle(()=>({opacity:interpolate(cooldownProgress.value,[0,1],[1,0.5],Extrapolation.CLAMP)})); const handleActivateAbility = useCallback(()=>{const now = Date.now(); if(now < cooldownEnd){haptics.error(); return;}haptics.medium(); const mockEncounter = {id:encounterId,userId,bossId:'active-boss',bossName:'Active Boss',bossAvatarUrl:null,bossMaxHealth,bossCurrentHealth:bossHealth,currentPhase,currentAttackPattern:currentAttackPattern as any,attackPatternStartedAt:null,attackPatternDurationMs:30000,userMaxFocusEnergy:100,userCurrentFocusEnergy:100,userFocusEnergyRegenRate:1,availableAbilities:COMBAT_ABILITIES,abilityCooldowns:{},encounterStartedAt:now,expiresAt:now + 3600000,lastUserActionAt:null,sessionCount:1,totalDamageDealt:0,attacksDodged:0,attacksHit:0,status:'ACTIVE'as const}; const result = executeCombatAbility(mockEncounter,availableAbility.id,userStreakDays,now); if(result.success){setCooldownEnd(now + availableAbility.cooldownSeconds * 1000); haptics.success(); setLastResult(result); setShowToast(true); setTimeout(()=>setShowToast(false),3000); (eventBus as any).publish('boss:ability_activated',{userId,encounterId,abilityId:availableAbility.id,damageDealt:result.damageDealt,bonusDamage:result.comboBonus > 0 ? Math.floor(result.damageDealt * result.comboBonus) : 0,timestamp:now}); trackCombatAbilityActivated(userId,encounterId,availableAbility.id,result.damageDealt,result.comboBonus > 0);}else{haptics.error();}},[encounterId,userId,bossHealth,bossMaxHealth,currentPhase,currentAttackPattern,availableAbility,userStreakDays,cooldownEnd,haptics]); const containerStyle = {position:'absolute'as const,bottom:120,left:theme.spacing[4],right:theme.spacing[4],backgroundColor:theme.colors.background.primary,borderRadius:theme.borderRadius.xl,borderWidth:2,borderColor:phaseColors.border,padding:theme.spacing[3],shadowColor:phaseColors.bg,shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:8,elevation:8}; const healthBarContainerStyle = {height:8,backgroundColor:theme.colors.background.tertiary,borderRadius:theme.borderRadius.full,overflow:'hidden'as const,marginBottom:theme.spacing[2]}; const healthBarStyle = {height:'100%'as const,width:`${healthPercent}%`as const,backgroundColor:phaseColors.bg,borderRadius:theme.borderRadius.full}; const rowStyle = {flexDirection:'row'as const,justifyContent:'space-between'as const,alignItems:'center'as const,marginBottom:theme.spacing[2]}; const phaseBadgeStyle = {backgroundColor:phaseColors.bg,paddingVertical:theme.spacing[1],paddingHorizontal:theme.spacing[2],borderRadius:theme.borderRadius.full}; const phaseTextStyle = {color:'#FFFFFF',fontWeight:'700'as const,fontSize:12,textTransform:'uppercase'as const}; const attackWarningStyle = {backgroundColor:`${theme.colors.warning.light}30`,padding:theme.spacing[2],borderRadius:theme.borderRadius.lg,marginBottom:theme.spacing[2],borderLeftWidth:3,borderLeftColor:theme.colors.warning.DEFAULT}; const abilityRowStyle = {flexDirection:'row'as const,alignItems:'center'as const,gap:theme.spacing[2]}; const abilityButtonStyle = {flex:1}; const toastStyle = {position:'absolute'as const,top:-40,left:0,right:0,backgroundColor:theme.colors.success[500],paddingVertical:theme.spacing[2],paddingHorizontal:theme.spacing[3],borderRadius:theme.borderRadius.lg,alignItems:'center'as const}; const now = Date.now(); const isOnCooldown = now < cooldownEnd; const cooldownRemaining = Math.ceil((cooldownEnd - now) / 1000); return<View style={containerStyle}>
      {}
      {showToast && lastResult && <View style={toastStyle}>
          <Text variant="bodySmall"color="#FFFFFF">
            +{lastResult.damageDealt} damage!
            {lastResult.comboBonus > 0 && ` (${Math.floor(lastResult.comboBonus * 100)}% combo)`}
          </Text>
        </View>}

      {}
      <View style={healthBarContainerStyle}>
        <View style={healthBarStyle}/>
      </View>

      {}
      <View style={rowStyle}>
        <View style={phaseBadgeStyle}>
          <Text style={phaseTextStyle}>{currentPhase}</Text>
        </View>
        <Text variant="caption"color={theme.colors.text.secondary}>
          {Math.round(healthPercent)}% HP
        </Text>
      </View>

      {}
      {currentAttackPattern && <View style={attackWarningStyle}>
          <Text variant="bodySmall"color={theme.colors.warning.DEFAULT}>
            {ATTACK_NAMES[currentAttackPattern] || '⚡ Boss attacking!'}
          </Text>
          <Text variant="caption"color={theme.colors.text.secondary}>
            Maintain focus to dodge!
          </Text>
        </View>}

      {}
      <Animated.View style={[abilityRowStyle,cooldownStyle]}>
        <Button variant="primary"size="md"onPress={handleActivateAbility}disabled={isPaused || isOnCooldown}style={abilityButtonStyle}accessibilityLabel={`Activate ${availableAbility.name}`}accessibilityRole="button">
          {isOnCooldown ? `${cooldownRemaining}s` : `${availableAbility.icon} ${availableAbility.name}`}
        </Button>
      </Animated.View>
    </View>;}
