import React from'react'; import{Pressable,View}from'react-native'; import{Box,Card,Text}from'../../../components/primitives'; import{Button}from'../../../components/primitives/Button'; import{Icon}from'../../../icons'; import{useTheme}from'../../../theme'; import{getMasteryRankDisplay,type MasteryRank,MASTERY_RANK_THRESHOLDS}from'../types'; export type UnlockableFeature='DEEP_WORK'|'NIGHTMARE_MODE'|'MASTERY_DUEL'|'CUSTOM_CHALLENGE'|'BOSS_TIER_3_4'|'BOSS_TIER_5_6'; const FEATURE_REQUIREMENTS:Record<UnlockableFeature,MasteryRank> = {DEEP_WORK:'ADEPT',NIGHTMARE_MODE:'EXPERT',MASTERY_DUEL:'MASTER',CUSTOM_CHALLENGE:'GRANDMASTER',BOSS_TIER_3_4:'ADEPT',BOSS_TIER_5_6:'EXPERT'}; const FEATURE_INFO:Record<UnlockableFeature,{name:string;description:string;icon:string;benefit:string;}> = {DEEP_WORK:{name:'Deep Work Mode',description:'Ultra-minimalist 45+ minute sessions with maximum boss damage',icon:'brain',benefit:'1.5× boss damage multiplier'},NIGHTMARE_MODE:{name:'Nightmare Mode',description:'Stricter anti-cheat with 2× XP reward for perfection',icon:'flame',benefit:'2× XP on all sessions'},MASTERY_DUEL:{name:'Mastery Duel',description:'Duels scored on technique quality, not just time',icon:'trophy',benefit:'Skill-based rival competition'},CUSTOM_CHALLENGE:{name:'Custom Challenges',description:'Define your own daily challenges with custom rewards',icon:'edit',benefit:'Personalized progression'},BOSS_TIER_3_4:{name:'Tier 3-4 Bosses',description:'Access to stronger bosses with better loot',icon:'skull',benefit:'Rare boss drops'},BOSS_TIER_5_6:{name:'Tier 5-6 Bosses',description:'The ultimate boss challenges await',icon:'crown',benefit:'Legendary boss drops'}}; export const RANK_UNLOCKS:Record<MasteryRank,string[]> = {APPRENTICE:['All base session modes','Basic boss encounters'],ADEPT:['DEEP_WORK mode unlocked','Advanced boss tier 3-4 access'],EXPERT:['Nightmare Mode sessions (2x XP)','Boss tier 5-6 access'],MASTER:['Mastery Duel type','Custom challenge creation'],GRANDMASTER:['Exclusive Grandmaster badge','Priority support access']}; export function getRequiredRank(feature:UnlockableFeature):MasteryRank{return FEATURE_REQUIREMENTS[feature];}export function isFeatureUnlocked(userRank:MasteryRank,feature:UnlockableFeature):boolean{const requiredRank = FEATURE_REQUIREMENTS[feature]; const ranks:MasteryRank[] = ['APPRENTICE','ADEPT','EXPERT','MASTER','GRANDMASTER']; return ranks.indexOf(userRank) >= ranks.indexOf(requiredRank);}export function getPointsToUnlock(feature:UnlockableFeature,currentPoints:number):number{const requiredRank = FEATURE_REQUIREMENTS[feature]; return Math.max(0,MASTERY_RANK_THRESHOLDS[requiredRank] - currentPoints);}interface MasteryUnlockGateProps{userRank:MasteryRank;userPoints:number;feature:UnlockableFeature;children:React.ReactNode;onNavigateToMastery?:()=>void;}export function MasteryUnlockGate({userRank,userPoints,feature,children,onNavigateToMastery}:MasteryUnlockGateProps):JSX.Element{const{theme} = useTheme(); const isUnlocked = isFeatureUnlocked(userRank,feature); const featureInfo = FEATURE_INFO[feature]; const requiredRank = FEATURE_REQUIREMENTS[feature]; const rankDisplay = getMasteryRankDisplay(requiredRank); const pointsNeeded = getPointsToUnlock(feature,userPoints); if(isUnlocked){return<>{children}</>;}return<Card size="md"style={{backgroundColor:theme.colors.background.secondary,borderWidth:1,borderColor:`${rankDisplay.color}40`,borderStyle:'dashed'}}>
      <View style={{gap:theme.spacing[3],alignItems:'center'}}>
        <View style={{width:48,height:48,borderRadius:24,backgroundColor:`${rankDisplay.color}20`,alignItems:'center',justifyContent:'center'}}>
          <Icon name="lock"size={24}color={rankDisplay.color}/>
        </View>

        <View style={{alignItems:'center'}}>
          <Text variant="h4"color="text.primary"textAlign="center">
            {featureInfo.name} Locked
          </Text>
          <Text variant="bodySmall"color="text.secondary"textAlign="center"style={{marginTop:theme.spacing[1]}}>
            {featureInfo.description}
          </Text>
        </View>

        <View style={{flexDirection:'row',alignItems:'center',gap:theme.spacing[2],paddingHorizontal:theme.spacing[3],paddingVertical:theme.spacing[2],backgroundColor:`${rankDisplay.color}15`,borderRadius:12}}>
          <Text fontSize={20}>{rankDisplay.icon}</Text>
          <View>
            <Text variant="caption"color="text.secondary">
              Required Rank
            </Text>
            <Text variant="bodySmall"color={rankDisplay.color}fontWeight="600">
              {rankDisplay.title}
            </Text>
          </View>
        </View>

        {pointsNeeded > 0 && <Text variant="caption"color="text.tertiary">
            {pointsNeeded} more mastery points needed
          </Text>}

        {onNavigateToMastery && <Button size="sm"variant="outline"onPress={onNavigateToMastery}accessibilityLabel="View mastery progression"accessibilityRole="button"accessibilityHint="Opens the mastery screen to track your progress">
            View Mastery Progress
          </Button>}

        <View style={{flexDirection:'row',alignItems:'center',gap:theme.spacing[1],padding:theme.spacing[2],backgroundColor:theme.colors.background.tertiary,borderRadius:8}}>
          <Icon name="sparkles"size={14}color={theme.colors.success.DEFAULT}/>
          <Text variant="caption"color="success.DEFAULT">
            Unlock benefit: {featureInfo.benefit}
          </Text>
        </View>
      </View>
    </Card>;}interface LockedFeaturePreviewProps{feature:UnlockableFeature;userRank:MasteryRank;userPoints:number;onNavigateToMastery?:()=>void;}export function LockedFeaturePreview({feature,userRank,userPoints,onNavigateToMastery}:LockedFeaturePreviewProps):JSX.Element{const{theme} = useTheme(); const featureInfo = FEATURE_INFO[feature]; const requiredRank = FEATURE_REQUIREMENTS[feature]; const rankDisplay = getMasteryRankDisplay(requiredRank); const pointsNeeded = getPointsToUnlock(feature,userPoints); return<Pressable onPress={onNavigateToMastery}accessibilityLabel={`${featureInfo.name} is locked. Requires ${rankDisplay.title} rank.`}accessibilityRole="button"accessibilityHint="Tap to view mastery progression">
      <Card size="sm"style={{backgroundColor:theme.colors.background.secondary,opacity:0.8}}>
        <Box flexDirection="row"alignItems="center"gap="md">
          <View style={{width:40,height:40,borderRadius:20,backgroundColor:`${rankDisplay.color}20`,alignItems:'center',justifyContent:'center'}}>
            <Icon name="lock"size={18}color={rankDisplay.color}/>
          </View>

          <View style={{flex:1}}>
            <Text variant="body"color="text.primary"fontWeight="600">
              {featureInfo.name}
            </Text>
            <Text variant="caption"color="text.tertiary">
              Locked • {pointsNeeded} MP to unlock
            </Text>
          </View>

          <View style={{flexDirection:'row',alignItems:'center',gap:4,paddingHorizontal:theme.spacing[2],paddingVertical:theme.spacing[1],backgroundColor:`${rankDisplay.color}15`,borderRadius:8}}>
            <Text fontSize={12}>{rankDisplay.icon}</Text>
            <Text variant="caption"color={rankDisplay.color}>
              {rankDisplay.title}
            </Text>
          </View>
        </Box>
      </Card>
    </Pressable>;}
