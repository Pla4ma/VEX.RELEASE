import React,{useEffect,useRef,useState,useCallback}from'react';import{Dimensions,Pressable}from'react-native';import Animated,{Easing,FadeIn,FadeInUp,FadeOut,runOnJS,useAnimatedStyle,useSharedValue,withDelay,withRepeat,withSequence,withSpring,withTiming}from'react-native-reanimated';import{Box,Button,Text}from'../../../components/primitives';import{getPremiumCardStyle}from'../../../components/premiumStyles';import{AnimatedCounter}from'../../../shared/ui/components/AnimatedCounter';import{useTheme}from'../../../theme';import{VariableRewardTier}from'../../../features/rewards/VariableRewardEngine';const{width:SCREEN_WIDTH}=Dimensions.get('window');type ChestTier='common'|'uncommon'|'rare'|'epic'|'legendary';type RevealPhase='suspense'|'opening'|'reveal'|'complete';interface ChestRevealProps{tier:ChestTier;rewards:{xp:number;coins:number;gems:number;};onComplete:()=>void;onOpenEarly?:()=>void;luckyBonusActive?:boolean;}interface TierConfig{color:string;glowColor:string;bgColor:string;shakeIntensity:number;shakeSpeed:number;glowIntensity:number;hasScreenDarken:boolean;hasOrbitingParticles:boolean;label:string;}const TIER_CONFIGS:Record<ChestTier,TierConfig>={common:{color:'#9CA3AF',glowColor:'#D1D5DB',bgColor:'#4B5563',shakeIntensity:2,shakeSpeed:400,glowIntensity:0.3,hasScreenDarken:false,hasOrbitingParticles:false,label:'COMMON'},uncommon:{color:'#22C55E',glowColor:'#86EFAC',bgColor:'#166534',shakeIntensity:3,shakeSpeed:350,glowIntensity:0.5,hasScreenDarken:false,hasOrbitingParticles:false,label:'UNCOMMON'},rare:{color:'#3B82F6',glowColor:'#60A5FA',bgColor:'#1D4ED8',shakeIntensity:5,shakeSpeed:300,glowIntensity:0.7,hasScreenDarken:false,hasOrbitingParticles:false,label:'RARE'},epic:{color:'#A855F7',glowColor:'#C084FC',bgColor:'#7C3AED',shakeIntensity:8,shakeSpeed:250,glowIntensity:0.85,hasScreenDarken:true,hasOrbitingParticles:false,label:'EPIC'},legendary:{color:'#F97316',glowColor:'#FDBA74',bgColor:'#EA580C',shakeIntensity:12,shakeSpeed:200,glowIntensity:1,hasScreenDarken:true,hasOrbitingParticles:true,label:'LEGENDARY'}};function withAlpha(color:string,alpha:number):string{if(!color.startsWith('#')){return color;}const hex=color.length===4?color.slice(1).split('').map(part=>`${part}${part}`).join(''):color.slice(1);const[red,green,blue]=[0,2,4].map(index=>parseInt(hex.slice(index,index+2),16));return`rgba(${red}, ${green}, ${blue}, ${alpha})`;}function mapVariableRewardTier(tier:VariableRewardTier):ChestTier{switch(tier){case VariableRewardTier.COMMON:return'common';case VariableRewardTier.UNCOMMON:return'uncommon';case VariableRewardTier.RARE:return'rare';case VariableRewardTier.EPIC:return'epic';case VariableRewardTier.LEGENDARY:return'legendary';default:return'common';}}export const ChestRevealAnimationEnhanced:React.FC<ChestRevealProps>=({tier,rewards,onComplete,onOpenEarly,luckyBonusActive=false})=>{const{theme}=useTheme();const config=TIER_CONFIGS[tier];const[phase,setPhase]=useState<RevealPhase>('suspense');const[counts,setCounts]=useState({xp:0,coins:0,gems:0});const[canTap,setCanTap]=useState(false);const chestScale=useSharedValue(0);const chestGlow=useSharedValue(0);const chestShake=useSharedValue(0);const glowPulse=useSharedValue(0);const screenDarken=useSharedValue(0);const particlesBurst=useSharedValue(0);const rewardOpacity=useSharedValue(0);const rewardScale=useSharedValue(0);const autoAdvanceTimerRef=useRef<NodeJS.Timeout|null>(null);const completedRef=useRef(false);const startOpeningPhaseRef=useRef<()=>void>(()=>undefined);const animateRewardCountsRef=useRef<()=>void>(()=>undefined);const startSuspensePhase=useCallback(()=>{chestScale.value=withSpring(1,{damping:12,stiffness:100});chestGlow.value=withDelay(500,withTiming(config.glowIntensity,{duration:1000}));glowPulse.value=withDelay(1500,withRepeat(withSequence(withTiming(0.5,{duration:600}),withTiming(1,{duration:600})),-1,true));if(config.hasScreenDarken){screenDarken.value=withTiming(0.6,{duration:800});}chestShake.value=withDelay(800,withRepeat(withSequence(withTiming(-config.shakeIntensity,{duration:config.shakeSpeed/2}),withTiming(config.shakeIntensity,{duration:config.shakeSpeed}),withTiming(-config.shakeIntensity,{duration:config.shakeSpeed}),withTiming(config.shakeIntensity,{duration:config.shakeSpeed/2})),-1,true));setTimeout(()=>setCanTap(true),1200);autoAdvanceTimerRef.current=setTimeout(()=>{if(!completedRef.current){startOpeningPhaseRef.current();}},3200);},[chestGlow,chestScale,chestShake,config.glowIntensity,config.hasScreenDarken,config.shakeIntensity,config.shakeSpeed,glowPulse,screenDarken]);const startOpeningPhase=useCallback(()=>{if(completedRef.current){return;}completedRef.current=true;setPhase('opening');setCanTap(false);chestShake.value=withTiming(0,{duration:100});chestScale.value=withSequence(withTiming(1.2,{duration:150}),withTiming(0,{duration:200}));particlesBurst.value=withTiming(1,{duration:600});screenDarken.value=withTiming(0,{duration:300});setTimeout(()=>{setPhase('reveal');rewardOpacity.value=withTiming(1,{duration:400});rewardScale.value=withSpring(1,{damping:12,stiffness:100});animateRewardCountsRef.current();},400);setTimeout(()=>{setPhase('complete');onComplete();},2500);},[chestScale,chestShake,onComplete,particlesBurst,rewardOpacity,rewardScale,screenDarken]);startOpeningPhaseRef.current=startOpeningPhase;const animateRewardCounts=()=>{const startedAt=Date.now();const duration=900;const animate=()=>{const progress=Math.min((Date.now()-startedAt)/duration,1);const eased=1-Math.pow(1-progress,3);setCounts({xp:Math.round(rewards.xp*eased),coins:Math.round(rewards.coins*eased),gems:Math.round(rewards.gems*eased)});if(progress<1){requestAnimationFrame(animate);}};requestAnimationFrame(animate);};animateRewardCountsRef.current=animateRewardCounts;const handleTap=()=>{if(canTap&&phase==='suspense'){if(autoAdvanceTimerRef.current){clearTimeout(autoAdvanceTimerRef.current);}onOpenEarly?.();startOpeningPhase();}};useEffect(()=>{startSuspensePhase();return()=>{if(autoAdvanceTimerRef.current){clearTimeout(autoAdvanceTimerRef.current);}};},[startSuspensePhase]);const chestStyle=useAnimatedStyle(()=>({transform:[{scale:chestScale.value},{translateX:chestShake.value}],shadowColor:config.glowColor,shadowOffset:{width:0,height:0},shadowOpacity:chestGlow.value*glowPulse.value,shadowRadius:20+chestGlow.value*30,elevation:15}));const glowStyle=useAnimatedStyle(()=>({opacity:chestGlow.value*glowPulse.value,transform:[{scale:1+chestGlow.value*0.3}]}));const screenDarkenStyle=useAnimatedStyle(()=>({opacity:screenDarken.value}));const particlesStyle=useAnimatedStyle(()=>({opacity:particlesBurst.value,transform:[{scale:particlesBurst.value*1.5}]}));const rewardContainerStyle=useAnimatedStyle(()=>({opacity:rewardOpacity.value,transform:[{scale:rewardScale.value}]}));return<Pressable onPress={handleTap}style={{flex:1}}disabled={!canTap}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
      <Box flex={1}alignItems="center"justifyContent="center"bg={theme.colors.background.primary}style={{position:'relative'}}>
        {}
        {config.hasScreenDarken&&<Animated.View style={[{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#000000'},screenDarkenStyle]}pointerEvents="none"/>}

        {}
        {phase==='suspense'&&<Animated.View entering={FadeIn}>
            <Box alignItems="center">
              {}
              <Text variant="label"color={config.color}style={{textShadowColor:config.glowColor,textShadowOffset:{width:0,height:0},textShadowRadius:10}}>
                {luckyBonusActive&&'🍀 '}TAP TO OPEN
              </Text>

              {}
              <Animated.View style={[{position:'absolute',width:200,height:200,borderRadius:100,backgroundColor:withAlpha(config.glowColor,0.3)},glowStyle]}/>

              {}
              <Box mt={8}mb={8}>
                <Animated.View style={chestStyle}>
                  <Box width={120}height={100}borderRadius={16}bg={config.bgColor}alignItems="center"justifyContent="center"style={{borderWidth:3,borderColor:config.color}}>
                    {}
                    <Text style={{fontSize:48}}>🎁</Text>

                    {}
                    {luckyBonusActive&&<Box position="absolute"top={-8}right={-8}>
                        <Text style={{fontSize:24}}>✨</Text>
                      </Box>}
                  </Box>
                </Animated.View>

                {}
                {config.hasOrbitingParticles&&<OrbitingParticles color={config.glowColor}/>}
              </Box>

              {}
              <Box px={4}py={2}borderRadius={8}style={{backgroundColor:withAlpha(config.color,0.2),borderWidth:1,borderColor:config.color}}>
                <Text variant="caption"color={config.color}fontWeight="bold">
                  {config.label}
                </Text>
              </Box>

              {}
              {canTap&&<Animated.View entering={FadeIn.delay(500)}>
                  <Text variant="caption"color={theme.colors.text.tertiary}mt={6}>
                    Or wait 2s to auto-open
                  </Text>
                </Animated.View>}
            </Box>
          </Animated.View>}

        {}
        {phase==='opening'&&<Animated.View style={particlesStyle}>
            <ParticleBurst color={config.glowColor}count={20}/>
          </Animated.View>}

        {}
        {(phase==='reveal'||phase==='complete')&&<Animated.View style={rewardContainerStyle}>
            <Box width={Math.min(SCREEN_WIDTH-48,400)}alignItems="center"px={6}py={8}borderRadius={24}bg={theme.colors.background.secondary}style={{borderWidth:2,borderColor:config.color,...getPremiumCardStyle('large')}}>
              {}
              <Box px={4}py={2}borderRadius={12}mb={4}style={{backgroundColor:withAlpha(config.color,0.2)}}>
                <Text variant="label"color={config.color}>
                  {config.label} REWARD
                </Text>
              </Box>

              {}
              <Box width="100%"flexDirection="row"justifyContent="space-between"gap={3}>
                <RewardBox label="XP"value={counts.xp}color={theme.colors.text.primary}icon="⭐"/>
                <RewardBox label="Coins"value={counts.coins}color={theme.colors.warning.DEFAULT}icon="🪙"/>
                <RewardBox label="Gems"value={counts.gems}color={theme.colors.primary[500]}icon="💎"/>
              </Box>

              {}
              {luckyBonusActive&&<Box mt={4}flexDirection="row"alignItems="center"gap={2}>
                  <Text style={{fontSize:20}}>🍀</Text>
                  <Text variant="bodySmall"color={theme.colors.success.DEFAULT}>
                    Lucky Bonus Applied!
                  </Text>
                </Box>}

              {}
              {tier!=='legendary'&&<Animated.View entering={FadeIn.delay(1500)}>
                  <Box mt={4}px={4}py={2}borderRadius={8}style={{backgroundColor:withAlpha(theme.colors.warning.light,0.3)}}>
                    <Text variant="caption"color={theme.colors.warning.DEFAULT}textAlign="center">
                      ALMOST {tier==='common'?'UNCOMMON':tier==='uncommon'?'RARE':tier==='rare'?'EPIC':'LEGENDARY'}!
                    </Text>
                    <Text variant="caption"color={theme.colors.text.tertiary}textAlign="center"mt={1}>
                      Rolled 96.8% — needed 98%
                    </Text>
                  </Box>
                </Animated.View>}
            </Box>
          </Animated.View>}
      </Box>
    </Pressable>;};const OrbitingParticles:React.FC<{color:string;}>=({color})=>{return<Box style={{position:'absolute',top:0,left:0,right:0,bottom:0}}pointerEvents="none">
      {Array.from({length:6}).map((_,i)=>{const angle=i/6*Math.PI*2;const radius=70;const x=Math.cos(angle)*radius;const y=Math.sin(angle)*radius;const delay=i*200;return<Animated.View key={i}entering={FadeIn.delay(delay)}style={{position:'absolute',left:60+x-4,top:50+y-4}}>
            <Box width={8}height={8}borderRadius={4}style={{backgroundColor:color}}/>
          </Animated.View>;})}
    </Box>;};const ParticleBurst:React.FC<{color:string;count:number;}>=({color,count})=>{return<Box style={{width:200,height:200,position:'relative'}}pointerEvents="none">
      {Array.from({length:count}).map((_,i)=>{const angle=Math.random()*Math.PI*2;const distance=50+Math.random()*50;const x=Math.cos(angle)*distance;const y=Math.sin(angle)*distance;const size=4+Math.random()*6;const delay=Math.random()*300;return<Animated.View key={i}entering={FadeIn.delay(delay)}style={{position:'absolute',left:100+x-size/2,top:100+y-size/2}}>
            <Box width={size}height={size}borderRadius={size/2}style={{backgroundColor:color}}/>
          </Animated.View>;})}
    </Box>;};interface RewardBoxProps{label:string;value:number;color:string;icon:string;}const RewardBox:React.FC<RewardBoxProps>=({label,value,color,icon})=>{const{theme}=useTheme();return<Box flex={1}p={3}borderRadius={16}alignItems="center"bg={theme.colors.background.primary}>
      <Text variant="caption"color={theme.colors.text.tertiary}>
        {label}
      </Text>
      <Box flexDirection="row"alignItems="center"gap={1}mt={1}>
        <Text style={{fontSize:16}}>{icon}</Text>
        <Text variant="h3"color={color}>
          {value.toLocaleString()}
        </Text>
      </Box>
    </Box>;};export{mapVariableRewardTier,TIER_CONFIGS};export default ChestRevealAnimationEnhanced;
