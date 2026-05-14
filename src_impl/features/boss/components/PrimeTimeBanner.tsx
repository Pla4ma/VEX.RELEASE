import React,{useEffect,useState}from'react';import{Pressable}from'react-native';import Animated,{useAnimatedStyle,withRepeat,withSequence,withTiming,withDelay,interpolate,Extrapolate}from'react-native-reanimated';import{Box}from'../../../components/primitives/Box';import{Text}from'../../../components/primitives/Text';import{Button}from'../../../components/primitives/Button';import{useTheme}from'../../../theme';import{type PrimeTimeWindow,formatTimeRemaining}from'../BossSpawnScheduler';interface PrimeTimeBannerProps{window:PrimeTimeWindow;bossName:string;onPress:()=>void;compact?:boolean;}function useGlowAnimation():ReturnType<typeof useAnimatedStyle>{return useAnimatedStyle(()=>({shadowOpacity:withRepeat(withSequence(withTiming(0.3,{duration:1000}),withTiming(0.6,{duration:1000})),-1,true),transform:[{scale:withRepeat(withSequence(withTiming(1,{duration:1000}),withTiming(1.02,{duration:1000})),-1,true)}]}));}function LightningAnimation():JSX.Element{const animatedStyle=useAnimatedStyle(()=>({opacity:withRepeat(withSequence(withTiming(0,{duration:100}),withTiming(1,{duration:100}),withTiming(0,{duration:100}),withDelay(800,withTiming(0,{duration:100}))),-1,false),transform:[{translateX:withRepeat(withSequence(withTiming(-2,{duration:50}),withTiming(2,{duration:50}),withTiming(0,{duration:50})),-1,false)}]}));return<Animated.View style={animatedStyle}>
      <Text fontSize={24}>⚡</Text>
    </Animated.View>;}export function PrimeTimeBanner({window,bossName,onPress,compact=false}:PrimeTimeBannerProps):JSX.Element{const{theme}=useTheme();const glowStyle=useGlowAnimation();const[displayTime,setDisplayTime]=useState(window.timeRemainingMinutes);useEffect(()=>{setDisplayTime(window.timeRemainingMinutes);const interval=setInterval(()=>{setDisplayTime(prev=>Math.max(0,prev-1));},60000);return()=>clearInterval(interval);},[window.timeRemainingMinutes]);if(compact){return<Pressable onPress={onPress}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
        <Animated.View style={glowStyle}>
          <Box flexDirection="row"alignItems="center"gap="md"p="md"borderRadius="lg"bg="warning.DEFAULT"style={{shadowColor:theme.colors.warning.DEFAULT,shadowOffset:{width:0,height:0},shadowRadius:12,elevation:8}}>
            <LightningAnimation/>
            <Box flex={1}>
              <Text variant="caption"color="white"fontWeight="700">
                ⚡ PRIME TIME ACTIVE
              </Text>
              <Text variant="body"color="white"fontWeight="600">
                {formatTimeRemaining(displayTime)} remaining • 2× XP on {bossName}
              </Text>
            </Box>
            <Text fontSize={20}>→</Text>
          </Box>
        </Animated.View>
      </Pressable>;}return<Pressable onPress={onPress}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
      <Animated.View style={glowStyle}>
        <Box p="xl"borderRadius="xl"style={{backgroundColor:theme.colors.warning.DEFAULT,shadowColor:theme.colors.warning.DEFAULT,shadowOffset:{width:0,height:0},shadowRadius:20,elevation:10}}>
          {}
          <Box flexDirection="row"alignItems="center"justifyContent="space-between"mb="md">
            <Box flexDirection="row"alignItems="center"gap="sm">
              <LightningAnimation/>
              <Text variant="caption"color="white"fontWeight="800">
                PRIME TIME ACTIVE
              </Text>
            </Box>
            <Box px="md"py="xs"borderRadius="full"style={{backgroundColor:'rgba(255,255,255,0.3)'}}>
              <Text variant="caption"color="white"fontWeight="700">
                2× XP
              </Text>
            </Box>
          </Box>

          {}
          <Box alignItems="center"gap="sm"mb="lg">
            <Text variant="h3"color="white"fontWeight="700"textAlign="center">
              {bossName}
            </Text>
            <Text variant="body"color="white"textAlign="center">
              Deal double damage during Prime Time!
            </Text>
          </Box>

          {}
          <Box flexDirection="row"alignItems="center"justifyContent="center"gap="sm"mb="lg"p="md"borderRadius="lg"style={{backgroundColor:'rgba(0,0,0,0.2)'}}>
            <Text fontSize={32}>⏰</Text>
            <Text fontSize={36}fontWeight="900"color="white">
              {formatTimeRemaining(displayTime)}
            </Text>
            <Text variant="body"color="white">
              remaining
            </Text>
          </Box>

          {}
          <Button variant="secondary"size="lg"onPress={onPress}fullWidth accessibilityLabel="⚔️ Fight Now — Earn 2× XP button"accessibilityRole="button"accessibilityHint="Activates this control">
            ⚔️ Fight Now — Earn 2× XP
          </Button>
        </Box>
      </Animated.View>
    </Pressable>;}export function PrePrimeTimeBanner({window,bossName,onPress}:Omit<PrimeTimeBannerProps,'compact'>):JSX.Element{const{theme}=useTheme();const[displayTime,setDisplayTime]=useState(window.timeRemainingMinutes);useEffect(()=>{setDisplayTime(window.timeRemainingMinutes);const interval=setInterval(()=>{setDisplayTime(prev=>Math.max(0,prev-1));},60000);return()=>clearInterval(interval);},[window.timeRemainingMinutes]);return<Pressable onPress={onPress}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
      <Box p="lg"borderRadius="xl"bg="background.secondary"borderWidth={2}borderColor="warning.DEFAULT"style={{shadowColor:theme.colors.warning.DEFAULT,shadowOffset:{width:0,height:2},shadowOpacity:0.15,shadowRadius:8,elevation:4}}>
        <Box flexDirection="row"alignItems="center"gap="md">
          <Box width={48}height={48}borderRadius="full"justifyContent="center"alignItems="center"style={{backgroundColor:`${theme.colors.warning.DEFAULT}20`}}>
            <Text fontSize={24}>⏰</Text>
          </Box>

          <Box flex={1}>
            <Text variant="body"color="text.primary"fontWeight="600">
              Prime Time starts in {formatTimeRemaining(displayTime)}
            </Text>
            <Text variant="caption"color="text.secondary">
              {bossName} • 2× XP window opening soon
            </Text>
          </Box>

          <Text fontSize={20}color="warning.DEFAULT">
            →
          </Text>
        </Box>
      </Box>
    </Pressable>;}export default PrimeTimeBanner;
