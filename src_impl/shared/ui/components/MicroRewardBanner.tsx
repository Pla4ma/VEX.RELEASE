import React,{useEffect}from'react';import{View,ViewStyle,Pressable}from'react-native';import Animated,{useSharedValue,useAnimatedStyle,withSpring,FadeInUp,FadeOutUp}from'react-native-reanimated';import{Text}from'../../../components/primitives/Text';import{useTheme}from'../../../theme';import{triggerHaptic}from'../../../utils/haptics';export type RewardType='xp'|'coins'|'gems'|'streak'|'level'|'achievement'|'milestone';export interface MicroRewardBannerProps{type:RewardType;amount?:number;label?:string;description?:string;icon?:string;onPress?:()=>void;onDismiss?:()=>void;autoDismiss?:boolean;autoDismissDelay?:number;style?:ViewStyle;showOnce?:boolean;}const REWARD_CONFIG:Record<RewardType,{icon:string;color:string;label:string;}>={xp:{icon:'⭐',color:'#6366F1',label:'XP Gained'},coins:{icon:'🪙',color:'#EAB308',label:'Coins'},gems:{icon:'💎',color:'#3B82F6',label:'Gems'},streak:{icon:'🔥',color:'#F97316',label:'Streak'},level:{icon:'📈',color:'#22C55E',label:'Level Up'},achievement:{icon:'🏆',color:'#A855F7',label:'Achievement'},milestone:{icon:'🎯',color:'#EC4899',label:'Milestone'}};export const MicroRewardBanner:React.FC<MicroRewardBannerProps>=({type,amount,label:customLabel,description,icon:customIcon,onPress,onDismiss,autoDismiss=false,autoDismissDelay=3000,style})=>{const{theme}=useTheme();const scale=useSharedValue(1);const config=REWARD_CONFIG[type];const displayIcon=customIcon||config.icon;const displayLabel=customLabel||config.label;const displayColor=config.color;useEffect(()=>{void triggerHaptic('success');},[]);useEffect(()=>{if(!autoDismiss){return;}const timer=setTimeout(()=>{onDismiss?.();},autoDismissDelay);return()=>clearTimeout(timer);},[autoDismiss,autoDismissDelay,onDismiss]);const animatedStyle=useAnimatedStyle(()=>({transform:[{scale:scale.value}]}));const handlePressIn=()=>{scale.value=withSpring(0.97,{damping:15,stiffness:300});};const handlePressOut=()=>{scale.value=withSpring(1,{damping:15,stiffness:300});};const amountText=amount!==undefined?`+${amount.toLocaleString()}`:null;const Wrapper=onPress?Pressable:View;return<Animated.View entering={FadeInUp.duration(300).springify()}exiting={FadeOutUp.duration(200)}style={[{backgroundColor:theme.colors.background.secondary,borderRadius:theme.borderRadius.xl,borderWidth:1,borderColor:`${displayColor}40`,paddingVertical:theme.spacing[3],paddingHorizontal:theme.spacing[4],flexDirection:'row',alignItems:'center',gap:theme.spacing[3],shadowColor:displayColor,shadowOffset:{width:0,height:2},shadowOpacity:0.1,shadowRadius:8,elevation:2},style]}>
      <Wrapper onPress={onPress}onPressIn={handlePressIn}onPressOut={handlePressOut}disabled={!onPress}style={[{flexDirection:'row',alignItems:'center',gap:theme.spacing[3],flex:1},animatedStyle]}>
        {}
        <View style={{width:40,height:40,borderRadius:20,backgroundColor:`${displayColor}20`,alignItems:'center',justifyContent:'center'}}>
          <Text fontSize={20}>{displayIcon}</Text>
        </View>

        {}
        <View style={{flex:1,gap:2}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:theme.spacing[2]}}>
            <Text variant="bodySmall"color={theme.colors.text.primary}style={{fontWeight:'700'}}>
              {displayLabel}
            </Text>
            {amountText&&<Text variant="bodySmall"color={displayColor}style={{fontWeight:'800'}}>
                {amountText}
              </Text>}
          </View>
          {description&&<Text variant="caption"color={theme.colors.text.secondary}>
              {description}
            </Text>}
        </View>
      </Wrapper>

      {}
      {onDismiss&&<Pressable onPress={onDismiss}hitSlop={{top:10,bottom:10,left:10,right:10}}style={{padding:theme.spacing[1]}}accessibilityLabel="✕ button"accessibilityRole="button"accessibilityHint="Activates this control">
          <Text fontSize={16}color={theme.colors.text.tertiary}>✕</Text>
        </Pressable>}
    </Animated.View>;};export interface CompactRewardBadgeProps{type:RewardType;amount:number;style?:ViewStyle;}export const CompactRewardBadge:React.FC<CompactRewardBadgeProps>=({type,amount,style})=>{const{theme}=useTheme();const config=REWARD_CONFIG[type];return<Animated.View entering={FadeInUp.duration(200)}style={[{flexDirection:'row',alignItems:'center',gap:theme.spacing[1],backgroundColor:`${config.color}15`,paddingVertical:theme.spacing[1],paddingHorizontal:theme.spacing[2],borderRadius:theme.borderRadius.lg,borderWidth:1,borderColor:`${config.color}30`},style]}>
      <Text fontSize={12}>{config.icon}</Text>
      <Text variant="caption"color={config.color}style={{fontWeight:'700'}}>
        +{amount.toLocaleString()}
      </Text>
    </Animated.View>;};export default MicroRewardBanner;
