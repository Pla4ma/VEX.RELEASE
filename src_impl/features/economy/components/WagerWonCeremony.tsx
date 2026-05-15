import React,{useEffect,useCallback}from'react'; import{View,Dimensions}from'react-native'; import Animated,{useSharedValue,useAnimatedStyle,withSpring,withTiming,withSequence,withDelay,withRepeat,runOnJS,FadeIn,FadeOut,SlideInDown,SlideOutUp}from'react-native-reanimated'; import{Text}from'../../../components/primitives/Text'; import{ConfettiCelebration}from'../../../animation/ConfettiCelebration'; import{useTheme}from'../../../theme'; const{width:SCREEN_WIDTH} = Dimensions.get('window'); interface WagerWonCeremonyProps{amount:number;onComplete:()=>void;autoDismiss?:boolean;dismissDelay?:number;}export function WagerWonCeremony({amount,onComplete,autoDismiss = true,dismissDelay = 4000}:WagerWonCeremonyProps):JSX.Element{const{theme} = useTheme(); const scale = useSharedValue(0); const coinScale = useSharedValue(0); const coinTranslateY = useSharedValue(0); const textOpacity = useSharedValue(0); const amountValue = useSharedValue(0); const confettiActive = useSharedValue(true); const containerStyle = useAnimatedStyle(()=>({transform:[{scale:scale.value}]})); const coinStyle = useAnimatedStyle(()=>({transform:[{scale:coinScale.value},{translateY:coinTranslateY.value}]})); const textStyle = useAnimatedStyle(()=>({opacity:textOpacity.value})); const amountStyle = useAnimatedStyle(()=>({opacity:textOpacity.value})); useEffect(()=>{scale.value = withSpring(1,{damping:12,stiffness:400}); coinScale.value = withSequence(withDelay(200,withSpring(1.5,{damping:10})),withSpring(1,{damping:15})); coinTranslateY.value = withRepeat(withSequence(withTiming(-10,{duration:800}),withTiming(10,{duration:800})),-1,true); textOpacity.value = withDelay(400,withTiming(1,{duration:500})); amountValue.value = withDelay(300,withTiming(amount,{duration:1500})); if(autoDismiss){const timer = setTimeout(()=>{scale.value = withTiming(0,{duration:300},()=>{runOnJS(onComplete)();}); confettiActive.value = false;},dismissDelay); return()=>{clearTimeout(timer);};}return undefined;},[amount,autoDismiss,dismissDelay,onComplete,scale,coinScale,coinTranslateY,textOpacity,amountValue,confettiActive]); const formatAmount = useCallback((value:number)=>{return Math.round(value).toLocaleString();},[]); const[displayAmount,setDisplayAmount] = React.useState(0); useEffect(()=>{const interval = setInterval(()=>{setDisplayAmount(Math.round(amountValue.value));},16); return()=>clearInterval(interval);},[amountValue]); return<View style={{position:'absolute',left:0,right:0,top:0,bottom:0,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0, 0, 0, 0.7)',zIndex:9999}}>
      {}
      <ConfettiCelebration active={confettiActive.value}particleCount={80}colors={[theme.colors.success.DEFAULT,theme.colors.primary[500],theme.colors.warning.DEFAULT,'#FFD700','#FFA500']}onComplete={()=>{}}/>

      {}
      <Animated.View entering={FadeIn.duration(300)}exiting={FadeOut.duration(300)}style={[{alignItems:'center',justifyContent:'center',padding:theme.spacing[8]},containerStyle]}>
        {}
        <Animated.View style={coinStyle}>
          <View style={{width:120,height:120,borderRadius:60,backgroundColor:theme.colors.success.DEFAULT,justifyContent:'center',alignItems:'center',shadowColor:theme.colors.success.DEFAULT,shadowOffset:{width:0,height:0},shadowOpacity:0.5,shadowRadius:20,elevation:10}}>
            <Text variant="display"style={{fontSize:60}}>
              🪙
            </Text>
          </View>
        </Animated.View>

        {}
        <Animated.View style={[{marginTop:theme.spacing[6]},textStyle]}>
          <Text variant="heading"style={{color:theme.colors.success.DEFAULT,fontWeight:'800',textAlign:'center',textShadowColor:'rgba(0, 0, 0, 0.3)',textShadowOffset:{width:0,height:2},textShadowRadius:4}}>
            WAGER WON!
          </Text>
        </Animated.View>

        {}
        <Animated.View style={[{marginTop:theme.spacing[3]},amountStyle]}>
          <Text variant="display"style={{color:'#FFD700',fontWeight:'700',textAlign:'center',fontSize:48}}>
            +{formatAmount(displayAmount)} COINS
          </Text>
        </Animated.View>

        {}
        <Animated.View entering={SlideInDown.delay(600).duration(500)}exiting={SlideOutUp.duration(300)}style={{marginTop:theme.spacing[4]}}>
          <Text variant="body"style={{color:theme.colors.text.secondary,textAlign:'center'}}>
            Your focus paid off!
          </Text>
        </Animated.View>
      </Animated.View>
    </View>;}
