import React from'react';import{StyleSheet,View,type ViewStyle}from'react-native';import Animated,{useSharedValue,useAnimatedStyle,withRepeat,withSequence,withTiming,withDelay,FadeIn}from'react-native-reanimated';import{Text}from'../../../components/primitives/Text';import{useTheme}from'../../../theme';import{usePremiumStatus}from'../../../shared/monetization';import{createSheet}from'@/shared/ui/create-sheet';export interface PremiumChestEffectsProps{children:React.ReactNode;style?:ViewStyle;}interface GoldParticleProps{delay:number;x:number;y:number;size:number;}function GoldParticle({delay,x,y,size}:GoldParticleProps):JSX.Element{const translateY=useSharedValue(0);const opacity=useSharedValue(0);const scale=useSharedValue(0);React.useEffect(()=>{translateY.value=withDelay(delay,withRepeat(withSequence(withTiming(-30,{duration:2000}),withTiming(0,{duration:0})),-1));opacity.value=withDelay(delay,withRepeat(withSequence(withTiming(0,{duration:0}),withTiming(1,{duration:500}),withTiming(1,{duration:1000}),withTiming(0,{duration:500})),-1));scale.value=withDelay(delay,withRepeat(withSequence(withTiming(0,{duration:0}),withTiming(1,{duration:400}),withTiming(1.2,{duration:800}),withTiming(0,{duration:400})),-1));},[delay,opacity,scale,translateY]);const animatedStyle=useAnimatedStyle(()=>({transform:[{translateY:translateY.value},{scale:scale.value}],opacity:opacity.value}));return<Animated.View style={[styles.particle,{left:x,top:y,width:size,height:size,borderRadius:size/2},animatedStyle]}/>;}export function PremiumChestEffects({children,style}:PremiumChestEffectsProps):JSX.Element{const{theme}=useTheme();const{isPremium}=usePremiumStatus();const particles=React.useMemo(()=>{if(!isPremium){return[];}return Array.from({length:12},(_,i)=>({id:i,delay:i*150,x:Math.random()*280-140,y:Math.random()*200-100,size:4+Math.random()*6}));},[isPremium]);return<View style={[styles.container,style]}>
      {}
      {isPremium&&<View style={styles.particlesContainer}>
          {particles.map(p=><GoldParticle key={p.id}delay={p.delay}x={p.x}y={p.y}size={p.size}/>)}
        </View>}

      {}
      {isPremium&&<Animated.View entering={FadeIn.duration(500)}style={[styles.premiumBadge,{backgroundColor:theme.colors.primary[500]}]}>
          <Text style={styles.premiumBadgeText}>P</Text>
        </Animated.View>}

      {}
      {isPremium&&<Animated.View entering={FadeIn.duration(500).delay(200)}style={[styles.bonusLabel,{backgroundColor:theme.colors.warning[50],borderColor:theme.colors.warning.DEFAULT}]}>
          <Text style={[styles.bonusIcon,{color:theme.colors.warning.DEFAULT}]}>✨</Text>
          <Text style={[styles.bonusText,{color:theme.colors.warning.dark}]}>+10% Premium Bonus</Text>
        </Animated.View>}

      {}
      <View style={styles.content}>{children}</View>
    </View>;}const styles=createSheet({container:{position:'relative'},content:{zIndex:1},particlesContainer:{position:'absolute',top:0,left:0,right:0,bottom:0,alignItems:'center',justifyContent:'center',zIndex:0,pointerEvents:'none'},particle:{position:'absolute',backgroundColor:'#FFD700',shadowColor:'#FFD700',shadowOffset:{width:0,height:0},shadowOpacity:0.8,shadowRadius:4,elevation:5},premiumBadge:{position:'absolute',top:-8,right:-8,width:28,height:28,borderRadius:14,alignItems:'center',justifyContent:'center',zIndex:2,borderWidth:2,borderColor:'#FFFFFF',shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.2,shadowRadius:4,elevation:4},premiumBadgeText:{color:'#FFFFFF',fontSize:14,fontWeight:'800'},bonusLabel:{position:'absolute',top:-40,alignSelf:'center',flexDirection:'row',alignItems:'center',gap:4,paddingHorizontal:12,paddingVertical:6,borderRadius:16,borderWidth:1,zIndex:2},bonusIcon:{fontSize:12},bonusText:{fontSize:12,fontWeight:'700'}});export default PremiumChestEffects;
