import React,{useState,useEffect,useCallback}from'react';import{View,Text,Pressable,Animated as RNAnimated,PanResponder}from'react-native';import NetInfo,{NetInfoState}from'@react-native-community/netinfo';import{createSheet}from'@/shared/ui/create-sheet';import{useSafeAreaInsets}from'react-native-safe-area-context';import{useTheme}from'@/theme';import{haptics}from'@/shared/feedback';interface PendingAction{id:string;type:'session'|'purchase'|'sync'|'upload';priority:'high'|'medium'|'low';description:string;timestamp:number;retryCount:number;}interface SmartOfflineIndicatorProps{syncQueue:PendingAction[];onManualSync?:()=>void;onDismiss?:()=>void;}export const SmartOfflineIndicator:React.FC<SmartOfflineIndicatorProps>=({syncQueue,onManualSync,onDismiss})=>{const{theme}=useTheme();const insets=useSafeAreaInsets();const[isConnected,setIsConnected]=useState(true);const[isExpanded,setIsExpanded]=useState(false);const[lastSyncTime,setLastSyncTime]=useState<number|null>(null);const[translateY]=useState(new RNAnimated.Value(-100));const[opacity]=useState(new RNAnimated.Value(0));const[scale]=useState(new RNAnimated.Value(1));const animateOut=useCallback(()=>{RNAnimated.parallel([RNAnimated.spring(translateY,{toValue:-100,useNativeDriver:true,friction:8}),RNAnimated.timing(opacity,{toValue:0,duration:200,useNativeDriver:true})]).start();},[opacity,translateY]);const animateIn=useCallback(()=>{RNAnimated.parallel([RNAnimated.spring(translateY,{toValue:0,useNativeDriver:true,friction:8}),RNAnimated.timing(opacity,{toValue:1,duration:300,useNativeDriver:true})]).start();if(syncQueue.length===0){setTimeout(()=>animateOut(),3000);}},[animateOut,opacity,syncQueue.length,translateY]);const handleDismiss=useCallback(()=>{animateOut();onDismiss?.();},[animateOut,onDismiss]);useEffect(()=>{const unsubscribe=NetInfo.addEventListener((state:NetInfoState)=>{const connected=state.isConnected??true;if(connected!==isConnected){setIsConnected(connected);if(connected){haptics.success('light');setLastSyncTime(Date.now());animateIn();}else{haptics.warning('light');animateOut();}}});return()=>unsubscribe();},[animateIn,animateOut,isConnected]);const toggleExpanded=useCallback(()=>{setIsExpanded(!isExpanded);haptics.selection();},[isExpanded]);const handleSync=useCallback(()=>{haptics.impact('medium');scale.setValue(0.95);RNAnimated.spring(scale,{toValue:1,friction:3,useNativeDriver:true}).start();if(onManualSync){onManualSync();}},[onManualSync,scale]);const highPriority=syncQueue.filter(item=>item.priority==='high');const mediumPriority=syncQueue.filter(item=>item.priority==='medium');const lowPriority=syncQueue.filter(item=>item.priority==='low');const getStatusColor=()=>{if(!isConnected){return theme.colors.error.DEFAULT;}if(highPriority.length>0){return theme.colors.warning.DEFAULT;}return theme.colors.success.DEFAULT;};const getStatusText=()=>{if(!isConnected){return syncQueue.length>0?`Offline - ${syncQueue.length} pending`:'Offline';}if(syncQueue.length>0){return`${syncQueue.length} items syncing...`;}return lastSyncTime?`Online - synced ${formatTime(lastSyncTime)}`:'Online';};const formatTime=(timestamp:number):string=>{const diff=Date.now()-timestamp;const seconds=Math.floor(diff/1000);const minutes=Math.floor(seconds/60);if(minutes>0){return`${minutes}m ago`;}return`${seconds}s ago`;};const panResponder=React.useRef(PanResponder.create({onMoveShouldSetPanResponder:(_,gestureState)=>{return gestureState.dy>10;},onPanResponderRelease:(_,gestureState)=>{if(gestureState.dy>50&&isConnected){handleSync();}}})).current;if(isConnected&&syncQueue.length===0&&!lastSyncTime){return null;}const statusColor=getStatusColor();return<RNAnimated.View style={[styles.container,{backgroundColor:theme.colors.surface.card,borderColor:statusColor,paddingTop:insets.top+8,transform:[{translateY}],opacity}]}{...panResponder.panHandlers}>
      <RNAnimated.View style={[styles.content,{transform:[{scale}]}]}>
        {}
        <Pressable style={({pressed})=>[styles.statusBar,pressed&&{opacity:0.8}]}onLongPress={handleDismiss}onPress={toggleExpanded}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
          <View style={styles.indicator}>
            <View style={[styles.pulseDot,{backgroundColor:statusColor}]}/>
          </View>

          <Text style={[styles.statusText,{color:theme.colors.text.primary}]}>
            {getStatusText()}
          </Text>

          {syncQueue.length>0&&<View style={[styles.badge,{backgroundColor:statusColor}]}>
              <Text style={styles.badgeText}>{syncQueue.length}</Text>
            </View>}

          <Text style={[styles.chevron,{color:theme.colors.text.secondary}]}>
            {isExpanded?'▼':'▶'}
          </Text>
        </Pressable>

        {}
        {isExpanded&&syncQueue.length>0&&<View style={styles.queueContainer}>
            {highPriority.length>0&&<QueueSection title="High Priority"items={highPriority}color={theme.colors.error.DEFAULT}/>}
            {mediumPriority.length>0&&<QueueSection title="Medium Priority"items={mediumPriority}color={theme.colors.warning.DEFAULT}/>}
            {lowPriority.length>0&&<QueueSection title="Low Priority"items={lowPriority}color={theme.colors.info.DEFAULT}/>}

            {isConnected&&<Pressable style={({pressed})=>[styles.syncButton,{backgroundColor:theme.colors.primary[500]},pressed&&{opacity:0.8}]}onPress={handleSync}accessibilityLabel="Sync button"accessibilityRole="button"accessibilityHint="Activates this control">
                <Text style={styles.syncButtonText}>
                  Sync Now ({syncQueue.length} items)
                </Text>
              </Pressable>}
          </View>}

        {}
        {isConnected&&syncQueue.length>0&&!isExpanded&&<Text style={[styles.hint,{color:theme.colors.text.muted}]}>
            Pull down to sync
          </Text>}
      </RNAnimated.View>
    </RNAnimated.View>;};const QueueSection:React.FC<{title:string;items:PendingAction[];color:string;}>=({title,items,color})=>{const{theme}=useTheme();return<View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.priorityDot,{backgroundColor:color}]}/>
        <Text style={[styles.sectionTitle,{color:theme.colors.text.secondary}]}>
          {title} ({items.length})
        </Text>
      </View>

      {items.map(item=><View key={item.id}style={styles.queueItem}>
          <Text style={[styles.itemType,{color}]}>
            {item.type.toUpperCase()}
          </Text>
          <Text style={[styles.itemDesc,{color:theme.colors.text.primary}]}>
            {item.description}
          </Text>
          {item.retryCount>0&&<Text style={[styles.retryBadge,{color:theme.colors.warning.DEFAULT}]}>
              Retry {item.retryCount}
            </Text>}
        </View>)}
    </View>;};const styles=createSheet({container:{position:'absolute',top:0,left:0,right:0,borderBottomWidth:2,zIndex:1000,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.1,shadowRadius:4,elevation:5},content:{paddingHorizontal:16,paddingBottom:12},statusBar:{flexDirection:'row',alignItems:'center',paddingVertical:8},indicator:{width:12,height:12,borderRadius:6,marginRight:10,justifyContent:'center',alignItems:'center'},pulseDot:{width:6,height:6,borderRadius:3,backgroundColor:'#fff'},statusText:{flex:1,fontSize:14,fontWeight:'600'},badge:{minWidth:22,height:22,borderRadius:11,justifyContent:'center',alignItems:'center',marginRight:8,paddingHorizontal:6},badgeText:{color:'#fff',fontSize:12,fontWeight:'700'},chevron:{fontSize:12},queueContainer:{marginTop:8,paddingTop:8,borderTopWidth:1,borderTopColor:'rgba(0,0,0,0.1)'},section:{marginBottom:12},sectionHeader:{flexDirection:'row',alignItems:'center',marginBottom:6},priorityDot:{width:8,height:8,borderRadius:4,marginRight:6},sectionTitle:{fontSize:12,fontWeight:'600',textTransform:'uppercase',letterSpacing:0.5},queueItem:{flexDirection:'row',alignItems:'center',paddingVertical:6,paddingLeft:14},itemType:{fontSize:10,fontWeight:'700',marginRight:8,minWidth:60},itemDesc:{flex:1,fontSize:13},retryBadge:{fontSize:10,fontWeight:'600'},syncButton:{marginTop:12,paddingVertical:12,borderRadius:8,alignItems:'center'},syncButtonText:{color:'#fff',fontSize:14,fontWeight:'700'},hint:{fontSize:11,textAlign:'center',marginTop:4}});export default SmartOfflineIndicator;
