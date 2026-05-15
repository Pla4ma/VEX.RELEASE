import React,{useMemo}from'react'; import{Pressable,StyleSheet,View}from'react-native'; import Animated,{useAnimatedStyle,useSharedValue,withRepeat,withSequence,withTiming,FadeIn,FadeInRight}from'react-native-reanimated'; import{LinearGradient}from'expo-linear-gradient'; import{Text}from'../../../components/primitives/Text'; import{Button}from'../../../components/primitives/Button'; import{useTheme}from'../../../theme'; import{capture}from'../../../shared/analytics'; import{EconomyEvents}from'../../../shared/analytics/analytics-events'; import{triggerHaptic}from'../../../utils/haptics'; import{createSheet}from'@/shared/ui/create-sheet'; const XP_GRADIENT = ['#8B5CF6','#A855F7','#EC4899']as const; const WEEKLY_BUNDLE_ID = 'xp_bundle_weekly'; interface XPBundleCardProps{gemBalance:number;hasPurchasedThisWeek:boolean;hoursUntilReset:number;onPurchase:()=>Promise<boolean>;onViewDetails?:()=>void;}const BUNDLE_CONFIG = {name:'XP Power Boost',description:'Double XP for your next 5 sessions',priceGems:50,bonusMultiplier:2,sessionCount:5,savingsPercent:40,icon:'⚡',rarity:'epic'as const}; export function XPBundleCard({gemBalance,hasPurchasedThisWeek,hoursUntilReset,onPurchase,onViewDetails}:XPBundleCardProps):JSX.Element|null{const{theme} = useTheme(); const{colors} = theme; const pulseScale = useSharedValue(1); React.useEffect(()=>{if(!hasPurchasedThisWeek && hoursUntilReset < 24){pulseScale.value = withRepeat(withSequence(withTiming(1.03,{duration:1000}),withTiming(1,{duration:1000})),-1,true);}},[hasPurchasedThisWeek,hoursUntilReset,pulseScale]); const pulseStyle = useAnimatedStyle(()=>({transform:[{scale:pulseScale.value}]})); const canAfford = gemBalance >= BUNDLE_CONFIG.priceGems; const timeDisplay = useMemo(()=>{if(hoursUntilReset <= 0){return'Resets now';}if(hoursUntilReset < 1){return`${Math.floor(hoursUntilReset * 60)}m left`;}if(hoursUntilReset < 24){return`${Math.floor(hoursUntilReset)}h left`;}return`${Math.floor(hoursUntilReset / 24)}d ${Math.floor(hoursUntilReset % 24)}h left`;},[hoursUntilReset]); const urgencyLevel = useMemo(()=>{if(hasPurchasedThisWeek){return'purchased';}if(hoursUntilReset <= 6){return'critical';}if(hoursUntilReset <= 24){return'high';}return'normal';},[hasPurchasedThisWeek,hoursUntilReset]); const handlePress = ()=>{triggerHaptic('impactLight'); capture(EconomyEvents.SHOP_VIEWED,{source:'xp_bundle'}); onViewDetails?.();}; const handlePurchase = async()=>{if(!canAfford || hasPurchasedThisWeek){return;}triggerHaptic('success'); const success = await onPurchase(); if(success){capture(EconomyEvents.REWARD_CLAIMED,{item_id:WEEKLY_BUNDLE_ID,item_name:BUNDLE_CONFIG.name,source:'xp_bundle_purchase'});}}; const isDisabled = hasPurchasedThisWeek || !canAfford; return<Animated.View entering={FadeInRight.duration(400)}style={[styles.container,pulseStyle]}>
      <Pressable onPress={handlePress}style={[styles.card,{backgroundColor:colors.background.secondary},hasPurchasedThisWeek && styles.purchasedCard]}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
        {}
        <LinearGradient colors={hasPurchasedThisWeek ? ['#6B7280','#6B7280'] : XP_GRADIENT}style={styles.borderGradient}/>

        {}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.icon}>{BUNDLE_CONFIG.icon}</Text>
            <View>
              <Text variant="h4"fontSize={18}fontWeight="800"color="text.primary">
                {BUNDLE_CONFIG.name}
              </Text>
              <Text variant="bodySmall"color="text.secondary">
                Limited Weekly Offer
              </Text>
            </View>
          </View>

          {}
          <View style={[styles.urgencyBadge,urgencyLevel === 'critical' && styles.criticalBadge,urgencyLevel === 'high' && styles.highBadge,hasPurchasedThisWeek && styles.purchasedBadge]}>
            <Text style={[styles.urgencyText,hasPurchasedThisWeek && styles.purchasedText]}>{hasPurchasedThisWeek ? '✓ CLAIMED' : urgencyLevel === 'critical' ? '🔥 ' + timeDisplay.toUpperCase() : urgencyLevel === 'high' ? '⏰ ' + timeDisplay : timeDisplay}</Text>
          </View>
        </View>

        {}
        <View style={styles.details}>
          <View style={styles.bonusRow}>
            <Text style={styles.bonusValue}>{BUNDLE_CONFIG.bonusMultiplier}x XP</Text>
            <Text variant="body"color="text.secondary">
              for next {BUNDLE_CONFIG.sessionCount} sessions
            </Text>
          </View>

          {}
          <View style={styles.valueProps}>
            <View style={styles.valueTag}>
              <Text style={styles.tagText}>💎 {BUNDLE_CONFIG.savingsPercent}% value</Text>
            </View>
            <View style={styles.valueTag}>
              <Text style={styles.tagText}>⚡ Instant activation</Text>
            </View>
            <View style={styles.valueTag}>
              <Text style={styles.tagText}>🎁 Stackable</Text>
            </View>
          </View>

          {}
          {hasPurchasedThisWeek && <View style={styles.activeSessions}>
              <Text variant="bodySmall"color="text.secondary">
                Active: {BUNDLE_CONFIG.sessionCount} sessions remaining
              </Text>
              <View style={styles.progressDots}>
                {Array.from({length:BUNDLE_CONFIG.sessionCount}).map((_,i)=><View key={i}style={[styles.dot,{backgroundColor:colors.success.DEFAULT}]}/>)}
              </View>
            </View>}
        </View>

        {}
        <View style={styles.footer}>
          <View style={styles.priceSection}>
            <Text variant="h3"fontSize={24}fontWeight="800"color={canAfford && !hasPurchasedThisWeek ? 'primary.DEFAULT' : 'text.tertiary'}>
              💎 {BUNDLE_CONFIG.priceGems}
            </Text>
            <Text variant="caption"color="text.tertiary">
              Weekly limit: 1
            </Text>
          </View>

          {hasPurchasedThisWeek ? <View style={styles.purchasedButton}>
              <Text style={styles.purchasedButtonText}>✓ Purchased</Text>
            </View> : <Button onPress={handlePurchase}disabled={!canAfford}variant={canAfford ? 'primary' : 'secondary'}size="md"style={!canAfford ? styles.disabledButton : styles.buyButton}accessibilityLabel="Action button"accessibilityRole="button"accessibilityHint="Activates this control">
              {canAfford ? 'Get Boost ⚡' : 'Need Gems'}
            </Button>}
        </View>

        {}
        {!hasPurchasedThisWeek && hoursUntilReset < 48 && <Text style={styles.fomoText}>⚡ This deal expires in {timeDisplay} — then it's gone for a week!</Text>}
      </Pressable>
    </Animated.View>;}const styles = createSheet({container:{margin:16},card:{borderRadius:20,padding:20,borderWidth:2,borderColor:'transparent',overflow:'hidden'},purchasedCard:{opacity:0.8,borderColor:'#6B7280'},borderGradient:{position:'absolute',top:0,left:0,right:0,height:4},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16},titleSection:{flexDirection:'row',alignItems:'center',gap:12,flex:1},icon:{fontSize:40},urgencyBadge:{backgroundColor:'rgba(139, 92, 246, 0.15)',paddingHorizontal:10,paddingVertical:6,borderRadius:12},criticalBadge:{backgroundColor:'rgba(239, 68, 68, 0.2)'},highBadge:{backgroundColor:'rgba(245, 158, 11, 0.2)'},purchasedBadge:{backgroundColor:'rgba(16, 185, 129, 0.2)'},urgencyText:{fontSize:11,fontWeight:'700',color:'#8B5CF6'},purchasedText:{color:'#10B981'},details:{gap:12,marginBottom:16},bonusRow:{flexDirection:'row',alignItems:'baseline',gap:8},bonusValue:{fontSize:28,fontWeight:'800',color:'#8B5CF6'},valueProps:{flexDirection:'row',flexWrap:'wrap',gap:8},valueTag:{backgroundColor:'rgba(139, 92, 246, 0.1)',paddingHorizontal:10,paddingVertical:4,borderRadius:8},tagText:{fontSize:11,fontWeight:'600',color:'#8B5CF6'},activeSessions:{backgroundColor:'rgba(16, 185, 129, 0.1)',borderRadius:12,padding:12,gap:8},progressDots:{flexDirection:'row',gap:4},dot:{width:8,height:8,borderRadius:4},footer:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingTop:16,borderTopWidth:1,borderTopColor:'rgba(0,0,0,0.05)'},priceSection:{gap:4},buyButton:{minWidth:120,backgroundColor:'#8B5CF6'},disabledButton:{backgroundColor:'#6B7280'},purchasedButton:{backgroundColor:'#10B981',paddingHorizontal:20,paddingVertical:12,borderRadius:12},purchasedButtonText:{color:'#FFFFFF',fontSize:14,fontWeight:'700'},fomoText:{marginTop:12,fontSize:12,color:'#F59E0B',fontWeight:'600',textAlign:'center',fontStyle:'italic'}}); export default XPBundleCard;
