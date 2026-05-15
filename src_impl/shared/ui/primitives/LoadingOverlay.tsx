import React from'react'; import{View,Text,StyleSheet,ActivityIndicator,Modal,ViewStyle}from'react-native'; import Animated,{useSharedValue,useAnimatedStyle,withRepeat,withTiming,withSequence}from'react-native-reanimated'; import{useFadeIn}from'../hooks/useReanimated'; import{Skeleton,SkeletonCard,SkeletonList}from'./Skeleton'; import{createSheet}from'@/shared/ui/create-sheet'; interface LoadingOverlayProps{visible:boolean;message?:string;progress?:number;showProgress?:boolean;blur?:boolean;style?:ViewStyle;}export function LoadingOverlay({visible,message = 'Loading...',progress,showProgress = false,blur = true,style}:LoadingOverlayProps){const fadeStyle = useFadeIn(300); const pulseStyle = usePulseAnimation(); if(!visible){return null;}return<Modal transparent visible={visible}animationType="fade"statusBarTranslucent>
      <Animated.View style={[styles.container,blur && styles.blurBackground,fadeStyle,style]}>
        <View style={styles.content}>
          <Animated.View style={pulseStyle}>
            <ActivityIndicator size="large"color="#6366f1"/>
          </Animated.View>

          <Text style={styles.message}>{message}</Text>

          {showProgress && progress !== undefined && <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill,{width:`${Math.min(100,Math.max(0,progress))}%`}]}/>
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>}
        </View>
      </Animated.View>
    </Modal>;}function usePulseAnimation(){const scale = useSharedValue(1); React.useEffect(()=>{scale.value = withRepeat(withSequence(withTiming(1.1,{duration:500}),withTiming(1,{duration:500})),-1,true);},[scale]); return useAnimatedStyle(()=>({transform:[{scale:scale.value}]}));}interface SectionLoadingProps{type?:'text'|'card'|'chart'|'list';count?:number;style?:ViewStyle;}export function SectionLoading({type = 'card',count = 3,style}:SectionLoadingProps){switch(type){case'text':return<View style={[styles.sectionContainer,style]}>
          <Skeleton lines={count}height={16}spacing={8}/>
        </View>; case'card':return<View style={[styles.sectionContainer,style]}>
          {Array.from({length:count}).map((_,i)=><SkeletonCard key={i}style={styles.sectionItem}/>)}
        </View>; case'chart':return<View style={[styles.sectionContainer,style]}>
          <Skeleton variant="rounded"height={200}/>
        </View>; case'list':return<View style={[styles.sectionContainer,style]}>
          <SkeletonList count={count}/>
        </View>; default:return null;}}interface ProgressIndicatorProps{progress:number;message?:string;submessage?:string;style?:ViewStyle;}export function ProgressIndicator({progress,message = 'Processing...',submessage,style}:ProgressIndicatorProps){const fadeStyle = useFadeIn(300); return<Animated.View style={[styles.progressOverlay,style,fadeStyle]}>
      <View style={styles.progressContent}>
        <View style={styles.progressBarLarge}>
          <Animated.View style={[styles.progressFillLarge,{width:`${Math.min(100,Math.max(0,progress))}%`}]}/>
        </View>

        <Text style={styles.progressMessage}>{message}</Text>
        {submessage && <Text style={styles.progressSubmessage}>{submessage}</Text>}

        <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
      </View>
    </Animated.View>;}interface ButtonLoadingProps{loading:boolean;children:React.ReactNode;}export function ButtonLoading({loading,children}:ButtonLoadingProps){if(!loading){return<>{children}</>;}return<View style={styles.buttonLoading}>
      <ActivityIndicator size="small"color="#6366f1"/>
      <Text style={styles.buttonLoadingText}>Processing...</Text>
    </View>;}const styles = createSheet({container:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0, 0, 0, 0.5)'},blurBackground:{backgroundColor:'rgba(255, 255, 255, 0.9)'},content:{alignItems:'center',padding:32},message:{marginTop:16,fontSize:16,color:'#374151',fontWeight:'500'},progressContainer:{marginTop:16,width:200},progressBar:{height:4,backgroundColor:'#e5e7eb',borderRadius:2,overflow:'hidden'},progressFill:{height:'100%',backgroundColor:'#6366f1',borderRadius:2},progressText:{marginTop:8,fontSize:12,color:'#6b7280',textAlign:'center'},sectionContainer:{padding:16},sectionItem:{marginBottom:12},progressOverlay:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(255, 255, 255, 0.95)',justifyContent:'center',alignItems:'center',zIndex:1000},progressContent:{width:'80%',maxWidth:300,alignItems:'center'},progressBarLarge:{width:'100%',height:8,backgroundColor:'#e5e7eb',borderRadius:4,overflow:'hidden',marginBottom:16},progressFillLarge:{height:'100%',backgroundColor:'#6366f1',borderRadius:4},progressMessage:{fontSize:16,fontWeight:'600',color:'#111827',marginBottom:4},progressSubmessage:{fontSize:14,color:'#6b7280',marginBottom:8,textAlign:'center'},progressPercentage:{fontSize:24,fontWeight:'700',color:'#6366f1'},buttonLoading:{flexDirection:'row',alignItems:'center',gap:8},buttonLoadingText:{fontSize:14,color:'#6b7280'}});
