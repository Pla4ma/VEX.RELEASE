import React,{useEffect,useRef}from'react'; import{View,Text,StyleSheet,ActivityIndicator,type ViewStyle}from'react-native'; import{createSheet}from'@/shared/ui/create-sheet'; import Animated,{useSharedValue,useAnimatedStyle,withTiming,withSpring,withRepeat,withSequence,Easing}from'react-native-reanimated'; interface ProgressBarProps{progress:number;height?:number;backgroundColor?:string;fillColor?:string;animated?:boolean;style?:ViewStyle;showPercentage?:boolean}export function ProgressBar({progress,height = 8,backgroundColor = '#E1E4E8',fillColor = '#4ECDC4',animated = true,style,showPercentage = false}:ProgressBarProps){const progressAnim = useSharedValue(0); useEffect(()=>{progressAnim.value = animated ? withTiming(Math.max(0,Math.min(100,progress)) / 100,{duration:500,easing:Easing.out(Easing.ease)}) : Math.max(0,Math.min(100,progress)) / 100;},[progress,animated,progressAnim]); const fillStyle = useAnimatedStyle(()=>({width:`${progressAnim.value * 100}%`})); return<View style={style}>
      <View style={[styles.progressContainer,{height,backgroundColor,borderRadius:height / 2}]}>
        <Animated.View style={[styles.progressFill,{backgroundColor:fillColor,borderRadius:height / 2},fillStyle]}/>
      </View>
      {showPercentage && <Text style={styles.progressText}>{Math.round(progress)}%</Text>}
    </View>;}interface SegmentedProgressProps{segments:number;completed:number;height?:number;gap?:number}export function SegmentedProgress({segments,completed,height = 8,gap = 4}:SegmentedProgressProps){return<View style={[styles.segmentedContainer,{gap}]}>
      {Array.from({length:segments}).map((_,i)=><View key={i}style={[styles.segment,{height,borderRadius:height / 2,backgroundColor:i < completed ? '#4ECDC4' : '#E1E4E8',flex:1}]}/>)}
    </View>;}interface CircularProgressProps{progress:number;size?:number;strokeWidth?:number;color?:string;backgroundColor?:string;showText?:boolean}export function CircularProgress({progress,size = 64,strokeWidth = 6,color = '#4ECDC4',backgroundColor = '#E1E4E8',showText = true}:CircularProgressProps){const progressAnim = useSharedValue(0); const radius = (size - strokeWidth) / 2; const circumference = 2 * Math.PI * radius; useEffect(()=>{progressAnim.value = withSpring(Math.max(0,Math.min(100,progress)) / 100,{damping:15,stiffness:100});},[progress,progressAnim]); const strokeDashoffset = useAnimatedStyle(()=>({width:`${progressAnim.value * 100}%`})); return<View style={[styles.circularContainer,{width:size,height:size}]}>
      <View style={styles.circularSvg}>
        {}
        <View style={[styles.circularBackground,{width:size,height:size,borderRadius:size / 2,borderWidth:strokeWidth,borderColor:backgroundColor}]}/>
        {}
        <Animated.View style={[styles.circularProgress,{width:size,height:size,borderRadius:size / 2,borderWidth:strokeWidth,borderColor:color,borderTopColor:color,borderRightColor:progress > 25 ? color : backgroundColor,borderBottomColor:progress > 50 ? color : backgroundColor,borderLeftColor:progress > 75 ? color : backgroundColor},useAnimatedStyle(()=>({transform:[{rotate:`${progressAnim.value * 360}deg`}]}))]}/>
      </View>
      {showText && <Text style={[styles.circularText,{fontSize:size * 0.25}]}>
          {Math.round(progress)}%
        </Text>}
    </View>;}interface LoadingStateProps{message?:string;submessage?:string;progress?:number;showProgress?:boolean}export function LoadingState({message = 'Loading...',submessage,progress,showProgress = false}:LoadingStateProps){return<View style={styles.loadingContainer}>
      <ActivityIndicator size="large"color="#4ECDC4"/>
      <Text style={styles.loadingMessage}>{message}</Text>
      {submessage && <Text style={styles.loadingSubmessage}>{submessage}</Text>}
      {showProgress && progress !== undefined && <ProgressBar progress={progress}style={styles.loadingProgress}showPercentage/>}
    </View>;}export function LoadingDots({count = 3}:{count?:number}){const scales = Array.from({length:count},()=>useSharedValue(1)); useEffect(()=>{scales.forEach((scale,i)=>{const delay = i * 150; setTimeout(()=>{scale.value = withRepeat(withSequence(withTiming(1.5,{duration:400,easing:Easing.inOut(Easing.ease)}),withTiming(1,{duration:400,easing:Easing.inOut(Easing.ease)})),-1,true);},delay);});},[scales]); return<View style={styles.dotsContainer}>
      {scales.map((scale,i)=><Animated.View key={i}style={[styles.dot,useAnimatedStyle(()=>({transform:[{scale:scale.value}]}))]}/>)}
    </View>;}interface StepProgressProps{steps:string[];currentStep:number}export function StepProgress({steps,currentStep}:StepProgressProps){return<View style={styles.stepsContainer}>
      {steps.map((step,index)=>{const isCompleted = index < currentStep; const isCurrent = index === currentStep; return<View key={index}style={styles.stepItem}>
            <View style={[styles.stepCircle,isCompleted && styles.stepCircleCompleted,isCurrent && styles.stepCircleCurrent]}>
              {isCompleted ? <Text style={styles.stepCheck}>✓</Text> : <Text style={[styles.stepNumber,(isCurrent || isCompleted) && styles.stepNumberActive]}>
                  {index + 1}
                </Text>}
            </View>
            <Text style={[styles.stepLabel,isCompleted && styles.stepLabelCompleted,isCurrent && styles.stepLabelCurrent]}>
              {step}
            </Text>
            {index < steps.length - 1 && <View style={[styles.stepLine,isCompleted && styles.stepLineCompleted]}/>}
          </View>;})}
    </View>;}interface SuccessStateProps{title?:string;message:string;onComplete?:()=>void;autoDismiss?:boolean;dismissDelay?:number}export function SuccessState({title = 'Success!',message,onComplete,autoDismiss = false,dismissDelay = 2000}:SuccessStateProps){const scale = useSharedValue(0); useEffect(()=>{scale.value = withSpring(1,{damping:12,stiffness:200}); if(autoDismiss && onComplete){const timer = setTimeout(onComplete,dismissDelay); return()=>clearTimeout(timer);}return undefined;},[scale,autoDismiss,dismissDelay,onComplete]); const animatedStyle = useAnimatedStyle(()=>({transform:[{scale:scale.value}]})); return<Animated.View style={[styles.successContainer,animatedStyle]}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✓</Text>
      </View>
      <Text style={styles.successTitle}>{title}</Text>
      <Text style={styles.successMessage}>{message}</Text>
    </Animated.View>;}interface ProcessingStateProps{steps:{label:string;status:'pending'|'processing'|'completed'|'error'}[]}export function ProcessingState({steps}:ProcessingStateProps){return<View style={styles.processingContainer}>
      {steps.map((step,index)=><View key={index}style={styles.processingItem}>
          <View style={[styles.processingDot,step.status === 'completed' && styles.processingDotCompleted,step.status === 'error' && styles.processingDotError,step.status === 'processing' && styles.processingDotProcessing]}>
            {step.status === 'completed' && <Text style={styles.processingCheck}>✓</Text>}
            {step.status === 'error' && <Text style={styles.processingError}>✕</Text>}
            {step.status === 'processing' && <ActivityIndicator size="small"color="#fff"/>}
          </View>
          <Text style={[styles.processingLabel,step.status === 'completed' && styles.processingLabelCompleted,step.status === 'error' && styles.processingLabelError]}>
            {step.label}
          </Text>
        </View>)}
    </View>;}const styles = createSheet({progressContainer:{overflow:'hidden',width:'100%'},progressFill:{height:'100%'},progressText:{fontSize:12,color:'#666',marginTop:4,textAlign:'right'},segmentedContainer:{flexDirection:'row',width:'100%'},segment:{flex:1},circularContainer:{justifyContent:'center',alignItems:'center'},circularSvg:{position:'relative'},circularBackground:{position:'absolute'},circularProgress:{position:'absolute',transform:[{rotate:'0deg'}]},circularText:{position:'absolute',fontWeight:'700',color:'#333'},loadingContainer:{alignItems:'center',justifyContent:'center',padding:24},loadingMessage:{fontSize:16,fontWeight:'600',color:'#333',marginTop:16},loadingSubmessage:{fontSize:14,color:'#666',marginTop:8,textAlign:'center'},loadingProgress:{width:'100%',maxWidth:200,marginTop:16},dotsContainer:{flexDirection:'row',gap:8,alignItems:'center'},dot:{width:10,height:10,borderRadius:5,backgroundColor:'#4ECDC4'},stepsContainer:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:16},stepItem:{alignItems:'center',flex:1},stepCircle:{width:32,height:32,borderRadius:16,backgroundColor:'#E1E4E8',justifyContent:'center',alignItems:'center',marginBottom:8},stepCircleCompleted:{backgroundColor:'#4ECDC4'},stepCircleCurrent:{backgroundColor:'#FFD93D'},stepNumber:{fontSize:14,fontWeight:'600',color:'#666'},stepNumberActive:{color:'#fff'},stepCheck:{fontSize:16,color:'#fff',fontWeight:'700'},stepLabel:{fontSize:12,color:'#999',textAlign:'center'},stepLabelCompleted:{color:'#4ECDC4'},stepLabelCurrent:{color:'#333',fontWeight:'600'},stepLine:{position:'absolute',top:15,left:'50%',width:'100%',height:2,backgroundColor:'#E1E4E8',zIndex:-1},stepLineCompleted:{backgroundColor:'#4ECDC4'},successContainer:{alignItems:'center',justifyContent:'center',padding:32},successIcon:{width:80,height:80,borderRadius:40,backgroundColor:'#4ECDC4',justifyContent:'center',alignItems:'center',marginBottom:16},successIconText:{fontSize:40,color:'#fff',fontWeight:'700'},successTitle:{fontSize:24,fontWeight:'700',color:'#333',marginBottom:8},successMessage:{fontSize:16,color:'#666',textAlign:'center'},processingContainer:{gap:16,padding:16},processingItem:{flexDirection:'row',alignItems:'center',gap:12},processingDot:{width:24,height:24,borderRadius:12,backgroundColor:'#E1E4E8',justifyContent:'center',alignItems:'center'},processingDotCompleted:{backgroundColor:'#4ECDC4'},processingDotError:{backgroundColor:'#FF6B6B'},processingDotProcessing:{backgroundColor:'#FFD93D'},processingCheck:{fontSize:12,color:'#fff',fontWeight:'700'},processingError:{fontSize:12,color:'#fff',fontWeight:'700'},processingLabel:{fontSize:14,color:'#999'},processingLabelCompleted:{color:'#4ECDC4',textDecorationLine:'line-through'},processingLabelError:{color:'#FF6B6B'}});
