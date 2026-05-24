import React from'react'; import{View,Pressable}from'react-native'; import Animated,{FadeInUp}from'react-native-reanimated'; import{Text}from'../../../components/primitives/Text'; import{useTheme}from'../../../theme'; export interface SessionStake{id:string;priority:number;icon:string;title:string;subtitle:string;urgency:'critical'|'high'|'medium'|'low';accentColor?:string;}export interface SessionStakesBriefingProps{bossStake?:{bossName:string;healthPercent:number;estimatedDamage:number;wouldDefeat:boolean;isFinalStrike:boolean;}|null;streakStake?:{currentDays:number;sessionNumberInStreak:number;multiplier:number;isAtRisk:boolean;hoursUntilDeadline:number|null;}|null;challengeStake?:{challengeName:string;current:number;target:number;canComplete:boolean;}|null;rivalStake?:{rivalName:string;theirMinutes:number;myMinutes:number;gapMinutes:number;}|null;squadWarStake?:{hoursRemaining:number;squadMinutesNeeded:number;myContribution:number;}|null;onStakePress?:(stakeId:string)=>void;}function StakeCard({icon,title,subtitle,urgency,accentColor,onPress}:{icon:string;title:string;subtitle:string;urgency:SessionStake['urgency'];accentColor?:string;onPress?:()=>void;}):JSX.Element{const{theme} = useTheme(); const getUrgencyStyles = ()=>{switch(urgency){case'critical':return{borderColor:theme.colors.error[500],bgColor:`${theme.colors.error[500]}15`,iconBg:theme.colors.error[500]}; case'high':return{borderColor:theme.colors.warning[500],bgColor:`${theme.colors.warning[500]}10`,iconBg:theme.colors.warning[500]}; case'medium':return{borderColor:accentColor || theme.colors.primary[500],bgColor:`${accentColor || theme.colors.primary[500]}10`,iconBg:accentColor || theme.colors.primary[500]}; default:return{borderColor:theme.colors.border.DEFAULT,bgColor:theme.colors.background.primary,iconBg:theme.colors.text.tertiary};}}; const styles = getUrgencyStyles(); const CardWrapper = onPress ? Pressable : View; return<CardWrapper onPress={onPress}>
      <View style={{flexDirection:'row',alignItems:'center',gap:theme.spacing[3],padding:theme.spacing[3],backgroundColor:styles.bgColor,borderRadius:theme.borderRadius.lg,borderWidth:1,borderColor:styles.borderColor}}>
        <View style={{width:36,height:36,borderRadius:theme.borderRadius.full,backgroundColor:styles.iconBg,justifyContent:'center',alignItems:'center'}}>
          <Text fontSize={18}>{icon}</Text>
        </View>
        <View style={{flex:1}}>
          <Text variant="body"fontWeight="600"color="text.primary">
            {title}
          </Text>
          <Text variant="caption"color="text.secondary">
            {subtitle}
          </Text>
        </View>
      </View>
    </CardWrapper>;}function EmptyStakesMessage():JSX.Element{const{theme} = useTheme(); return<View style={{flexDirection:'row',alignItems:'center',gap:theme.spacing[3],padding:theme.spacing[3],backgroundColor:theme.colors.background.primary,borderRadius:theme.borderRadius.lg,borderWidth:1,borderColor:theme.colors.border.light}}>
      <Text fontSize={20}>✨</Text>
      <View style={{flex:1}}>
        <Text variant="body"fontWeight="500"color="text.primary">
          Every session builds your streak
        </Text>
        <Text variant="caption"color="text.secondary">
          Start focusing and create momentum
        </Text>
      </View>
    </View>;}export function SessionStakesBriefing({bossStake,streakStake,challengeStake,rivalStake,squadWarStake,onStakePress}:SessionStakesBriefingProps):JSX.Element{const{theme} = useTheme(); const stakes:SessionStake[] = []; if(bossStake){const isCritical = bossStake.healthPercent <= 15; stakes.push({id:'boss',priority:isCritical ? 1 : 2,icon:bossStake.isFinalStrike ? '⚔️' : '🐲',title:bossStake.isFinalStrike ? `⚔️ FINAL STRIKE: ${bossStake.bossName}` : `${bossStake.bossName} at ${bossStake.healthPercent.toFixed(0)}%`,subtitle:bossStake.wouldDefeat ? 'This session defeats the boss!' : `Est. damage: ~${bossStake.estimatedDamage} HP`,urgency:isCritical ? 'critical' : bossStake.healthPercent <= 50 ? 'high' : 'medium',accentColor:theme.colors.primary[500]});}if(streakStake){const isCritical = streakStake.isAtRisk && streakStake.hoursUntilDeadline !== null && streakStake.hoursUntilDeadline <= 6; stakes.push({id:'streak',priority:isCritical ? 1 : 3,icon:'🔥',title:streakStake.isAtRisk && streakStake.hoursUntilDeadline !== null ? `🔥 Streak at risk — ${streakStake.hoursUntilDeadline}h left` : `Day ${streakStake.currentDays} of your streak`,subtitle:streakStake.isAtRisk ? 'Complete this session to save it!' : `Session ${streakStake.sessionNumberInStreak} • ${streakStake.multiplier.toFixed(1)}× multiplier`,urgency:isCritical ? 'critical' : streakStake.isAtRisk ? 'high' : 'low',accentColor:theme.colors.warning[500]});}if(challengeStake){stakes.push({id:'challenge',priority:challengeStake.canComplete ? 2 : 4,icon:'📋',title:`'${challengeStake.challengeName}'`,subtitle:challengeStake.canComplete ? `This session completes it! (${challengeStake.current}/${challengeStake.target})` : `Progress: ${challengeStake.current}/${challengeStake.target}`,urgency:challengeStake.canComplete ? 'high' : 'medium',accentColor:theme.colors.primary[500]});}if(rivalStake){const isBehind = rivalStake.gapMinutes > 0; stakes.push({id:'rival',priority:isBehind ? 3 : 5,icon:'⚔️',title:`${rivalStake.rivalName}`,subtitle:isBehind ? `${rivalStake.gapMinutes} min behind — catch up?` : `You're ${Math.abs(rivalStake.gapMinutes)} min ahead`,urgency:isBehind ? 'medium' : 'low',accentColor:theme.colors.error[500]});}if(squadWarStake){const isUrgent = squadWarStake.hoursRemaining <= 12; stakes.push({id:'squadwar',priority:isUrgent ? 3 : 5,icon:'🛡️',title:`Squad War ends in ${squadWarStake.hoursRemaining}h`,subtitle:`Squad needs ${squadWarStake.squadMinutesNeeded} more min`,urgency:isUrgent ? 'high' : 'medium',accentColor:theme.colors.primary[500]});}const topStakes = stakes.sort((a,b)=>a.priority - b.priority).slice(0,3); return<Animated.View entering={FadeInUp.duration(400).delay(200)}>
      <View style={{gap:theme.spacing[2]}}>
        {}
        <View style={{flexDirection:'row',alignItems:'center',gap:theme.spacing[2]}}>
          <Text fontSize={16}>🎯</Text>
          <Text variant="label"color="text.tertiary">
            WHAT'S AT STAKE
          </Text>
        </View>

        {}
        <View style={{gap:theme.spacing[2]}}>{topStakes.length > 0 ? topStakes.map(stake=><StakeCard key={stake.id}icon={stake.icon}title={stake.title}subtitle={stake.subtitle}urgency={stake.urgency}accentColor={stake.accentColor}onPress={onStakePress ? ()=>onStakePress(stake.id) : undefined}/>) : <EmptyStakesMessage/>}</View>
      </View>
    </Animated.View>;}export default SessionStakesBriefing;
