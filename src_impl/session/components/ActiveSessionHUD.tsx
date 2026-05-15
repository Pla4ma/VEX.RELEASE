import React,{useEffect}from'react'; import{Pressable,View,Text}from'react-native'; import Animated,{Easing,useAnimatedStyle,useSharedValue,withRepeat,withSequence,withTiming}from'react-native-reanimated'; import{useSession}from'../hooks/useSession'; import type{SessionPhase}from'../types'; import{createSheet}from'@/shared/ui/create-sheet'; import{LivingCompanion}from'@/features/companion/components/LivingCompanion'; import{getCompanionService}from'@/features/companion/service'; import type{CompanionState}from'@/features/companion/types'; import{createDebugger}from'@/utils/debug'; const debug = createDebugger('ActiveSessionHUD'); interface ActiveSessionHUDProps{userId:string;onPause?:()=>void;onResume?:()=>void;onAbandon?:()=>void;}export const ActiveSessionHUD:React.FC<ActiveSessionHUDProps> = ({userId,onPause,onResume,onAbandon})=>{const{session,isActive,isPaused,remainingSeconds,elapsedSeconds,completionPercentage,isLoading,error,pauseSession,resumeSession,abandonSession} = useSession(userId); const[companionState,setCompanionState] = React.useState<CompanionState|null>(null); const companionService = getCompanionService(); React.useEffect(()=>{if(!userId){return;}const loadCompanionState = async()=>{try{const state = companionService.getState(); setCompanionState(state);}catch(companionError){debug.error('Failed to load companion state:',companionError);}}; loadCompanionState();},[userId,companionService]); const pulseAnim = useSharedValue(1); useEffect(()=>{if(isActive && !isPaused){pulseAnim.value = withRepeat(withSequence(withTiming(1.05,{duration:1000,easing:Easing.inOut(Easing.ease)}),withTiming(1,{duration:1000,easing:Easing.inOut(Easing.ease)})),-1,true);}else{pulseAnim.value = withTiming(1,{duration:120});}},[isActive,isPaused,pulseAnim]); const pulseStyle = useAnimatedStyle(()=>({transform:[{scale:pulseAnim.value}]})); if(isLoading){return<SessionHUDLoadingState/>;}if(error){return<SessionHUDErrorState error={error}/>;}if(!session){return<SessionHUDEmptyState/>;}const formatTime = (seconds:number):string=>{const mins = Math.floor(seconds / 60); const secs = seconds % 60; return`${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;}; const getPhaseLabel = (phase:SessionPhase):string=>{switch(phase){case'FOCUS':return'🔥 Focus Time'; case'SHORT_BREAK':return'☕ Short Break'; case'LONG_BREAK':return'🌴 Long Break'; case'PREPARATION':return'📝 Preparation'; case'REVIEW':return'✅ Review'; default:return'Session';}}; const getStatusColor = ():string=>{if(isPaused){return'#FFA500';}if(isActive){return'#4CAF50';}return'#9E9E9E';}; return<Animated.View style={[styles.container,pulseStyle]}>
      {}
      <View style={styles.header}>
        <Text style={styles.phaseLabel}>{getPhaseLabel(session.phase)}</Text>
        <View style={[styles.statusIndicator,{backgroundColor:getStatusColor()}]}>
          <Text style={styles.statusText}>
            {isPaused ? 'PAUSED' : isActive ? 'ACTIVE' : 'INACTIVE'}
          </Text>
        </View>
      </View>

      {}
      {companionState && <View style={styles.companionContainer}>
          <LivingCompanion companionState={companionState}sessionProgress={completionPercentage}purityScore={session.purityScore || 75}elapsedSeconds={elapsedSeconds}totalSeconds={session.duration || session.config.duration || 1800}isPaused={isPaused}/>
        </View>}

      {}
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(remainingSeconds)}</Text>
        <Text style={styles.timerLabel}>remaining</Text>
      </View>

      {}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill,{width:`${completionPercentage}%`,backgroundColor:getStatusColor()}]}/>
        </View>
        <Text style={styles.progressText}>{Math.round(completionPercentage)}% complete</Text>
      </View>

      {}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.statLabel}>Elapsed</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {session.currentInterval}/{session.totalIntervals}
          </Text>
          <Text style={styles.statLabel}>Interval</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{session.pauses}</Text>
          <Text style={styles.statLabel}>Pauses</Text>
        </View>
      </View>

      {}
      <View style={styles.controls}>
        {!isActive || isPaused ? <Pressable style={({pressed})=>[styles.button,styles.primaryButton,pressed && {opacity:0.8}]}onPress={()=>{resumeSession(); onResume?.();}}accessibilityLabel="Resume session"accessibilityRole="button"accessibilityHint="Resumes the current focus session">
            <Text style={styles.buttonText}>▶ Resume</Text>
          </Pressable> : <Pressable style={({pressed})=>[styles.button,styles.secondaryButton,pressed && {opacity:0.8}]}onPress={()=>{pauseSession(); onPause?.();}}accessibilityLabel="Pause session"accessibilityRole="button"accessibilityHint="Pauses the current focus session">
            <Text style={styles.buttonText}>⏸ Pause</Text>
          </Pressable>}

        <Pressable style={({pressed})=>[styles.button,styles.dangerButton,pressed && {opacity:0.8}]}onPress={()=>{abandonSession(); onAbandon?.();}}accessibilityLabel="Abandon session"accessibilityRole="button"accessibilityHint="Ends the current focus session without saving progress">
          <Text style={styles.buttonText}>✕ Abandon</Text>
        </Pressable>
      </View>
    </Animated.View>;}; const SessionHUDLoadingState:React.FC = ()=><View style={styles.container}>
    <Text style={styles.loadingText}>Loading session...</Text>
  </View>; const SessionHUDErrorState:React.FC<{error:Error;}> = ({error})=><View style={styles.container}>
    <Text style={styles.errorText}>Error: {error.message}</Text>
  </View>; const SessionHUDEmptyState:React.FC = ()=><View style={styles.container}>
    <Text style={styles.emptyText}>No active session</Text>
    <Text style={styles.emptySubtext}>Create a session to get started</Text>
  </View>; const styles = createSheet({container:{backgroundColor:'#1a1a2e',borderRadius:16,padding:24,margin:16,boxShadow:'0px 4px 8px rgba(0,0,0,0.3)',elevation:8},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},companionContainer:{alignItems:'center',justifyContent:'center',marginVertical:16,minHeight:200},phaseLabel:{fontSize:18,fontWeight:'700',color:'#e94560'},statusIndicator:{paddingHorizontal:12,paddingVertical:6,borderRadius:12},statusText:{color:'#fff',fontSize:12,fontWeight:'600'},timerContainer:{alignItems:'center',marginVertical:24},timer:{fontSize:64,fontWeight:'200',color:'#fff',fontVariant:['tabular-nums']},timerLabel:{fontSize:14,color:'#9E9E9E',marginTop:4},progressContainer:{marginVertical:16},progressBar:{height:8,backgroundColor:'#2a2a3e',borderRadius:4,overflow:'hidden'},progressFill:{height:'100%',borderRadius:4},progressText:{fontSize:12,color:'#9E9E9E',textAlign:'center',marginTop:8},statsContainer:{flexDirection:'row',justifyContent:'space-around',marginVertical:20,paddingVertical:16,borderTopWidth:1,borderBottomWidth:1,borderColor:'#2a2a3e'},stat:{alignItems:'center'},statValue:{fontSize:20,fontWeight:'700',color:'#fff'},statLabel:{fontSize:12,color:'#9E9E9E',marginTop:4},controls:{flexDirection:'row',justifyContent:'space-around',marginTop:16},button:{paddingVertical:12,paddingHorizontal:24,borderRadius:8,minWidth:120,alignItems:'center'},primaryButton:{backgroundColor:'#4CAF50'},secondaryButton:{backgroundColor:'#FFA500'},dangerButton:{backgroundColor:'#e94560'},buttonText:{color:'#fff',fontSize:16,fontWeight:'600'},loadingText:{color:'#9E9E9E',fontSize:16,textAlign:'center'},errorText:{color:'#e94560',fontSize:16,textAlign:'center'},emptyText:{color:'#9E9E9E',fontSize:18,textAlign:'center'},emptySubtext:{color:'#666',fontSize:14,textAlign:'center',marginTop:8}}); export default ActiveSessionHUD;
