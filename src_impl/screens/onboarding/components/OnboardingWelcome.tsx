import React,{useEffect}from'react'; import{Pressable,useWindowDimensions}from'react-native'; import Animated,{useSharedValue,useAnimatedStyle,withRepeat,withTiming,withSequence,withDelay,FadeIn,FadeInUp,Easing}from'react-native-reanimated'; import{Box}from'../../../components/primitives/Box'; import{Button}from'../../../components/primitives/Button'; import{Text}from'../../../components/primitives/Text'; import{useTheme}from'../../../theme'; interface OnboardingWelcomeProps{onContinue:()=>void;}function AnimatedBossHealth():JSX.Element{const{theme} = useTheme(); const healthWidth = useSharedValue(100); const bossShake = useSharedValue(0); const glowOpacity = useSharedValue(0.5); useEffect(()=>{healthWidth.value = withRepeat(withTiming(30,{duration:3000,easing:Easing.inOut(Easing.ease)}),-1,true); bossShake.value = withRepeat(withSequence(withDelay(500,withTiming(-2,{duration:100})),withTiming(2,{duration:100}),withTiming(0,{duration:100})),-1,false); glowOpacity.value = withRepeat(withSequence(withTiming(1,{duration:1000}),withTiming(0.5,{duration:1000})),-1,true);},[healthWidth,bossShake,glowOpacity]); const healthStyle = useAnimatedStyle(()=>({width:`${healthWidth.value}%`})); const bossStyle = useAnimatedStyle(()=>({transform:[{translateX:bossShake.value}]})); const glowStyle = useAnimatedStyle(()=>({opacity:glowOpacity.value})); return<Box alignItems="center"gap="md">
      {}
      <Animated.View style={bossStyle}>
        <Animated.View style={[{width:120,height:120,borderRadius:60,backgroundColor:`${theme.colors.error[500]}30`,justifyContent:'center',alignItems:'center',borderWidth:3,borderColor:theme.colors.error.DEFAULT}]}>
          <Animated.View style={[{...StyleSheet.absoluteFillObject,backgroundColor:theme.colors.error.DEFAULT,borderRadius:60},glowStyle]}/>
          <Text fontSize={60}>👹</Text>
        </Animated.View>
      </Animated.View>

      {}
      <Box width={200}gap="xs">
        {}
        <Box flexDirection="row"justifyContent="space-between">
          <Text variant="caption"color="text.tertiary">
            Slacker the Procrastinator
          </Text>
          <Animated.Text style={{fontSize:12,color:theme.colors.error.DEFAULT,fontWeight:'700'}}>
            {healthWidth.value.toFixed(0)}% HP
          </Animated.Text>
        </Box>

        {}
        <Box height={12}borderRadius="full"bg={theme.colors.background.tertiary}overflow="hidden">
          {}
          <Animated.View style={[{height:'100%',backgroundColor:theme.colors.error.DEFAULT,borderRadius:6},healthStyle]}/>
        </Box>

        {}
        <Animated.View entering={FadeInUp.delay(1000).duration(500)}>
          <Text variant="caption"color="success.DEFAULT"textAlign="center">
            Every focused minute = damage!
          </Text>
        </Animated.View>
      </Box>
    </Box>;}import{StyleSheet}from'react-native'; export function OnboardingWelcome({onContinue}:OnboardingWelcomeProps):JSX.Element{const{theme} = useTheme(); const{width} = useWindowDimensions(); return<Box flex={1}justifyContent="space-between"px="xl"py="2xl">
      {}
      <Animated.View entering={FadeIn.duration(600)}>
        <Box alignItems="center"gap="lg"mt="2xl">
          {}
          <Box width={64}height={64}borderRadius="xl"bg={theme.colors.primary[500]}justifyContent="center"alignItems="center">
            <Text fontSize={32}fontWeight="800"color={theme.colors.text.inverse}>
              V
            </Text>
          </Box>

          {}
          <Box alignItems="center"gap="sm">
            <Text variant="h1"color="text.primary"textAlign="center"style={{fontSize:32,lineHeight:40}}>
              Your distractions{'\n'}have health bars.
            </Text>
            <Text variant="body"color="text.secondary"textAlign="center"px="md">
              Focus to deal damage. Build streaks. Defeat your enemies.
            </Text>
          </Box>
        </Box>
      </Animated.View>

      {}
      <Animated.View entering={FadeInUp.delay(300).duration(600)}>
        <AnimatedBossHealth/>
      </Animated.View>

      {}
      <Animated.View entering={FadeInUp.delay(600).duration(400)}>
        <Box gap="md">
          <Button size="lg"variant="primary"fullWidth onPress={onContinue}accessibilityLabel="Let&apos;s Go button"accessibilityRole="button"accessibilityHint="Activates this control">
            Let&apos;s Go
          </Button>

          <Text variant="caption"color="text.tertiary"textAlign="center">
            Takes 90 seconds. No email required.
          </Text>
        </Box>
      </Animated.View>
    </Box>;}export default OnboardingWelcome;
