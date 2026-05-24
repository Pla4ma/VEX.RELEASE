import React from'react'; import{Pressable}from'react-native'; import Animated,{useAnimatedStyle,withRepeat,withSequence,withTiming}from'react-native-reanimated'; import{Box}from'../../../components/primitives/Box'; import{Text}from'../../../components/primitives/Text'; import{useTheme}from'../../../theme'; export type StreakRiskLevel='NONE'|'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'; export interface StreakRiskBannerProps{riskLevel:StreakRiskLevel;hoursRemaining:number;streakDays:number;suggestedDuration:number;onStartSession:(duration:number)=>void;}function getRiskConfig(riskLevel:StreakRiskLevel,theme:ReturnType<typeof useTheme>['theme']){switch(riskLevel){case'CRITICAL':return{bg:`${theme.colors.error.DEFAULT}30`,border:theme.colors.error.DEFAULT,text:theme.colors.error.DEFAULT,emoji:'🚨',label:'CRITICAL',message:'LAST CHANCE — Start now!',pulse:true}; case'HIGH':return{bg:`${theme.colors.error.DEFAULT}20`,border:theme.colors.error.light,text:theme.colors.error.DEFAULT,emoji:'🔥',label:'HIGH RISK',message:'Streak at risk — act now',pulse:true}; case'MEDIUM':return{bg:`${theme.colors.warning.DEFAULT}20`,border:theme.colors.warning.DEFAULT,text:theme.colors.warning.dark,emoji:'⏰',label:'AT RISK',message:'Start a session soon',pulse:false}; default:return null;}}export function StreakRiskBanner({riskLevel,hoursRemaining,streakDays,suggestedDuration,onStartSession}:StreakRiskBannerProps):JSX.Element|null{const{theme} = useTheme(); const config = getRiskConfig(riskLevel,theme); const pulseStyle = useAnimatedStyle(()=>({transform:[{scale:config?.pulse ? withRepeat(withSequence(withTiming(1,{duration:800}),withTiming(1.02,{duration:800})),-1,true) : 1}],borderColor:config?.pulse ? withRepeat(withSequence(withTiming(config.border,{duration:500}),withTiming(`${config.border}80`,{duration:500})),-1,true) : config?.border})); if(riskLevel === 'NONE' || riskLevel === 'LOW'){return null;}if(!config){return null;}return<Pressable onPress={()=>onStartSession(suggestedDuration)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
      <Animated.View style={[{marginHorizontal:theme.spacing[4],marginTop:theme.spacing[4],borderRadius:12,borderWidth:2,overflow:'hidden'},pulseStyle]}>
        <Box bg={config.bg}p="md">
          {}
          <Box flexDirection="row"alignItems="center"gap="md">
            {}
            <Box width={44}height={44}borderRadius="full"bg={`${config.border}30`}justifyContent="center"alignItems="center">
              <Text fontSize={24}>{config.emoji}</Text>
            </Box>

            <Box flex={1}>
              {}
              <Box flexDirection="row"alignItems="center"gap="sm"mb="xs">
                <Text variant="caption"color={config.text}fontWeight="700">
                  {config.label}
                </Text>
                <Text variant="caption"color="text.tertiary">
                  · {hoursRemaining}h left
                </Text>
              </Box>

              {}
              <Text variant="body"color="text.primary"fontWeight="600">
                🔥 {streakDays}-day streak at risk
              </Text>

              {}
              <Text variant="bodySmall"color={config.text}>
                {config.message}
              </Text>
            </Box>

            {}
            <Text fontSize={20}color={config.text}>
              →
            </Text>
          </Box>
        </Box>
      </Animated.View>
    </Pressable>;}export function StreakCriticalAlert({hoursRemaining,streakDays,onStartSession}:{hoursRemaining:number;streakDays:number;onStartSession:()=>void;}):JSX.Element{const{theme} = useTheme(); const pulseStyle = useAnimatedStyle(()=>({backgroundColor:withRepeat(withSequence(withTiming(`${theme.colors.error.DEFAULT}40`,{duration:400}),withTiming(`${theme.colors.error.DEFAULT}20`,{duration:400})),-1,true)})); const shakeStyle = useAnimatedStyle(()=>({transform:[{translateX:withRepeat(withSequence(withTiming(-2,{duration:50}),withTiming(2,{duration:50}),withTiming(0,{duration:50})),5,true)}]})); return<Pressable onPress={onStartSession}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
      <Animated.View style={[pulseStyle]}>
        <Box px="lg"py="md"style={{borderBottomWidth:2,borderBottomColor:theme.colors.error.DEFAULT}}>
          <Animated.View style={[shakeStyle]}>
            <Box alignItems="center"gap="xs">
              <Box flexDirection="row"alignItems="center"gap="sm">
                <Text fontSize={20}>🚨</Text>
                <Text variant="h4"color="error.DEFAULT"fontWeight="800">
                  LAST CHANCE
                </Text>
                <Text fontSize={20}>🚨</Text>
              </Box>
              <Text variant="body"color="text.primary"textAlign="center">
                Your 🔥 {streakDays}-day streak ends in {hoursRemaining} hours!
              </Text>
              <Text variant="bodySmall"color="error.DEFAULT"fontWeight="600">
                Tap to start a session NOW →
              </Text>
            </Box>
          </Animated.View>
        </Box>
      </Animated.View>
    </Pressable>;}export default StreakRiskBanner;
