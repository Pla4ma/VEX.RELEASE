import React from'react';import Animated,{FadeIn,FadeOut,useAnimatedStyle,withRepeat,withTiming,withSequence,withDelay,withSpring}from'react-native-reanimated';import{Box}from'../../../components/primitives/Box';import{Text}from'../../../components/primitives/Text';import{useTheme}from'../../../theme';export interface NearMissDisplayProps{xpAmount:number;onComplete:()=>void;}function Sparkle({size,delay,x,y}:{size:number;delay:number;x:number;y:number;}):JSX.Element{const sparkleStyle=useAnimatedStyle(()=>({opacity:withDelay(delay,withRepeat(withSequence(withTiming(0,{duration:0}),withTiming(1,{duration:200}),withTiming(0,{duration:200})),3,false)),transform:[{scale:withDelay(delay,withSequence(withSpring(0,{damping:10}),withSpring(1,{damping:5}),withSpring(0,{damping:10})))}]}));return<Animated.View style={[{position:'absolute',left:x,top:y},sparkleStyle]}>
      <Text fontSize={size}>✨</Text>
    </Animated.View>;}export function NearMissDisplay({xpAmount,onComplete}:NearMissDisplayProps):JSX.Element{const{theme}=useTheme();React.useEffect(()=>{const timer=setTimeout(()=>{onComplete();},2500);return()=>clearTimeout(timer);},[onComplete]);const containerStyle=useAnimatedStyle(()=>({transform:[{scale:withSpring(1.05,{damping:12,stiffness:100})}]}));return<Animated.View entering={FadeIn.duration(400)}exiting={FadeOut.duration(300)}style={[{width:'100%',alignItems:'center'},containerStyle]}>
      <Box p="xl"borderRadius="xl"bg={`${theme.colors.info[500]}15`}borderWidth={2}borderColor="info.DEFAULT"alignItems="center"position="relative"overflow="visible">
        {}
        <Sparkle size={20}delay={0}x={-30}y={-20}/>
        <Sparkle size={16}delay={100}x={100}y={-15}/>
        <Sparkle size={24}delay={200}x={-20}y={60}/>
        <Sparkle size={18}delay={300}x={120}y={50}/>
        <Sparkle size={14}delay={400}x={-40}y={30}/>

        {}
        <Box px="md"py="xs"borderRadius="full"bg="info.DEFAULT"mb="md">
          <Text variant="caption"color="text.inverse"fontWeight="700">
            ✨ SO CLOSE!
          </Text>
        </Box>

        {}
        <Text variant="h4"color="text.primary"textAlign="center"mb="sm">
          Almost a Critical!
        </Text>
        <Text variant="body"color="text.secondary"textAlign="center"mb="lg">
          Just a little more luck next time...
        </Text>

        {}
        <Box flexDirection="row"alignItems="center"gap="sm">
          <Text fontSize={28}>✨</Text>
          <Text variant="h2"color="info.DEFAULT"fontWeight="800">
            +{xpAmount}
          </Text>
          <Text variant="body"color="text.tertiary">
            XP
          </Text>
        </Box>

        {}
        <Text variant="caption"color="text.tertiary"mt="md"textAlign="center">
          Keep going — your next session could be legendary!
        </Text>
      </Box>
    </Animated.View>;}export default NearMissDisplay;
