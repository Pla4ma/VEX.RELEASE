import React,{useState}from'react';import{View,Text,Pressable,ScrollView,TextInput}from'react-native';import Animated,{useAnimatedStyle,useSharedValue,withSpring}from'react-native-reanimated';import type{SessionSummary as SessionSummaryType}from'../types';import{createSheet}from'@/shared/ui/create-sheet';interface SessionSummaryProps{summary:SessionSummaryType;onClose:()=>void;onShare?:()=>void;onStartNew?:()=>void;}export const SessionSummary:React.FC<SessionSummaryProps>=({summary,onClose,onShare,onStartNew})=>{const[reflection,setReflection]=useState('');const[mood,setMood]=useState<'GREAT'|'GOOD'|'NEUTRAL'|'BAD'|'TERRIBLE'|null>(null);const scaleAnim=useSharedValue(0);React.useEffect(()=>{scaleAnim.value=withSpring(1,{damping:12,stiffness:120});},[scaleAnim]);const scaleStyle=useAnimatedStyle(()=>({transform:[{scale:scaleAnim.value}]}));const formatDuration=(seconds:number):string=>{const hours=Math.floor(seconds/3600);const mins=Math.floor(seconds%3600/60);if(hours>0){return`${hours}h ${mins}m`;}return`${mins}m`;};const getMoodEmoji=(m:typeof mood)=>{switch(m){case'GREAT':return'🤩';case'GOOD':return'😊';case'NEUTRAL':return'😐';case'BAD':return'😕';case'TERRIBLE':return'😫';default:return'🤔';}};const getGrade=(score:number):{letter:string;color:string;}=>{if(score>=900){return{letter:'S',color:'#FFD700'};}if(score>=800){return{letter:'A',color:'#4CAF50'};}if(score>=700){return{letter:'B',color:'#8BC34A'};}if(score>=600){return{letter:'C',color:'#FFC107'};}if(score>=500){return{letter:'D',color:'#FF9800'};}return{letter:'F',color:'#f44336'};};const grade=getGrade(summary.finalScore);return<ScrollView style={styles.container}>
      <Animated.View style={[styles.content,scaleStyle]}>
        {}
        <View style={styles.header}>
          <Text style={styles.title}>Session Complete! 🎉</Text>
          <Text style={styles.subtitle}>
            {summary.status==='COMPLETED'?'Great job staying focused!':'Session ended'}
          </Text>
        </View>

        {}
        <View style={[styles.scoreCircle,{borderColor:grade.color}]}>
          <Text style={[styles.scoreLetter,{color:grade.color}]}>{grade.letter}</Text>
          <Text style={styles.scoreNumber}>{summary.finalScore}</Text>
          <Text style={styles.scoreLabel}>points</Text>
        </View>

        {}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDuration(summary.effectiveDuration)}</Text>
            <Text style={styles.statLabel}>Focused Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.interruptions}</Text>
            <Text style={styles.statLabel}>Interruptions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(summary.focusQuality)}%</Text>
            <Text style={styles.statLabel}>Focus Quality</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(summary.completionPercentage)}%</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {}
        {(summary.xpEarned>0||summary.coinsEarned>0||summary.gemsEarned>0)&&<View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>Rewards Earned</Text>
            <View style={styles.rewardsRow}>
              {summary.xpEarned>0&&<View style={styles.rewardBadge}>
                  <Text style={styles.rewardIcon}>⭐</Text>
                  <Text style={styles.rewardValue}>+{summary.xpEarned}</Text>
                  <Text style={styles.rewardLabel}>XP</Text>
                </View>}
              {summary.coinsEarned>0&&<View style={styles.rewardBadge}>
                  <Text style={styles.rewardIcon}>🪙</Text>
                  <Text style={styles.rewardValue}>+{summary.coinsEarned}</Text>
                  <Text style={styles.rewardLabel}>Coins</Text>
                </View>}
              {summary.gemsEarned>0&&<View style={styles.rewardBadge}>
                  <Text style={styles.rewardIcon}>💎</Text>
                  <Text style={styles.rewardValue}>+{summary.gemsEarned}</Text>
                  <Text style={styles.rewardLabel}>Gems</Text>
                </View>}
            </View>
          </View>}

        {}
        {summary.streakMaintained&&<View style={styles.streakBanner}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>
              {summary.streakDays} Day Streak!
            </Text>
            {summary.streakIncreased&&<Text style={styles.streakBonus}>+1 day</Text>}
          </View>}

        {}
        {summary.bonuses&&summary.bonuses.length>0&&<View style={styles.bonusesSection}>
            <Text style={styles.sectionTitle}>Bonus Awards</Text>
            {summary.bonuses.map((bonus,index)=><View key={index}style={styles.bonusItem}>
                <Text style={styles.bonusIcon}>🏆</Text>
                <View style={styles.bonusInfo}>
                  <Text style={styles.bonusType}>{bonus.type}</Text>
                  <Text style={styles.bonusDescription}>{bonus.description}</Text>
                </View>
                <Text style={styles.bonusAmount}>+{bonus.amount}</Text>
              </View>)}
          </View>}

        {}
        <View style={styles.reflectionSection}>
          <Text style={styles.sectionTitle}>How was your session?</Text>
          <View style={styles.moodSelector}>
            {(['GREAT','GOOD','NEUTRAL','BAD','TERRIBLE']as const).map(m=><Pressable key={m}style={({pressed})=>[styles.moodButton,mood===m&&styles.moodButtonActive,pressed&&{opacity:0.8}]}onPress={()=>setMood(m)}accessibilityLabel={`Mood ${getMoodEmoji(m)} button`}accessibilityRole="button"accessibilityHint="Activates this control">
                <Text style={styles.moodEmoji}>{getMoodEmoji(m)}</Text>
              </Pressable>)}
          </View>
          <TextInput style={styles.reflectionInput}multiline numberOfLines={3}placeholder="What did you accomplish? Any distractions?"placeholderTextColor="#666"value={reflection}onChangeText={setReflection}/>
        </View>

        {}
        <View style={styles.actions}>
          <Pressable style={({pressed})=>[styles.shareButton,pressed&&{opacity:0.8}]}onPress={onShare}accessibilityLabel="📤 Share button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={styles.shareButtonText}>📤 Share</Text>
          </Pressable>
          <Pressable style={({pressed})=>[styles.newSessionButton,pressed&&{opacity:0.8}]}onPress={onStartNew}accessibilityLabel="▶ New Session button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={styles.newSessionButtonText}>▶ New Session</Text>
          </Pressable>
          <Pressable style={({pressed})=>[styles.closeButton,pressed&&{opacity:0.8}]}onPress={onClose}accessibilityLabel="Close button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>;};const styles=createSheet({container:{flex:1,backgroundColor:'#1a1a2e'},content:{padding:24},header:{alignItems:'center',marginBottom:24},title:{fontSize:28,fontWeight:'700',color:'#fff',marginBottom:8},subtitle:{fontSize:16,color:'#9E9E9E'},scoreCircle:{width:160,height:160,borderRadius:80,borderWidth:8,alignSelf:'center',justifyContent:'center',alignItems:'center',marginBottom:32},scoreLetter:{fontSize:48,fontWeight:'700'},scoreNumber:{fontSize:32,fontWeight:'700',color:'#fff'},scoreLabel:{fontSize:14,color:'#9E9E9E'},statsGrid:{flexDirection:'row',flexWrap:'wrap',gap:12,marginBottom:24},statCard:{width:'48%',backgroundColor:'#2a2a3e',borderRadius:12,padding:16,alignItems:'center'},statValue:{fontSize:20,fontWeight:'700',color:'#e94560',marginBottom:4},statLabel:{fontSize:12,color:'#9E9E9E'},rewardsSection:{marginBottom:24},sectionTitle:{fontSize:18,fontWeight:'600',color:'#fff',marginBottom:12},rewardsRow:{flexDirection:'row',gap:12},rewardBadge:{flex:1,backgroundColor:'#2a2a3e',borderRadius:12,padding:16,alignItems:'center'},rewardIcon:{fontSize:24,marginBottom:4},rewardValue:{fontSize:20,fontWeight:'700',color:'#FFD700'},rewardLabel:{fontSize:12,color:'#9E9E9E'},streakBanner:{flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'#FF6B35',borderRadius:12,padding:16,marginBottom:24},streakEmoji:{fontSize:24,marginRight:8},streakText:{fontSize:18,fontWeight:'700',color:'#fff'},streakBonus:{marginLeft:8,paddingHorizontal:8,paddingVertical:4,backgroundColor:'rgba(255,255,255,0.3)',borderRadius:4,color:'#fff',fontSize:12,fontWeight:'600'},bonusesSection:{marginBottom:24},bonusItem:{flexDirection:'row',alignItems:'center',backgroundColor:'#2a2a3e',borderRadius:8,padding:12,marginBottom:8},bonusIcon:{fontSize:20,marginRight:12},bonusInfo:{flex:1},bonusType:{fontSize:14,fontWeight:'600',color:'#fff',textTransform:'capitalize'},bonusDescription:{fontSize:12,color:'#9E9E9E'},bonusAmount:{fontSize:16,fontWeight:'700',color:'#4CAF50'},reflectionSection:{marginBottom:24},moodSelector:{flexDirection:'row',justifyContent:'space-between',marginBottom:12},moodButton:{padding:12,backgroundColor:'#2a2a3e',borderRadius:8},moodButtonActive:{backgroundColor:'#e94560'},moodEmoji:{fontSize:24},reflectionInput:{backgroundColor:'#2a2a3e',borderRadius:12,padding:16,color:'#fff',fontSize:16,minHeight:100,textAlignVertical:'top'},actions:{gap:12},shareButton:{paddingVertical:14,borderRadius:8,backgroundColor:'#2a2a3e',alignItems:'center'},shareButtonText:{color:'#fff',fontSize:16,fontWeight:'600'},newSessionButton:{paddingVertical:16,borderRadius:8,backgroundColor:'#4CAF50',alignItems:'center'},newSessionButtonText:{color:'#fff',fontSize:16,fontWeight:'700'},closeButton:{paddingVertical:14,borderRadius:8,alignItems:'center'},closeButtonText:{color:'#9E9E9E',fontSize:16}});export default SessionSummary;
