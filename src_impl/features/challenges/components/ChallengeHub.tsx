import React,{useState,useCallback}from'react';import{View,Text,StyleSheet,ScrollView,Pressable,ActivityIndicator}from'react-native';import{FlashList,type ListRenderItem}from'@shopify/flash-list';import{useThemeObject}from'../../../theme';import{Card,Button,Badge,ProgressBar}from'../../../components';import{useActiveChallenges,useChallengeSummaries}from'../hooks';import{ChallengeCard}from'./ChallengeCard';import{type UserChallengeSummary}from'../schemas';import{createSheet}from'@/shared/ui/create-sheet';type ChallengeFilter='ALL'|'DAILY'|'WEEKLY'|'EVENT'|'COMPLETED';interface ChallengeHubProps{userId:string;onChallengePress?:(challengeId:string)=>void;onClaimReward?:(challengeId:string)=>void;}export const ChallengeHub:React.FC<ChallengeHubProps>=({userId,onChallengePress,onClaimReward})=>{const theme=useThemeObject();const[activeFilter,setActiveFilter]=useState<ChallengeFilter>('ALL');const[refreshing,setRefreshing]=useState(false);const{isLoading:isLoadingAll}=useActiveChallenges(userId);const{data:challengeSummaries,isLoading:isLoadingSummaries}=useChallengeSummaries(userId);const isLoading=isLoadingAll||isLoadingSummaries;const getFilteredChallenges=():UserChallengeSummary[]=>{if(!challengeSummaries){return[];}switch(activeFilter){case'DAILY':return challengeSummaries.filter((c:UserChallengeSummary)=>c.type==='DAILY');case'WEEKLY':return challengeSummaries.filter((c:UserChallengeSummary)=>c.type==='WEEKLY');case'EVENT':return challengeSummaries.filter((c:UserChallengeSummary)=>c.type==='EVENT');case'COMPLETED':return challengeSummaries.filter((c:UserChallengeSummary)=>c.status==='COMPLETED'||c.status==='CLAIMED');case'ALL':default:return challengeSummaries;}};const getChallengeStats=()=>{if(!challengeSummaries){return{total:0,completed:0,claimed:0,available:0};}const completed=challengeSummaries.filter((c:UserChallengeSummary)=>c.status==='COMPLETED').length;const claimed=challengeSummaries.filter((c:UserChallengeSummary)=>c.status==='CLAIMED').length;const available=challengeSummaries.filter((c:UserChallengeSummary)=>c.status==='ACTIVE').length;return{total:challengeSummaries.length,completed,claimed,available};};const stats=getChallengeStats();const filteredChallenges=getFilteredChallenges();const renderChallenge:ListRenderItem<UserChallengeSummary>=({item})=><Pressable onPress={()=>onChallengePress?.(item.challengeId)}style={({pressed})=>[pressed&&{opacity:0.9}]}accessibilityLabel="onClaimReward?.(item.challengeId)} /> button"accessibilityRole="button"accessibilityHint="Activates this control">
      <ChallengeCard challenge={item}onClaim={()=>onClaimReward?.(item.challengeId)}/>
    </Pressable>;if(isLoading){return<View style={[styles.container,{backgroundColor:theme.colors.background.primary}]}>
        <ActivityIndicator size="large"color={theme.colors.primary[500]}/>
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>;}return<ScrollView style={[styles.container,{backgroundColor:theme.colors.background.primary}]}contentContainerStyle={styles.content}>
      {}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Challenge Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.available}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.claimed}</Text>
            <Text style={styles.statLabel}>Claimed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(stats.completed/Math.max(1,stats.total)*100)}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>
        <ProgressBar progress={stats.total>0?(stats.completed+stats.claimed)/stats.total:0}style={styles.overallProgress}/>
      </Card>

      {}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}style={styles.filterContainer}contentContainerStyle={styles.filterContent}>
        {(['ALL','DAILY','WEEKLY','EVENT','COMPLETED']as ChallengeFilter[]).map(filter=><Pressable key={filter}style={({pressed})=>[styles.filterTab,activeFilter===filter&&styles.filterTabActive,pressed&&{opacity:0.7}]}onPress={()=>setActiveFilter(filter)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={[styles.filterText,activeFilter===filter&&styles.filterTextActive]}>{filter}</Text>
          </Pressable>)}
      </ScrollView>

      {}
      {(activeFilter==='ALL'||activeFilter==='DAILY')&&<Card style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>🔥 Daily Streak</Text>
            <Badge variant="warning">3 Days</Badge>
          </View>
          <Text style={styles.streakDescription}>Complete daily challenges to maintain your streak and earn bonus rewards!</Text>
          <View style={styles.streakDays}>
            {['M','T','W','T','F','S','S'].map((day,index)=><View key={index}style={[styles.streakDay,index<3&&styles.streakDayCompleted]}>
                <Text style={[styles.streakDayText,index<3&&styles.streakDayTextCompleted]}>{day}</Text>
              </View>)}
          </View>
        </Card>}

      {}
      <View style={styles.listSection}>
        <Text style={styles.listTitle}>{activeFilter==='ALL'?'All Challenges':`${activeFilter} Challenges`}</Text>

        {filteredChallenges.length===0?<Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No challenges found</Text>
            <Text style={styles.emptyText}>{activeFilter==='COMPLETED'?'Complete some challenges to see them here!':'Check back later for new challenges.'}</Text>
          </Card>:<FlashList<UserChallengeSummary>data={filteredChallenges}renderItem={renderChallenge}keyExtractor={(item:UserChallengeSummary)=>item.challengeId}estimatedItemSize={168}scrollEnabled={false}/>}
      </View>
    </ScrollView>;};const styles=createSheet({container:{flex:1},content:{padding:16},loadingText:{textAlign:'center',marginTop:12,fontSize:14,color:'#666'},statsCard:{padding:16,marginBottom:12},statsTitle:{fontSize:16,fontWeight:'600',marginBottom:12},statsGrid:{flexDirection:'row',justifyContent:'space-around',marginBottom:12},statItem:{alignItems:'center'},statValue:{fontSize:20,fontWeight:'bold',color:'#007AFF'},statLabel:{fontSize:12,color:'#666',marginTop:2},overallProgress:{marginTop:8},filterContainer:{marginBottom:12},filterContent:{gap:8,paddingHorizontal:4},filterTab:{paddingHorizontal:16,paddingVertical:8,borderRadius:20,backgroundColor:'#F0F0F0'},filterTabActive:{backgroundColor:'#007AFF'},filterText:{fontSize:13,fontWeight:'500',color:'#666'},filterTextActive:{color:'#fff'},streakCard:{padding:16,marginBottom:12,backgroundColor:'#FFF8E7'},streakHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},streakTitle:{fontSize:16,fontWeight:'600'},streakDescription:{fontSize:13,color:'#666',marginBottom:12},streakDays:{flexDirection:'row',gap:8},streakDay:{width:36,height:36,borderRadius:18,backgroundColor:'#E0E0E0',justifyContent:'center',alignItems:'center'},streakDayCompleted:{backgroundColor:'#FF9500'},streakDayText:{fontSize:12,fontWeight:'600',color:'#666'},streakDayTextCompleted:{color:'#fff'},listSection:{marginTop:8},listTitle:{fontSize:18,fontWeight:'600',marginBottom:12},emptyCard:{padding:32,alignItems:'center'},emptyIcon:{fontSize:48,marginBottom:12},emptyTitle:{fontSize:16,fontWeight:'600',marginBottom:4},emptyText:{fontSize:14,color:'#666',textAlign:'center'}});
