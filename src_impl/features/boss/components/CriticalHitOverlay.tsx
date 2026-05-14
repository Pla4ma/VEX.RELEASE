import React,{useEffect}from'react';import Animated,{useSharedValue,useAnimatedStyle,withSpring,withTiming,withRepeat,withSequence,FadeIn,FadeOut}from'react-native-reanimated';import{Box,Text}from'@/components/primitives';import{useTheme}from'@/theme';import{CritStatus,getCritStatusText,bossCritService}from'../critical-hit-system';interface CriticalHitOverlayProps{sessionId:string;visible:boolean;onDismiss:()=>void;bossName?:string;}interface NearMissDisplayProps{nearMissPercent:number;baseDamage:number;potentialCritDamage:number;}export const CriticalHitOverlay:React.FC<CriticalHitOverlayProps>=({sessionId,visible,onDismiss:_onDismiss,bossName})=>{const{theme}=useTheme();const status=getCritStatusText(sessionId);const pulseScale=useSharedValue(1);const glowOpacity=useSharedValue(0.5);const shakeX=useSharedValue(0);useEffect(()=>{pulseScale.value=withRepeat(withSequence(withTiming(1.05,{duration:800}),withTiming(1,{duration:800})),-1,true);glowOpacity.value=withRepeat(withSequence(withTiming(1,{duration:600}),withTiming(0.3,{duration:600})),-1,true);shakeX.value=withRepeat(withSequence(withTiming(-3,{duration:50}),withTiming(3,{duration:50}),withTiming(0,{duration:50})),-1,true);bossCritService.markOverlayShown(sessionId);},[glowOpacity,pulseScale,sessionId,shakeX]);const containerStyle=useAnimatedStyle(()=>({transform:[{scale:pulseScale.value}]}));const glowStyle=useAnimatedStyle(()=>({opacity:glowOpacity.value}));const textShakeStyle=useAnimatedStyle(()=>({transform:[{translateX:shakeX.value}]}));if(!visible||!status.showOverlay){return null;}return<Animated.View entering={FadeIn}exiting={FadeOut}style={[{position:'absolute',top:80,left:16,right:16,zIndex:100},containerStyle]}>
      {}
      <Animated.View style={[{position:'absolute',top:-10,left:-10,right:-10,bottom:-10,backgroundColor:theme.colors.warning.DEFAULT,borderRadius:20},glowStyle]}pointerEvents="none"/>

      {}
      <Box p={4}borderRadius={16}bg={theme.colors.background.secondary}style={{borderWidth:2,borderColor:theme.colors.warning.DEFAULT,shadowColor:theme.colors.warning.DEFAULT,shadowOffset:{width:0,height:0},shadowOpacity:0.5,shadowRadius:20,elevation:10}}>
        <Box flexDirection="row"alignItems="center"gap={3}>
          {}
          <Animated.View style={textShakeStyle}>
            <Box width={50}height={50}borderRadius={25}bg={theme.colors.warning.DEFAULT}alignItems="center"justifyContent="center">
              <Text style={{fontSize:28}}>⚡</Text>
            </Box>
          </Animated.View>

          {}
          <Box flex={1}>
            <Animated.Text style={textShakeStyle}>
              <Text variant="h4"color={theme.colors.warning.DEFAULT}style={{textShadowColor:theme.colors.warning.DEFAULT,textShadowOffset:{width:0,height:0},textShadowRadius:8}}>
                CRITICAL HIT CHANCE!
              </Text>
            </Animated.Text>

            <Text variant="bodySmall"color={theme.colors.text.secondary}mt={1}>
              {bossName?`Maintain focus to deal CRITICAL damage to ${bossName}!`:'Maintain focus for 2x damage!'}
            </Text>

            <Text variant="caption"color={theme.colors.warning.DEFAULT}mt={1}>
              Don't pause - stay focused!
            </Text>
          </Box>
        </Box>

        {}
        <Box flexDirection="row"justifyContent="space-around"mt={3}pt={3}style={{borderTopWidth:1,borderTopColor:theme.colors.border.light}}>
          <Box alignItems="center">
            <Text variant="caption"color={theme.colors.text.tertiary}>
              Normal Damage
            </Text>
            <Text variant="body"color={theme.colors.text.secondary}>
              1x
            </Text>
          </Box>
          <Box alignItems="center">
            <Text variant="caption"color={theme.colors.warning.DEFAULT}>
              Critical Damage
            </Text>
            <Text variant="body"color={theme.colors.warning.DEFAULT}fontWeight="bold">
              2x ⚡
            </Text>
          </Box>
        </Box>
      </Box>
    </Animated.View>;};export const NearMissDisplay:React.FC<NearMissDisplayProps>=({nearMissPercent,baseDamage,potentialCritDamage})=>{const{theme}=useTheme();const fadeIn=useSharedValue(0);const slideUp=useSharedValue(20);useEffect(()=>{fadeIn.value=withTiming(1,{duration:400});slideUp.value=withSpring(0,{damping:12,stiffness:100});},[fadeIn,slideUp]);const containerStyle=useAnimatedStyle(()=>({opacity:fadeIn.value,transform:[{translateY:slideUp.value}]}));return<Animated.View style={containerStyle}>
      <Box p={4}borderRadius={16}bg={theme.colors.background.secondary}style={{borderWidth:2,borderColor:theme.colors.accent.purple}}>
        <Box alignItems="center">
          <Text style={{fontSize:32}}>💫</Text>
          <Text variant="h3"color={theme.colors.accent.purple}mt={1}>
            Almost a Critical Hit!
          </Text>
          <Text variant="body"color={theme.colors.text.secondary}textAlign="center"mt={1}>
            Rolled {nearMissPercent}% - just missed the crit window!
          </Text>
        </Box>

        {}
        <Box flexDirection="row"justifyContent="space-around"mt={4}pt={3}style={{borderTopWidth:1,borderTopColor:theme.colors.border.light}}>
          <Box alignItems="center">
            <Text variant="caption"color={theme.colors.text.tertiary}>
              Dealt
            </Text>
            <Text variant="h4"color={theme.colors.text.primary}>
              {baseDamage.toLocaleString()}
            </Text>
          </Box>
          <Box alignItems="center"justifyContent="center">
            <Text style={{fontSize:20}}>→</Text>
          </Box>
          <Box alignItems="center">
            <Text variant="caption"color={theme.colors.warning.DEFAULT}>
              Could Have Been
            </Text>
            <Text variant="h4"color={theme.colors.warning.DEFAULT}>
              {potentialCritDamage.toLocaleString()}
            </Text>
          </Box>
        </Box>

        <Box mt={3}alignItems="center">
          <Text variant="caption"color={theme.colors.text.tertiary}textAlign="center">
            "So close! Next session might be the one..."
          </Text>
        </Box>
      </Box>
    </Animated.View>;};interface CritStatsBadgeProps{userId:string;}export const CritStatsBadge:React.FC<CritStatsBadgeProps>=({userId})=>{const{theme}=useTheme();const stats=bossCritService.getWeeklyStats(userId);const displayText=bossCritService.getCritsThisWeekText(userId);const scaleAnim=useSharedValue(1);useEffect(()=>{if(stats.totalCrits>0){scaleAnim.value=withSequence(withSpring(1.2,{damping:10}),withTiming(1,{duration:200}));}},[scaleAnim,stats.totalCrits]);const badgeStyle=useAnimatedStyle(()=>({transform:[{scale:scaleAnim.value}]}));return<Animated.View style={badgeStyle}>
      <Box flexDirection="row"alignItems="center"gap={2}px={3}py={2}borderRadius={12}style={{backgroundColor:`${theme.colors.warning.DEFAULT}15`,borderWidth:1,borderColor:`${theme.colors.warning.DEFAULT}40`}}>
        <Text style={{fontSize:16}}>⚡</Text>
        <Text variant="caption"color={theme.colors.warning.DEFAULT}fontWeight="semibold">
          {displayText}
        </Text>
        {stats.totalSessions>0&&<Text variant="caption"color={theme.colors.text.tertiary}>
            ({stats.critRate.toFixed(0)}% rate)
          </Text>}
      </Box>
    </Animated.View>;};export function useCriticalHit(sessionId:string,hasBossActive:boolean){const[showOverlay,setShowOverlay]=React.useState(false);const[critResult,setCritResult]=React.useState<{wasCrit:boolean;wasNearMiss:boolean;nearMissPercent?:number;}|null>(null);React.useEffect(()=>{if(hasBossActive){const status=getCritStatusText(sessionId);setShowOverlay(status.showOverlay);}},[sessionId,hasBossActive]);const dismissOverlay=()=>{setShowOverlay(false);bossCritService.markOverlayShown(sessionId);};const applyDamage=(baseDamage:number)=>{const result=bossCritService.applyCritDamage(sessionId,baseDamage);setCritResult({wasCrit:result.wasCrit,wasNearMiss:result.wasNearMiss,nearMissPercent:result.nearMissPercent});return result.finalDamage;};return{showOverlay,dismissOverlay,applyDamage,critResult,isCritActive:critResult?.wasCrit??false,isNearMiss:critResult?.wasNearMiss??false};}export{CritStatus};export default CriticalHitOverlay;
