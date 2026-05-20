import React,{useEffect,useMemo}from'react'; import{Pressable,StyleSheet,View}from'react-native'; import Animated,{useAnimatedStyle,useSharedValue,withRepeat,withSequence,withTiming,FadeIn,FadeInDown}from'react-native-reanimated'; import{LinearGradient}from'expo-linear-gradient'; import{Text}from'../../../components/primitives/Text'; import{Button}from'../../../components/primitives/Button'; import{useTheme}from'../../../theme'; import{capture}from'../../../shared/analytics'; import{EconomyEvents}from'../../../shared/analytics/analytics-events'; import{createSheet}from'@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
 const URGENCY_GRADIENT = [launchColors.hex_ef4444,launchColors.hex_f97316,launchColors.hex_f59e0b]as const; interface BattlePassUrgencyBannerProps{daysRemaining:number;currentTier:number;totalTiers:number;unclaimedTiers:number;hasPremium:boolean;freeTierCap?:number;onViewBattlePass:()=>void;onUpgradeToPremium?:()=>void;}export function BattlePassUrgencyBanner({daysRemaining,currentTier,totalTiers,unclaimedTiers,hasPremium,freeTierCap = 40,onViewBattlePass,onUpgradeToPremium}:BattlePassUrgencyBannerProps):JSX.Element|null{const pulseScale = useSharedValue(1); const pulseOpacity = useSharedValue(1); useEffect(()=>{if(daysRemaining <= 3){pulseScale.value = withRepeat(withSequence(withTiming(1.02,{duration:600}),withTiming(1,{duration:600})),-1,true); pulseOpacity.value = withRepeat(withSequence(withTiming(1,{duration:600}),withTiming(0.7,{duration:600})),-1,true);}},[daysRemaining,pulseScale,pulseOpacity]); const pulseStyle = useAnimatedStyle(()=>({transform:[{scale:pulseScale.value}],opacity:pulseOpacity.value})); const urgencyLevel = useMemo(()=>{if(daysRemaining <= 1){return'critical';}if(daysRemaining <= 3){return'high';}return'medium';},[daysRemaining]); const isCapped = !hasPremium && currentTier >= freeTierCap; const tiersUntilCap = freeTierCap - currentTier; const progressPercent = Math.min(100,currentTier / totalTiers * 100); const remainingTiers = totalTiers - currentTier; const handleViewBattlePass = ()=>{capture(EconomyEvents.PAYWALL_VIEWED,{source:'battle_pass_urgency_banner'}); onViewBattlePass();}; const handleUpgrade = ()=>{capture(EconomyEvents.PAYWALL_VIEWED,{source:'battle_pass_urgency_upgrade'}); onUpgradeToPremium?.();}; const shouldShow = daysRemaining <= 7 || unclaimedTiers > 0; if(!shouldShow){return null;}return<Animated.View entering={FadeInDown.duration(400)}style={[styles.container,pulseStyle]}>
      <LinearGradient colors={URGENCY_GRADIENT}style={styles.gradient}start={{x:0,y:0}}end={{x:1,y:0}}>
        {}
        <View style={styles.urgencyBadge}>
          <Text style={styles.urgencyText}>
            {urgencyLevel === 'critical' && '🚨 CRITICAL'}
            {urgencyLevel === 'high' && '⚠️ URGENT'}
            {urgencyLevel === 'medium' && '⏰ LIMITED TIME'}
          </Text>
        </View>

        {}
        <View style={styles.content}>
          {}
          <Text style={styles.title}>
            Season Ends in {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
          </Text>

          {}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar,{backgroundColor:launchColors.rgb_255_255_255_0_3}]}>
              <View style={[styles.progressFill,{width:`${progressPercent}%`,backgroundColor:launchColors.hex_ffffff}]}/>
              {isCapped && <View style={[styles.capIndicator,{left:`${freeTierCap / totalTiers * 100}%`}]}>
                  <Text style={styles.capText}>FREE CAP</Text>
                </View>}
            </View>
            <Text style={styles.progressText}>
              Tier {currentTier} / {totalTiers}
            </Text>
          </View>

          {}
          <View style={styles.statsGrid}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{unclaimedTiers}</Text>
              <Text style={styles.statLabel}>Unclaimed {unclaimedTiers === 1 ? 'Tier' : 'Tiers'}</Text>
            </View>
            <View style={styles.statDivider}/>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{remainingTiers}</Text>
              <Text style={styles.statLabel}>{remainingTiers === 1 ? 'Tier' : 'Tiers'} Remaining</Text>
            </View>
            {!hasPremium && <>
                <View style={styles.statDivider}/>
                <View style={styles.stat}>
                  <Text style={[styles.statValue,isCapped && styles.cappedValue]}>{isCapped ? 'CAPPED' : tiersUntilCap}</Text>
                  <Text style={styles.statLabel}>{isCapped ? 'Upgrade to continue' : 'Tiers until cap'}</Text>
                </View>
              </>}
          </View>

          {}
          {!hasPremium && isCapped && <View style={styles.lockedMessage}>
              <Text style={styles.lockedText}>
                🔒 Free users cannot progress past Tier {freeTierCap}. Upgrade to unlock all {remainingTiers} remaining tiers!
              </Text>
            </View>}

          {}
          {!hasPremium && !isCapped && currentTier < totalTiers && <View style={styles.milestoneTeaser}>
              <Text style={styles.milestoneText}>
                🎯 Tier {Math.min(freeTierCap + 10,totalTiers)} milestone reward:
                <Text style={styles.milestoneHighlight}> Legendary Item</Text>
              </Text>
            </View>}

          {}
          <View style={styles.actions}>
            <Button onPress={handleViewBattlePass}variant="secondary"size="md"style={styles.viewButton}accessibilityLabel="View Battle Pass → button"accessibilityRole="button"accessibilityHint="Activates this control">
              View Battle Pass →
            </Button>

            {!hasPremium && onUpgradeToPremium && <Button onPress={handleUpgrade}variant="primary"size="md"style={styles.upgradeButton}accessibilityLabel="🔓 Unlock Premium button"accessibilityRole="button"accessibilityHint="Activates this control">
                🔓 Unlock Premium
              </Button>}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>;}const styles = createSheet({container:{margin:16,borderRadius:20,overflow:'hidden'},gradient:{padding:20},urgencyBadge:{alignSelf:'flex-start',backgroundColor:launchColors.rgb_0_0_0_0_3,paddingHorizontal:12,paddingVertical:6,borderRadius:20,marginBottom:12},urgencyText:{color:launchColors.hex_ffffff,fontSize:12,fontWeight:'800',letterSpacing:0.5},content:{gap:16},title:{color:launchColors.hex_ffffff,fontSize:22,fontWeight:'800'},progressContainer:{gap:8},progressBar:{height:12,borderRadius:6,overflow:'hidden',position:'relative'},progressFill:{height:'100%',borderRadius:6},capIndicator:{position:'absolute',top:-4,bottom:-4,width:2,backgroundColor:launchColors.hex_ffd700,justifyContent:'center',alignItems:'center'},capText:{position:'absolute',top:-20,fontSize:9,fontWeight:'700',color:launchColors.hex_ffd700,backgroundColor:launchColors.rgb_0_0_0_0_5,paddingHorizontal:4,paddingVertical:2,borderRadius:4},progressText:{color:launchColors.rgb_255_255_255_0_9,fontSize:13,fontWeight:'600'},statsGrid:{flexDirection:'row',justifyContent:'space-around',alignItems:'center',backgroundColor:launchColors.rgb_255_255_255_0_15,borderRadius:16,padding:16},stat:{alignItems:'center',flex:1},statValue:{color:launchColors.hex_ffffff,fontSize:24,fontWeight:'800'},statLabel:{color:launchColors.rgb_255_255_255_0_8,fontSize:11,fontWeight:'600',textAlign:'center'},statDivider:{width:1,height:40,backgroundColor:launchColors.rgb_255_255_255_0_3},cappedValue:{color:launchColors.hex_ffd700,fontSize:14},lockedMessage:{backgroundColor:launchColors.rgb_0_0_0_0_3,borderRadius:12,padding:12,borderWidth:1,borderColor:launchColors.hex_ffd700},lockedText:{color:launchColors.hex_ffffff,fontSize:13,lineHeight:18,textAlign:'center'},milestoneTeaser:{backgroundColor:launchColors.rgb_255_215_0_0_2,borderRadius:12,padding:12,borderWidth:1,borderColor:launchColors.hex_ffd700},milestoneText:{color:launchColors.hex_ffffff,fontSize:13,textAlign:'center'},milestoneHighlight:{color:launchColors.hex_ffd700,fontWeight:'700'},actions:{flexDirection:'row',gap:12},viewButton:{flex:1,backgroundColor:launchColors.rgb_255_255_255_0_2},upgradeButton:{flex:1,backgroundColor:launchColors.hex_ffd700}}); export default BattlePassUrgencyBanner;
