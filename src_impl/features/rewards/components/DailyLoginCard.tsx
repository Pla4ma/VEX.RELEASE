import React from'react'; import{View,Pressable}from'react-native'; import Animated,{useAnimatedStyle,withSpring,withRepeat,withSequence,withTiming}from'react-native-reanimated'; import{useTheme}from'../../../theme'; import{Text}from'../../../components/primitives/Text'; import{Button}from'../../../components/primitives/Button'; import{Icon}from'../../../icons'; import{useHaptics}from'../../../utils/haptics'; import type{DailyLoginReward}from'../hooks'; interface DailyLoginCardProps{reward:DailyLoginReward|null;canClaim:boolean;isLoading:boolean;isClaiming:boolean;onClaim:()=>Promise<void>;onPress?:()=>void;}export function DailyLoginCard({reward,canClaim,isLoading,isClaiming,onClaim,onPress}:DailyLoginCardProps):JSX.Element{const{theme} = useTheme(); const haptics = useHaptics(); const pulseStyle = useAnimatedStyle(()=>({transform:[{scale:canClaim ? withRepeat(withSequence(withTiming(1,{duration:1000}),withSpring(1.02,{damping:10}),withTiming(1,{duration:1000})),-1,true) : 1}]})); const handleClaim = async()=>{haptics.primaryAction(); await onClaim(); haptics.success();}; const handlePress = ()=>{if(onPress){haptics.light(); onPress();}}; const containerStyle = {marginHorizontal:theme.spacing[4],marginTop:theme.spacing[4],borderRadius:theme.borderRadius.xl,overflow:'hidden'as const}; const contentStyle = {flexDirection:'row'as const,alignItems:'center'as const,padding:theme.spacing[4],backgroundColor:canClaim ? theme.colors.primary[50] : theme.colors.background.secondary,borderWidth:1,borderColor:canClaim ? theme.colors.primary[200] : theme.colors.border.light}; const iconContainerStyle = {width:48,height:48,borderRadius:theme.borderRadius.lg,backgroundColor:canClaim ? theme.colors.primary[100] : theme.colors.background.tertiary,justifyContent:'center'as const,alignItems:'center'as const,marginRight:theme.spacing[3]}; const textContainerStyle = {flex:1}; const dayLabelStyle = {marginBottom:theme.spacing[1]}; const rewardLabelStyle = {opacity:0.8}; const claimButtonStyle = {minWidth:80}; const claimedBadgeStyle = {flexDirection:'row'as const,alignItems:'center'as const,paddingVertical:theme.spacing[2],paddingHorizontal:theme.spacing[3],backgroundColor:theme.colors.success.light,borderRadius:theme.borderRadius.full}; const claimedTextStyle = {marginLeft:theme.spacing[1],color:theme.colors.success.dark}; if(isLoading){return<View style={containerStyle}>
        <View style={contentStyle}>
          <View style={iconContainerStyle}>
            <Icon name="gift"size={24}color={theme.colors.text.tertiary}/>
          </View>
          <View style={textContainerStyle}>
            <Text variant="body"color={theme.colors.text.secondary}>
              Loading daily reward...
            </Text>
          </View>
        </View>
      </View>;}return<Animated.View style={[containerStyle,pulseStyle]}>
      <Pressable onPress={handlePress}disabled={!onPress}>
        <View style={contentStyle}>
          <View style={iconContainerStyle}>
            <Text variant="h4">{reward?.icon ?? '🎁'}</Text>
          </View>

          <View style={textContainerStyle}>
            <Text variant="body"color={theme.colors.text.primary}style={dayLabelStyle}>
              Day {reward?.dayNumber ?? 1} Login Reward
            </Text>
            <Text variant="bodySmall"color={theme.colors.text.secondary}style={rewardLabelStyle}>
              {reward?.label ?? 'Come back tomorrow!'}
            </Text>
          </View>

          {canClaim ? <Button variant="primary"size="sm"onPress={handleClaim}disabled={isClaiming}style={claimButtonStyle}accessibilityLabel="Claim daily login reward"accessibilityRole="button">
              {isClaiming ? '...' : 'Claim'}
            </Button> : <View style={claimedBadgeStyle}>
              <Icon name="check"size={16}color={theme.colors.success[500]}/>
              <Text variant="caption"style={claimedTextStyle}>
                Claimed
              </Text>
            </View>}
        </View>
      </Pressable>
    </Animated.View>;}
