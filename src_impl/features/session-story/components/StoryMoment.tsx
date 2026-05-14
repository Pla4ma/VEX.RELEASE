import React,{useState,useEffect,useCallback}from'react';import{View,Text,Pressable}from'react-native';import Animated,{useSharedValue,useAnimatedStyle,withTiming}from'react-native-reanimated';import{useSafeAreaInsets}from'react-native-safe-area-context';import{useTheme}from'@/theme';import{haptics}from'@/shared/feedback';import{useReducedMotion}from'@/hooks';import type{SessionStory,StoryBeat}from'../schemas';interface StoryMomentProps{story:SessionStory;onComplete:()=>void;onSkip?:()=>void;}export const StoryMoment:React.FC<StoryMomentProps>=({story,onComplete,onSkip})=>{const{theme}=useTheme();const insets=useSafeAreaInsets();const{isReducedMotion}=useReducedMotion();const[currentBeatIndex,setCurrentBeatIndex]=useState(0);const fadeAnim=useSharedValue(0);useEffect(()=>{fadeAnim.value=withTiming(1,{duration:isReducedMotion?100:400});},[fadeAnim,isReducedMotion]);const animatedStyle=useAnimatedStyle(()=>({opacity:fadeAnim.value}));const currentBeat=story.beats[currentBeatIndex];const isLastBeat=currentBeatIndex>=story.totalBeats-1;const handleTap=useCallback(()=>{if(isLastBeat){onComplete();}else{if(!isReducedMotion){haptics.impact('light');}setCurrentBeatIndex(prev=>prev+1);}},[isLastBeat,onComplete,isReducedMotion]);const handleSkip=useCallback(()=>{onSkip?.();onComplete();},[onSkip,onComplete]);if(!currentBeat){return null;}return<Animated.View style={[{flex:1,backgroundColor:theme.colors.background?.primary??'#000',paddingTop:insets.top,paddingBottom:insets.bottom},animatedStyle]}>
      {}
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:20,paddingTop:16,paddingBottom:12}}>
        <View style={{flexDirection:'row',gap:6}}>
          {story.beats.map((_,index)=><View key={index}style={{width:6,height:6,borderRadius:3,backgroundColor:index<=currentBeatIndex?theme.colors.primary?.[500]??'#fff':theme.colors.border?.DEFAULT??'#333'}}/>)}
        </View>

        {onSkip&&<Pressable onPress={handleSkip}>
            <Text style={{fontSize:14,fontWeight:'500',color:theme.colors.text?.muted??'#888'}}>
              Skip
            </Text>
          </Pressable>}
      </View>

      {}
      <Pressable style={{flex:1,justifyContent:'center',alignItems:'center',paddingHorizontal:32}}onPress={handleTap}>
        <StoryBeatContent beat={currentBeat}theme={theme}/>
      </Pressable>

      {}
      <View style={{paddingVertical:24,alignItems:'center'}}>
        <Text style={{fontSize:14,fontWeight:'500',color:theme.colors.text?.muted??'#888'}}>
          {isLastBeat?'Tap to finish':'Tap to continue'}
        </Text>
      </View>
    </Animated.View>;};interface StoryBeatContentProps{beat:StoryBeat;theme:DynamicValue;}const StoryBeatContent:React.FC<StoryBeatContentProps>=({beat,theme})=>{const getIcon=(type:StoryBeat['type']):string=>{const icons:Record<string,string>={OPENING:'🌅',FOCUS_JOURNEY:'🎯',STREAK_MOMENT:'🔥',BOSS_BATTLE:'⚔️',MILESTONE_REACHED:'🏆',PERFECTION_MOMENT:'✨',COMEBACK_TRIUMPH:'🦅',PROGRESSION_CLIFFHANGER:'📈',ACHIEVEMENT_UNLOCK:'🎖️',CLOSING_REFLECTION:'🌟'};return icons[type]??'📝';};const getEmotionColor=(emotion:StoryBeat['emotion']):string=>{const colors:Record<string,string>={TRIUMPH:theme.colors.success?.DEFAULT??'#22c55e',MASTERY:theme.colors.primary?.[500]??'#3b82f6',RESILIENCE:theme.colors.warning?.DEFAULT??'#f59e0b',DETERMINATION:theme.colors.info?.DEFAULT??'#3b82f6',ANTICIPATION:theme.colors.primary?.[400]??'#60a5fa',WONDER:theme.colors.primary?.[400]??'#60a5fa',GRATITUDE:theme.colors.success?.DEFAULT??'#22c55e',RELIEF:theme.colors.success?.DEFAULT??'#22c55e'};return colors[emotion]??theme.colors.primary?.[500]??'#3b82f6';};const emotionColor=getEmotionColor(beat.emotion);return<View style={{alignItems:'center',width:'100%'}}>
      {}
      <View style={{width:80,height:80,borderRadius:40,justifyContent:'center',alignItems:'center',marginBottom:24,backgroundColor:`${emotionColor}20`}}>
        <Text style={{fontSize:36}}>{getIcon(beat.type)}</Text>
      </View>

      {}
      <Text style={{fontSize:28,fontWeight:'700',textAlign:'center',marginBottom:12,lineHeight:36,color:theme.colors.text?.primary??'#fff'}}>
        {beat.headline}
      </Text>

      {}
      {beat.subtext&&<Text style={{fontSize:16,textAlign:'center',lineHeight:24,marginBottom:20,color:theme.colors.text?.secondary??'#aaa'}}>
          {beat.subtext}
        </Text>}

      {}
      {beat.metadata?.context&&<View style={{paddingHorizontal:16,paddingVertical:8,borderRadius:20,backgroundColor:`${emotionColor}20`}}>
          <Text style={{fontSize:14,fontWeight:'600',color:emotionColor}}>{beat.metadata.context}</Text>
        </View>}
    </View>;};export default StoryMoment;
