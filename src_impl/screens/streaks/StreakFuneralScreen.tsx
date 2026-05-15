import React,{useCallback,useMemo}from'react'; import{ScrollView}from'react-native'; import Animated,{FadeIn,FadeInUp,useAnimatedStyle,useSharedValue,withTiming,withSequence}from'react-native-reanimated'; import{useNavigation,useRoute,type RouteProp}from'@react-navigation/native'; import type{NativeStackNavigationProp}from'@react-navigation/native-stack'; import*as Sentry from'@sentry/react-native'; import{Box,Text}from'../../components/primitives'; import{Button}from'../../components/primitives/Button'; import{useAuthStore}from'../../store'; import{getStreakService}from'../../streaks/StreakService'; import{useTheme}from'../../theme'; import{useToast}from'../../shared/ui/components/Toast'; import{useBalance}from'../../features/economy/hooks'; import type{ExtendedRootStackParams}from'../../navigation/types'; const RESTORE_COSTS = {UNDER_7_DAYS:100,DAYS_7_TO_29:200,DAYS_30_PLUS:500}as const; function calculateRestoreCost(streakDays:number):number{if(streakDays < 7){return RESTORE_COSTS.UNDER_7_DAYS;}if(streakDays < 30){return RESTORE_COSTS.DAYS_7_TO_29;}return RESTORE_COSTS.DAYS_30_PLUS;}type StreakFuneralRoute=RouteProp<ExtendedRootStackParams,'StreakFuneral'>;type StreakFuneralNavigation=NativeStackNavigationProp<ExtendedRootStackParams,'StreakFuneral'>;function DyingFlame():JSX.Element{const flameScale = useSharedValue(1); const flameOpacity = useSharedValue(1); React.useEffect(()=>{flameScale.value = withSequence(withTiming(0.9,{duration:500}),withTiming(0.7,{duration:500}),withTiming(0.4,{duration:500}),withTiming(0,{duration:500})); flameOpacity.value = withSequence(withTiming(0.8,{duration:500}),withTiming(0.6,{duration:500}),withTiming(0.3,{duration:500}),withTiming(0,{duration:500}));},[flameOpacity,flameScale]); const animatedStyle = useAnimatedStyle(()=>({transform:[{scale:flameScale.value}],opacity:flameOpacity.value})); return<Animated.View style={animatedStyle}>
      <Text fontSize={96}>🔥</Text>
    </Animated.View>;}export const StreakFuneralScreen:React.FC = ()=>{const{theme} = useTheme(); const{show:showToast} = useToast(); const{user} = useAuthStore(); const navigation = useNavigation<StreakFuneralNavigation>(); const route = useRoute<StreakFuneralRoute>(); const{previousStreak,diedAt} = route.params; const hoursSinceDeath = Math.floor((Date.now() - diedAt) / (1000 * 60 * 60)); const daysSinceDeath = Math.floor(hoursSinceDeath / 24); const restoreCost = useMemo(()=>calculateRestoreCost(previousStreak),[previousStreak]); const{data:gemsBalanceData} = useBalance(user?.id ?? '','GEMS'); const gemBalance = gemsBalanceData ?? 0; const completeFuneral = useCallback(()=>{if(user?.id){getStreakService(user.id).markFuneralShown();}navigation.goBack();},[navigation,user?.id]); const handleStartFresh = useCallback(()=>{Sentry.addBreadcrumb({category:'streaks',message:'User acknowledged streak funeral and started fresh',level:'info',data:{previousStreak,diedAt}}); showToast({type:'success',title:'New streak started!',message:'Every day is a fresh beginning.',duration:3000}); completeFuneral();},[completeFuneral,previousStreak,diedAt,showToast]); const handleReminisce = useCallback(()=>{Sentry.addBreadcrumb({category:'streaks',message:'User chose to view streak history',level:'info'}); completeFuneral();},[completeFuneral]); return<Box flex={1}bg="background.primary"px="lg"pt="xl">
      <ScrollView showsVerticalScrollIndicator={false}contentContainerStyle={{flexGrow:1,justifyContent:'center'}}>
        {}
        <Animated.View entering={FadeIn.delay(200)}>
          <Box alignItems="center"mb="2xl">
            <DyingFlame/>
          </Box>
        </Animated.View>

        {}
        <Animated.View entering={FadeInUp.delay(400)}>
          <Box alignItems="center"mb="xl">
            <Text variant="h2"color="text.primary"textAlign="center"mb="md">
              {previousStreak}-day streak 💀
            </Text>
            <Text variant="body"color="text.secondary"textAlign="center">
              {daysSinceDeath > 0 ? `${daysSinceDeath} day${daysSinceDeath !== 1 ? 's' : ''} ago` : `${hoursSinceDeath} hour${hoursSinceDeath !== 1 ? 's' : ''} ago`}
            </Text>
          </Box>
        </Animated.View>

        {}
        <Animated.View entering={FadeInUp.delay(500)}>
          <Box alignItems="center"mb="xl">
            <Text variant="body"color="text.secondary"textAlign="center">
              {previousStreak} days of focus. Don&apos;t let one missed day erase it.
            </Text>
          </Box>
        </Animated.View>

        {}
        <Animated.View entering={FadeInUp.delay(600)}>
          <Box bg="background.secondary"p="xl"borderRadius="lg"alignItems="center"mb="2xl"style={{borderWidth:1,borderColor:theme.colors.border.light}}>
            <Text variant="caption"color="text.secondary"mb="sm">
              PREVIOUS STREAK
            </Text>
            <Text variant="hero"color="primary.500"style={{fontSize:72,fontWeight:'800'}}>
              {previousStreak}
            </Text>
            <Text variant="h4"color="text.primary">
              {previousStreak === 1 ? 'day' : 'days'}
            </Text>
          </Box>
        </Animated.View>

        {}
        <Animated.View entering={FadeInUp.delay(800)}>
          <Box mb="2xl">
            <Text variant="body"color="text.secondary"textAlign="center"mb="md">
              "Every expert was once a beginner. Every pro was once an amateur.
            </Text>
            <Text variant="body"color="text.secondary"textAlign="center">
              Every icon was once an unknown." 💪
            </Text>
          </Box>
        </Animated.View>

        {}
        <Animated.View entering={FadeInUp.delay(1000)}>
          <Box gap="md">
            {}
            <Button variant="primary"size="lg"fullWidth onPress={handleStartFresh}disabled={gemBalance < restoreCost}accessibilityLabel={`Restore streak for ${restoreCost} gems`}accessibilityRole="button"accessibilityHint={`Protects your ${previousStreak}-day streak for ${restoreCost} gems`}>
              Restore for {restoreCost} 💎
            </Button>

            {}
            {gemBalance < restoreCost && <Text variant="caption"color="text.tertiary"textAlign="center">
                Need {restoreCost} gems. You have {gemBalance}.
                {'\n'}
                <Text variant="caption"color="primary.500"onPress={()=>navigation.navigate('Shop')}>
                  Earn gems in the shop
                </Text>
              </Text>}

            {}
            <Button variant="secondary"size="md"fullWidth onPress={handleStartFresh}accessibilityLabel="Start fresh and begin comeback quest"accessibilityRole="button"accessibilityHint="Begins a new streak with bonus XP for your first sessions">
              Start fresh — begin comeback
            </Button>

            {}
            <Button variant="ghost"size="sm"fullWidth onPress={handleReminisce}accessibilityLabel="View Streak History button"accessibilityRole="button"accessibilityHint="Activates this control">
              View Streak History
            </Button>
          </Box>
        </Animated.View>

        {}
        <Box height={40}/>
      </ScrollView>
    </Box>;}; export default StreakFuneralScreen;
