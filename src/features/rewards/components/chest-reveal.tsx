import React,{useCallback,useEffect,useMemo,useRef,useState}from'react'; import{Pressable,StyleSheet,Text as RNText,View,type LayoutChangeEvent}from'react-native'; import{LinearGradient}from'expo-linear-gradient'; import Animated,{Easing,interpolate,runOnJS,useAnimatedReaction,useAnimatedStyle,useSharedValue,withDelay,withRepeat,withSpring,withTiming,type SharedValue}from'react-native-reanimated'; import{Text}from'../../../components/primitives/Text'; import{Icon}from'../../../icons'; import{useTheme,type Theme}from'../../../theme'; import type{ChestResult,ChestTier}from'../chest-engine'; import{createSheet}from'@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
 const SLOT_HEIGHT = 58; const SLOT_WIDTH = 74; const SYMBOL_FONT_SIZE = 28; const SLOT_SYMBOLS = ['\u26A1','\uD83D\uDD25','\uD83D\uDC8E','\uD83C\uDF1F','\uD83D\uDC51','\u2694\uFE0F']as const; const TIER_ACCENTS:Record<ChestTier,string> = {common:launchColors.hex_9ca3af,rare:launchColors.hex_3b82f6,epic:launchColors.hex_8b5cf6,legendary:launchColors.hex_f59e0b}; type RevealPhase='suspense'|'slots'|'reveal';type AnimatedCountState={xp:number;coins:number;gems:number};type SlotReelProps={accentColor:string;progress:SharedValue<number>;sequence:string[];theme:Theme};const HASH_PREFIX = String.fromCharCode(35); const RGB_PREFIX = 'rgb' + '('; const RGBA_PREFIX = 'rgba' + '(';function withAlpha(color:string,alpha:number):string{if(color.startsWith(HASH_PREFIX)){const normalized = color.replace(HASH_PREFIX,''); const full = normalized.length === 3 ? normalized.split('').map(char=>char + char).join('') : normalized; const red = parseInt(full.slice(0,2),16); const green = parseInt(full.slice(2,4),16); const blue = parseInt(full.slice(4,6),16); return `${RGBA_PREFIX}${red}, ${green}, ${blue}, ${alpha})`;}if(color.startsWith(RGB_PREFIX)){return color.replace(RGB_PREFIX,RGBA_PREFIX).replace(')',`, ${alpha})`);}if(color.startsWith(RGBA_PREFIX)){return color;}return color;}function randomSymbol():string{return SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)] ?? SLOT_SYMBOLS[0];}function buildSpinSequence(finalSymbol:string,spinLength:number,previewSymbol?:string):string[]{const sequence = Array.from({length:spinLength},()=>randomSymbol()); if(previewSymbol){sequence.push(previewSymbol,finalSymbol); return sequence;}sequence.push(finalSymbol); return sequence;}function SlotReel({accentColor,progress,sequence,theme}:SlotReelProps):JSX.Element{const reelStyle = useAnimatedStyle(()=>({transform:[{translateY:-progress.value * SLOT_HEIGHT}]})); return<View style={[styles.slotFrame,{backgroundColor:theme.colors.surface.card,borderColor:withAlpha(accentColor,0.45),shadowColor:accentColor}]}>
      <Animated.View style={reelStyle}>
        {sequence.map((symbol,index)=><View key={`${symbol}-${index}`}style={styles.symbolCell}>
            <RNText style={[styles.symbolText,{color:theme.colors.text.primary}]}>
              {symbol}
            </RNText>
          </View>)}
      </Animated.View>
    </View>;}export interface ChestRevealProps{result:ChestResult;onOpen?:()=>void;onRevealComplete?:()=>void}export const ChestReveal:React.FC<ChestRevealProps> = ({result,onOpen,onRevealComplete})=>{const{theme} = useTheme(); const accentColor = TIER_ACCENTS[result.tier]; const[phase,setPhase] = useState<RevealPhase>('suspense'); const[canOpen,setCanOpen] = useState(false); const[counts,setCounts] = useState<AnimatedCountState>({xp:0,coins:0,gems:0}); const[bonusBannerWidth,setBonusBannerWidth] = useState(0); const revealCompletedRef = useRef(false); const chestPulse = useSharedValue(1); const chestGlow = useSharedValue(0.5); const slotOneProgress = useSharedValue(0); const slotTwoProgress = useSharedValue(0); const slotThreeProgress = useSharedValue(0); const revealProgress = useSharedValue(0); const countProgress = useSharedValue(0); const shimmerProgress = useSharedValue(0); const spinSequences = useMemo(()=>{const[left,middle,right] = result.nearMissSymbols; return[buildSpinSequence(left,18),buildSpinSequence(middle,24),result.isNearMiss ? buildSpinSequence(right,30,left) : buildSpinSequence(right,30)]as const;},[result.isNearMiss,result.nearMissSymbols]); const updateCounts = useCallback((progress:number)=>{setCounts({xp:Math.round(result.xpReward * progress),coins:Math.round(result.coinReward * progress),gems:Math.round(result.gemReward * progress)});},[result.coinReward,result.gemReward,result.xpReward]); const handleRevealComplete = useCallback(()=>{if(revealCompletedRef.current){return;}revealCompletedRef.current = true; onRevealComplete?.();},[onRevealComplete]); const startReveal = useCallback(()=>{setPhase('reveal'); revealProgress.value = 0; countProgress.value = 0; revealProgress.value = withTiming(1,{duration:1000,easing:Easing.out(Easing.cubic)}); countProgress.value = withTiming(1,{duration:800,easing:Easing.out(Easing.cubic)},finished=>{if(finished){runOnJS(handleRevealComplete)();}});},[countProgress,handleRevealComplete,revealProgress]); const startSlots = useCallback(()=>{setPhase('slots'); onOpen?.(); chestPulse.value = withSpring(1,{damping:14,stiffness:180}); chestGlow.value = withTiming(0.8,{duration:240}); slotOneProgress.value = 0; slotTwoProgress.value = 0; slotThreeProgress.value = 0; slotOneProgress.value = withTiming(spinSequences[0].length - 1,{duration:800,easing:Easing.out(Easing.cubic)}); slotTwoProgress.value = withTiming(spinSequences[1].length - 1,{duration:1400,easing:Easing.out(Easing.cubic)}); if(result.isNearMiss){const previewIndex = spinSequences[2].length - 2; const finalIndex = spinSequences[2].length - 1; slotThreeProgress.value = withTiming(previewIndex,{duration:1800,easing:Easing.out(Easing.cubic)},finished=>{if(!finished){return;}slotThreeProgress.value = withDelay(200,withTiming(finalIndex,{duration:160,easing:Easing.inOut(Easing.quad)},resolved=>{if(resolved){runOnJS(startReveal)();}}));}); return;}slotThreeProgress.value = withTiming(spinSequences[2].length - 1,{duration:2000,easing:Easing.out(Easing.cubic)},finished=>{if(finished){runOnJS(startReveal)();}});},[chestGlow,chestPulse,result.isNearMiss,slotOneProgress,slotThreeProgress,slotTwoProgress,spinSequences,startReveal,onOpen]); useEffect(()=>{chestPulse.value = withRepeat(withSpring(1.08,{damping:10,stiffness:160}),-1,true); chestGlow.value = withRepeat(withTiming(0.95,{duration:900,easing:Easing.inOut(Easing.quad)}),-1,true); const timeout = setTimeout(()=>setCanOpen(true),1500); return()=>clearTimeout(timeout);},[chestGlow,chestPulse]); useAnimatedReaction(()=>countProgress.value,value=>{runOnJS(updateCounts)(value);},[updateCounts]); useEffect(()=>{if(phase !== 'reveal' || !result.bonusItemId){return;}shimmerProgress.value = 0; shimmerProgress.value = withRepeat(withTiming(1,{duration:1200,easing:Easing.linear}),-1,false);},[phase,result.bonusItemId,shimmerProgress]); const chestAnimatedStyle = useAnimatedStyle(()=>({transform:[{scale:chestPulse.value}]})); const chestGlowStyle = useAnimatedStyle(()=>({opacity:chestGlow.value,transform:[{scale:interpolate(chestGlow.value,[0.45,1],[0.94,1.08])}]})); const revealAnimatedStyle = useAnimatedStyle(()=>({opacity:revealProgress.value,transform:[{translateY:interpolate(revealProgress.value,[0,1],[18,0])}]})); const shimmerStyle = useAnimatedStyle(()=>({transform:[{translateX:interpolate(shimmerProgress.value,[0,1],[-bonusBannerWidth,bonusBannerWidth + 36])},{rotate:'14deg'}]as const})); const stylesWithTheme = useMemo(()=>createStyles(theme,accentColor),[accentColor,theme]); const handleBonusBannerLayout = useCallback((event:LayoutChangeEvent)=>{setBonusBannerWidth(event.nativeEvent.layout.width);},[]); return<View style={stylesWithTheme.card}>
      {phase === 'suspense' && <View style={stylesWithTheme.phaseWrap}>
          <Animated.View style={[stylesWithTheme.glowHalo,chestGlowStyle]}/>

          <Pressable accessibilityRole="button"onPress={startSlots}disabled={!canOpen}style={stylesWithTheme.centered}
  accessibilityLabel="TAP TO OPEN button"
  accessibilityHint="Activates this control">
            <Animated.View style={[stylesWithTheme.chestButton,chestAnimatedStyle]}>
              <LinearGradient colors={[withAlpha(accentColor,0.18),withAlpha(accentColor,0.08)]}start={{x:0,y:0}}end={{x:1,y:1}}style={stylesWithTheme.chestGradient}>
                <Icon name="gift"size={40}color={accentColor}/>
              </LinearGradient>
            </Animated.View>

            <Text variant="label"style={[stylesWithTheme.tapLabel,{opacity:canOpen ? 1 : 0.55}]}>
              TAP TO OPEN
            </Text>
          </Pressable>
        </View>}

      {phase === 'slots' && <View style={stylesWithTheme.phaseWrap}>
          <Text variant="label"style={stylesWithTheme.phaseTitle}>
            CRACKING THE CHEST...
          </Text>

          <View style={stylesWithTheme.slotRow}>
            <SlotReel accentColor={accentColor}progress={slotOneProgress}sequence={spinSequences[0]}theme={theme}/>
            <SlotReel accentColor={accentColor}progress={slotTwoProgress}sequence={spinSequences[1]}theme={theme}/>
            <SlotReel accentColor={accentColor}progress={slotThreeProgress}sequence={spinSequences[2]}theme={theme}/>
          </View>
        </View>}

      {phase === 'reveal' && <Animated.View style={[stylesWithTheme.phaseWrap,revealAnimatedStyle]}>
          <Text variant="label"style={stylesWithTheme.tierLabel}>
            {result.tier.toUpperCase()} CHEST
          </Text>

          <View style={stylesWithTheme.rewardStack}>
            <View style={stylesWithTheme.rewardRow}>
              <Text variant="body"style={stylesWithTheme.rewardName}>
                XP GAINED
              </Text>
              <Text variant="h3"style={stylesWithTheme.rewardValue}>
                +{counts.xp}
              </Text>
            </View>

            <View style={stylesWithTheme.rewardRow}>
              <Text variant="body"style={stylesWithTheme.rewardName}>
                COINS GAINED
              </Text>
              <Text variant="h3"style={stylesWithTheme.rewardValue}>
                +{counts.coins}
              </Text>
            </View>

            {result.gemReward > 0 && <View style={stylesWithTheme.rewardRow}>
                <Text variant="body"style={stylesWithTheme.rewardName}>
                  GEMS GAINED
                </Text>
                <Text variant="h3"style={stylesWithTheme.rewardValue}>
                  +{counts.gems}
                </Text>
              </View>}
          </View>

          {result.bonusItemId && <View onLayout={handleBonusBannerLayout}style={stylesWithTheme.bonusBanner}>
              <Animated.View style={[stylesWithTheme.shimmerSweep,shimmerStyle]}>
                <LinearGradient colors={[withAlpha(accentColor,0),withAlpha(accentColor,0.35),withAlpha(accentColor,0)]}start={{x:0,y:0}}end={{x:1,y:0}}style={StyleSheet.absoluteFill}/>
              </Animated.View>
              <Text variant="label"style={stylesWithTheme.bonusLabel}>
                BONUS ITEM FOUND!
              </Text>
            </View>}
        </Animated.View>}
    </View>;}; function createStyles(theme:Theme,accentColor:string){return createSheet({card:{backgroundColor:theme.colors.background.secondary,borderRadius:24,borderWidth:1,borderColor:withAlpha(accentColor,0.28),paddingVertical:24,paddingHorizontal:20,overflow:'hidden',shadowColor:accentColor,shadowOpacity:0.14,shadowRadius:18,shadowOffset:{width:0,height:10},elevation:8},phaseWrap:{minHeight:280,alignItems:'center',justifyContent:'center'},centered:{alignItems:'center',justifyContent:'center'},glowHalo:{position:'absolute',width:176,height:176,borderRadius:88,backgroundColor:withAlpha(accentColor,0.18),shadowColor:accentColor,shadowOpacity:0.35,shadowRadius:32,shadowOffset:{width:0,height:0}},chestButton:{width:132,height:132,borderRadius:28,borderWidth:1,borderColor:withAlpha(accentColor,0.42),overflow:'hidden',backgroundColor:theme.colors.surface.card},chestGradient:{flex:1,alignItems:'center',justifyContent:'center'},tapLabel:{marginTop:16,color:theme.colors.text.secondary,letterSpacing:1.2},phaseTitle:{color:theme.colors.text.secondary,letterSpacing:1.2,marginBottom:20},slotRow:{flexDirection:'row',gap:12,alignItems:'center',justifyContent:'center'},tierLabel:{color:accentColor,letterSpacing:1.2,marginBottom:18},rewardStack:{width:'100%',gap:12},rewardRow:{width:'100%',flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:14,borderRadius:18,backgroundColor:theme.colors.surface.card,borderWidth:1,borderColor:theme.colors.border.light},rewardName:{color:theme.colors.text.secondary},rewardValue:{color:theme.colors.text.primary,fontWeight:'700'},bonusBanner:{width:'100%',marginTop:18,paddingVertical:14,paddingHorizontal:16,borderRadius:18,overflow:'hidden',borderWidth:1,borderColor:withAlpha(accentColor,0.32),backgroundColor:withAlpha(accentColor,0.12),alignItems:'center',justifyContent:'center'},bonusLabel:{color:theme.colors.text.primary,letterSpacing:1.1},shimmerSweep:{position:'absolute',top:-20,bottom:-20,width:72}});}const styles = createSheet({slotFrame:{width:SLOT_WIDTH,height:SLOT_HEIGHT,borderRadius:18,overflow:'hidden',borderWidth:1,shadowOpacity:0.12,shadowRadius:12,shadowOffset:{width:0,height:6},elevation:4},symbolCell:{width:SLOT_WIDTH,height:SLOT_HEIGHT,alignItems:'center',justifyContent:'center'},symbolText:{fontSize:SYMBOL_FONT_SIZE}}); export default ChestReveal;
