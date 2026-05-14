import React,{useEffect}from'react';import{View,StyleSheet,Dimensions,type StyleProp,type ViewStyle}from'react-native';import Animated,{useAnimatedStyle,useSharedValue,withRepeat,withTiming}from'react-native-reanimated';import{useTheme}from'../../../theme';import{createSheet}from'@/shared/ui/create-sheet';const{width:SCREEN_WIDTH}=Dimensions.get('window');interface SkeletonProps{width?:number|string;height?:number;borderRadius?:number;style?:StyleProp<ViewStyle>;}const Skeleton:React.FC<SkeletonProps>=({width='100%',height=12,borderRadius=6,style})=>{const{theme}=useTheme();const shimmerAnim=useSharedValue(-1);useEffect(()=>{shimmerAnim.value=withRepeat(withTiming(1,{duration:1500}),-1,false);},[shimmerAnim]);const shimmerStyle=useAnimatedStyle(()=>({transform:[{translateX:shimmerAnim.value*SCREEN_WIDTH}]}));const widthStyle:ViewStyle={width:width as ViewStyle['width']};return<View style={[styles.container,{height,borderRadius,backgroundColor:theme.colors.background.secondary},widthStyle,style]}>
      <Animated.View style={[styles.shimmer,shimmerStyle]}/>
    </View>;};export const StudyPlanSkeleton:React.FC=()=>{const{theme}=useTheme();return<View style={[styles.card,{backgroundColor:theme.colors.background.primary}]}>
      {}
      <View style={styles.header}>
        <Skeleton width={48}height={48}borderRadius={24}/>
        <View style={styles.headerText}>
          <Skeleton width={180}height={20}borderRadius={4}/>
          <Skeleton width={120}height={14}borderRadius={4}style={{marginTop:8}}/>
        </View>
      </View>

      {}
      <View style={styles.statsRow}>
        <Skeleton width={80}height={32}borderRadius={8}/>
        <Skeleton width={80}height={32}borderRadius={8}/>
        <Skeleton width={80}height={32}borderRadius={8}/>
      </View>

      {}
      <Skeleton width={100}height={18}borderRadius={4}style={{marginTop:24}}/>
      <View style={styles.taskList}>
        {[1,2,3,4].map(i=><View key={i}style={styles.taskItem}>
            <Skeleton width={24}height={24}borderRadius={12}/>
            <View style={styles.taskText}>
              <Skeleton width={`${85-i*10}%`}height={16}borderRadius={4}/>
              <Skeleton width={60}height={12}borderRadius={4}style={{marginTop:6}}/>
            </View>
          </View>)}
      </View>

      {}
      <Skeleton width={100}height={18}borderRadius={4}style={{marginTop:24}}/>
      <View style={styles.quizList}>
        {[1,2,3].map(i=><View key={i}style={styles.quizItem}>
            <Skeleton width="100%"height={16}borderRadius={4}/>
            <View style={styles.options}>
              <Skeleton width="100%"height={40}borderRadius={8}style={{marginTop:8}}/>
              <Skeleton width="100%"height={40}borderRadius={8}style={{marginTop:8}}/>
            </View>
          </View>)}
      </View>
    </View>;};export const ContentHistorySkeleton:React.FC=()=>{const{theme}=useTheme();return<View style={[styles.list,{backgroundColor:theme.colors.background.primary}]}>
      {[1,2,3,4,5].map(i=><View key={i}style={[styles.listItem,{backgroundColor:theme.colors.background.secondary}]}>
          <View style={styles.itemIcon}>
            <Skeleton width={40}height={40}borderRadius={20}/>
          </View>
          <View style={styles.itemContent}>
            <Skeleton width={`${70-i*5}%`}height={16}borderRadius={4}/>
            <Skeleton width={100}height={12}borderRadius={4}style={{marginTop:8}}/>
          </View>
          <Skeleton width={60}height={24}borderRadius={12}/>
        </View>)}
    </View>;};export const ExtractionSkeleton:React.FC=()=>{const{theme}=useTheme();return<View style={[styles.extractionCard,{backgroundColor:theme.colors.background.secondary}]}>
      <View style={styles.extractionHeader}>
        <Skeleton width={48}height={48}borderRadius={24}/>
        <View style={styles.extractionText}>
          <Skeleton width={140}height={20}borderRadius={4}/>
          <Skeleton width={100}height={14}borderRadius={4}style={{marginTop:8}}/>
        </View>
      </View>

      <Skeleton width="100%"height={8}borderRadius={4}style={{marginTop:20}}/>

      <View style={styles.stages}>
        {[1,2,3,4,5].map(i=><View key={i}style={styles.stage}>
            <Skeleton width={12}height={12}borderRadius={6}/>
            <Skeleton width={50}height={10}borderRadius={4}style={{marginTop:6}}/>
          </View>)}
      </View>
    </View>;};const styles=createSheet({container:{overflow:'hidden'},shimmer:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(255, 255, 255, 0.2)',width:'30%'},card:{borderRadius:16,padding:20,margin:16},header:{flexDirection:'row',alignItems:'center'},headerText:{marginLeft:12,flex:1},statsRow:{flexDirection:'row',justifyContent:'space-between',marginTop:20},taskList:{marginTop:12},taskItem:{flexDirection:'row',alignItems:'center',marginTop:12},taskText:{marginLeft:12,flex:1},quizList:{marginTop:12},quizItem:{marginTop:16,padding:12,borderRadius:8},options:{marginTop:8},list:{padding:16},listItem:{flexDirection:'row',alignItems:'center',padding:16,borderRadius:12,marginBottom:12},itemIcon:{marginRight:12},itemContent:{flex:1},extractionCard:{borderRadius:16,padding:20,margin:16},extractionHeader:{flexDirection:'row',alignItems:'center'},extractionText:{marginLeft:12,flex:1},stages:{flexDirection:'row',justifyContent:'space-between',marginTop:20},stage:{alignItems:'center'}});export default Skeleton;
