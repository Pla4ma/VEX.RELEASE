import React from'react'; import{ScrollView}from'react-native'; import Animated,{FadeIn,FadeInUp,FadeOut,useAnimatedStyle,withSpring,withSequence,withTiming,withDelay}from'react-native-reanimated'; import{Box}from'../../../components/primitives/Box'; import{Text}from'../../../components/primitives/Text'; import{Button}from'../../../components/primitives/Button'; import{useTheme}from'../../../theme';
import { launchColors } from '@theme/tokens/launch-colors';
 export interface BossTimeoutScreenProps{bossName:string;bossTier:'COMMON'|'UNCOMMON'|'RARE'|'EPIC'|'LEGENDARY';remainingHealth:number;escapeTaunt?:string;nextEncounterHealthBonus?:number;consolation:{xp:number;coins:number;message:string;};retryCooldownDays:number;coachMessage:string;onStartSession:()=>void;onGoHome:()=>void;}function RetreatingBoss({bossTier,escapeTaunt}:{bossTier:BossTimeoutScreenProps['bossTier'];escapeTaunt?:string;}):JSX.Element{const{theme} = useTheme(); const tierColors = {COMMON:theme.colors.text.tertiary,UNCOMMON:theme.colors.success.DEFAULT,RARE:theme.colors.info.DEFAULT,EPIC:theme.colors.accent.purple,LEGENDARY:launchColors.hex_f59e0b}; const retreatStyle = useAnimatedStyle(()=>({transform:[{translateX:withTiming(200,{duration:2000})},{scale:withSequence(withTiming(1,{duration:500}),withTiming(0.5,{duration:1500}))}],opacity:withSequence(withTiming(1,{duration:500}),withTiming(0,{duration:1500}))})); const fadeStyle = useAnimatedStyle(()=>({opacity:withDelay(1000,withTiming(1,{duration:500}))})); const laughStyle = useAnimatedStyle(()=>({opacity:withSequence(withDelay(500,withTiming(1,{duration:300})),withDelay(1000,withTiming(0,{duration:500}))),transform:[{translateY:withSequence(withDelay(500,withTiming(-20,{duration:200})),withTiming(0,{duration:200}))}]})); return<Box height={240}justifyContent="center"alignItems="center"overflow="hidden">
      {}
      <Animated.View style={[{position:'absolute',width:120,height:120,borderRadius:20,backgroundColor:`${tierColors[bossTier]}30`,justifyContent:'center',alignItems:'center',borderWidth:3,borderColor:tierColors[bossTier]},retreatStyle]}>
        <Text fontSize={60}>👹</Text>
      </Animated.View>

      {}
      {escapeTaunt && <Animated.View style={[{position:'absolute',top:20,paddingHorizontal:16,paddingVertical:12,borderRadius:12,backgroundColor:`${theme.colors.error[500]}20`,borderWidth:1,borderColor:theme.colors.error[500]},laughStyle]}>
          <Text variant="caption"color={theme.colors.error[500]}fontWeight="600">
            😈 {escapeTaunt}
          </Text>
        </Animated.View>}

      {}
      <Animated.View style={[{position:'absolute',width:120,height:120,borderRadius:20,backgroundColor:theme.colors.background.primary},fadeStyle]}/>

      {}
      <Animated.View entering={FadeIn.duration(300).delay(1500)}style={{position:'absolute'}}>
        <Text fontSize={40}>💨</Text>
      </Animated.View>
    </Box>;}function ConsolationRewards({consolation}:{consolation:BossTimeoutScreenProps['consolation'];}):JSX.Element{const{theme} = useTheme(); return<Animated.View entering={FadeInUp.duration(500).delay(1200)}>
      <Box p="xl"borderRadius="xl"bg={`${theme.colors.info[500]}15`}borderWidth={2}borderColor="info.DEFAULT"alignItems="center"gap="lg">
        <Text fontSize={48}>🎁</Text>
        <Text variant="h4"color="text.primary"textAlign="center">
          Consolation Rewards
        </Text>
        <Text variant="body"color="text.secondary"textAlign="center">
          {consolation.message}
        </Text>

        <Box flexDirection="row"gap="lg">
          <Box alignItems="center">
            <Text fontSize={24}>✨</Text>
            <Text variant="h4"color="text.primary"fontWeight="700">
              +{consolation.xp}
            </Text>
            <Text variant="caption"color="text.tertiary">
              XP
            </Text>
          </Box>
          <Box alignItems="center">
            <Text fontSize={24}>🪙</Text>
            <Text variant="h4"color="text.primary"fontWeight="700">
              +{consolation.coins}
            </Text>
            <Text variant="caption"color="text.tertiary">
              Coins
            </Text>
          </Box>
        </Box>
      </Box>
    </Animated.View>;}function CoachMessage({message}:{message:string;}):JSX.Element{return<Animated.View entering={FadeInUp.duration(500).delay(1400)}>
      <Box p="lg"borderRadius="xl"bg="background.secondary"borderWidth={1}borderColor="border.light"flexDirection="row"gap="md"alignItems="flex-start">
        <Box width={40}height={40}borderRadius="full"bg="accent.purple"justifyContent="center"alignItems="center">
          <Text fontSize={20}>🤖</Text>
        </Box>
        <Box flex={1}>
          <Text variant="caption"color="accent.purple"fontWeight="600"mb="xs">
            AI Coach
          </Text>
          <Text variant="body"color="text.secondary">
            {message}
          </Text>
        </Box>
      </Box>
    </Animated.View>;}export function BossTimeoutScreen({bossName,bossTier,remainingHealth,escapeTaunt,nextEncounterHealthBonus,consolation,retryCooldownDays,coachMessage,onStartSession,onGoHome}:BossTimeoutScreenProps):JSX.Element{const{theme} = useTheme(); return<ScrollView style={{flex:1,backgroundColor:theme.colors.background.primary}}contentContainerStyle={{paddingBottom:40}}showsVerticalScrollIndicator={false}>
      <Box flex={1}px="xl"py="xl"gap="lg">
        {}
        <Animated.View entering={FadeIn.duration(500)}>
          <Box alignItems="center"gap="sm">
            <Text variant="label"color="text.tertiary">
              💨 ESCAPED
            </Text>
            <Text variant="h1"color="text.primary"textAlign="center">
              {bossName}
            </Text>
            <Text variant="bodyLarge"color="text.secondary"textAlign="center">
              {escapeTaunt || 'Got away this time...'}
            </Text>
          </Box>
        </Animated.View>

        {}
        <RetreatingBoss bossTier={bossTier}escapeTaunt={escapeTaunt}/>

        {}
        <Animated.View entering={FadeInUp.duration(500).delay(800)}>
          <Box p="lg"borderRadius="xl"bg="background.secondary"alignItems="center">
            <Text variant="caption"color="text.tertiary"mb="sm">
              BOSS ESCAPED WITH
            </Text>
            <Text variant="hero"color="error.DEFAULT"fontWeight="800">
              {remainingHealth.toFixed(0)}%
            </Text>
            <Text variant="body"color="text.secondary">
              health remaining
            </Text>
          </Box>
        </Animated.View>

        {}
        <Animated.View entering={FadeInUp.duration(500).delay(1000)}>
          <Box alignItems="center">
            <Text variant="body"color="text.tertiary">
              Challenge again in{' '}
              <Text color="text.primary"fontWeight="600">
                {retryCooldownDays} days
              </Text>
            </Text>
          </Box>
        </Animated.View>

        {}
        {nextEncounterHealthBonus && nextEncounterHealthBonus > 0 && <Animated.View entering={FadeInUp.duration(500).delay(1100)}>
            <Box p="md"borderRadius="lg"bg={`${theme.colors.warning[500]}15`}borderWidth={1}borderColor={theme.colors.warning[500]}alignItems="center">
              <Text variant="caption"color={theme.colors.warning[500]}fontWeight="600">
                ⚠️ {bossName} escaped! It'll be back with +{nextEncounterHealthBonus}% health next time.
              </Text>
            </Box>
          </Animated.View>}

        {}
        <ConsolationRewards consolation={consolation}/>

        {}
        <CoachMessage message={coachMessage}/>

        {}
        <Animated.View entering={FadeInUp.duration(500).delay(1600)}>
          <Box gap="md">
            <Button variant="primary"size="lg"fullWidth onPress={onStartSession}accessibilityLabel="Start Fresh Session 🔥 button"accessibilityRole="button"accessibilityHint="Activates this control">
              Start Fresh Session 🔥
            </Button>
            <Button variant="ghost"size="md"fullWidth onPress={onGoHome}accessibilityLabel="Go Home button"accessibilityRole="button"accessibilityHint="Activates this control">
              Go Home
            </Button>
          </Box>
        </Animated.View>
      </Box>
    </ScrollView>;}export default BossTimeoutScreen;
