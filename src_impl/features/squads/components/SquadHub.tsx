import React,{useState,useCallback}from'react'; import{View,Text,ScrollView,Pressable,Image,ActivityIndicator}from'react-native'; import{FlashList}from'@shopify/flash-list'; import{useThemeObject}from'../../../theme'; import{Card,Button,Avatar,Badge}from'../../../components'; import{useSquad,useSquadMembers,useSquadPermissions,useStartSquadSession}from'../hooks'; import{type SquadMemberDetail}from'../schemas'; import{createSheet}from'@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
 interface SquadHubProps{squadId:string;userId:string;onInvitePress?:()=>void;onSettingsPress?:()=>void;onMemberPress?:(member:SquadMemberDetail)=>void;}export const SquadHub:React.FC<SquadHubProps> = ({squadId,userId,onInvitePress,onSettingsPress,onMemberPress})=>{const theme = useThemeObject(); const{data:squad,isLoading:squadLoading,error:squadError} = useSquad(squadId); const{data:members,isLoading:membersLoading} = useSquadMembers(squadId); const{hasPermission} = useSquadPermissions(squadId,userId); const startSession = useStartSquadSession(userId,squadId); const[isStartingSession,setIsStartingSession] = useState(false); const handleStartSession = useCallback(async()=>{setIsStartingSession(true); try{await startSession.mutateAsync({name:'Squad Focus',description:null,duration:1500,category:'focus',maxParticipants:10});}finally{setIsStartingSession(false);}},[startSession]); if(squadLoading || membersLoading){return<View style={[styles.container,{backgroundColor:theme.colors.background.primary}]}>
        <ActivityIndicator size="large"color={theme.colors.primary[500]}/>
      </View>;}if(squadError || !squad){return<View style={[styles.container,{backgroundColor:theme.colors.background.primary}]}>
        <Text style={[styles.errorText,{color:theme.colors.error.DEFAULT}]}>Failed to load squad</Text>
      </View>;}const activeMembers = members?.filter(m=>m.isActive) || []; const onlineMembers = activeMembers.filter(m=>m.isOnline); return<ScrollView style={[styles.container,{backgroundColor:theme.colors.background.primary}]}contentContainerStyle={styles.content}>
      {}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          {squad.avatarUrl ? <Image source={{uri:squad.avatarUrl}}resizeMode="cover"style={styles.avatar}/> : <View style={[styles.avatarPlaceholder,{backgroundColor:theme.colors.primary[500]}]}>
              <Text style={styles.avatarText}>{squad.name.charAt(0).toUpperCase()}</Text>
            </View>}
          <View style={styles.headerInfo}>
            <Text style={[styles.squadName,{color:theme.colors.text.primary}]}>{squad.name}</Text>
            <View style={styles.badgeRow}>
              <Badge variant="default"size="sm">{`${activeMembers.length}/${squad.maxMembers} members`}</Badge>
              <Badge variant="success"size="sm">{`${Math.round(squad.focusMultiplier * 100)}% boost`}</Badge>
            </View>
          </View>
        </View>
        {squad.description && <Text style={[styles.description,{color:theme.colors.text.secondary}]}>{squad.description}</Text>}
      </Card>

      {}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle,{color:theme.colors.text.primary}]}>Squad Synergy</Text>
          <Badge variant="primary"size="md">{`Level ${squad.synergyLevel}`}</Badge>
        </View>
        <View style={[styles.progressBar,{backgroundColor:theme.colors.background.secondary,height:8,borderRadius:4}]}>
          <View style={{width:`${squad.synergyLevel % 10 * 10}%`,backgroundColor:theme.colors.primary[500],height:'100%',borderRadius:4}}/>
        </View>
        <Text style={[styles.progressText,{color:theme.colors.text.secondary}]}>{squad.synergyLevel * 100} points to next level</Text>
        {squad.focusMultiplier > 1 && <Text style={[styles.bonusText,{color:theme.colors.success.DEFAULT}]}>+{Math.round((squad.focusMultiplier - 1) * 100)}% bonus multiplier active</Text>}
      </Card>

      {}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle,{color:theme.colors.text.primary}]}>Actions</Text>
        <View style={styles.actionRow}>
          <Button onPress={handleStartSession}isDisabled={isStartingSession}style={styles.actionButton}variant="primary"accessibilityLabel="Action button"accessibilityRole="button"accessibilityHint="Activates this control">
            {isStartingSession ? 'Starting...' : 'Start Squad Session'}
          </Button>
          {hasPermission('INVITE_MEMBERS') && <Button variant="secondary"onPress={onInvitePress}style={styles.actionButton}accessibilityLabel="Invite Member button"accessibilityRole="button"accessibilityHint="Activates this control">
              Invite Member
            </Button>}
          {hasPermission('EDIT_SQUAD') && <Button variant="ghost"onPress={onSettingsPress}style={styles.actionButton}accessibilityLabel="Settings button"accessibilityRole="button"accessibilityHint="Activates this control">
              Settings
            </Button>}
        </View>
      </Card>

      {}
      {onlineMembers.length > 0 && <Card style={styles.card}>
          <Text style={[styles.sectionTitle,{color:theme.colors.text.primary}]}>Online ({onlineMembers.length})</Text>
          <FlashList data={onlineMembers}horizontal keyExtractor={(item:SquadMemberDetail)=>item.userId}renderItem={({item}:{item:SquadMemberDetail;})=><Pressable style={({pressed})=>[styles.onlineMemberItem,pressed && {opacity:0.7}]}onPress={()=>onMemberPress?.(item)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                <Avatar size="xs"source={item.avatarUrl ? {uri:item.avatarUrl} : undefined}name={item.displayName}/>
                <View style={styles.onlineIndicator}/>
                <Text style={[styles.memberName,{color:theme.colors.text.primary}]}numberOfLines={1}>
                  {item.displayName}
                </Text>
              </Pressable>}showsHorizontalScrollIndicator={false}contentContainerStyle={styles.onlineMembersList}/>
        </Card>}

      {}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle,{color:theme.colors.text.primary}]}>Members</Text>
          <Text style={[styles.memberCount,{color:theme.colors.text.secondary}]}>{activeMembers.length} active</Text>
        </View>
        {activeMembers.map((member,_index)=><React.Fragment key={member.userId}>
            <Pressable style={({pressed})=>[styles.memberRow,pressed && {opacity:0.7}]}onPress={()=>onMemberPress?.(member)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
              <Avatar size="xs"source={member.avatarUrl ? {uri:member.avatarUrl} : undefined}name={member.displayName}/>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName,{color:theme.colors.text.primary}]}>{member.displayName}</Text>
                <Text style={[styles.memberRole,{color:theme.colors.text.secondary}]}>
                  {member.role} {member.isOnline && '• Online'}
                </Text>
              </View>
              <Badge variant="default"size="sm">
                {`${member.contributionScore} pts`}
              </Badge>
            </Pressable>
          </React.Fragment>)}
      </Card>

      {}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle,{color:theme.colors.text.primary}]}>Squad Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue,{color:theme.colors.text.primary}]}>{Math.round(squad.totalFocusTime / 3600)}h</Text>
            <Text style={[styles.statLabel,{color:theme.colors.text.secondary}]}>Total Focus</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue,{color:theme.colors.text.primary}]}>{squad.focusMultiplier.toFixed(2)}x</Text>
            <Text style={[styles.statLabel,{color:theme.colors.text.secondary}]}>Multiplier</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue,{color:theme.colors.text.primary}]}>{squad.synergyLevel}</Text>
            <Text style={[styles.statLabel,{color:theme.colors.text.secondary}]}>Synergy Level</Text>
          </View>
        </View>
      </Card>
    </ScrollView>;}; const styles = createSheet({container:{flex:1},content:{padding:16,gap:16},headerCard:{padding:16},headerRow:{flexDirection:'row',alignItems:'center',gap:12},avatar:{width:64,height:64,borderRadius:32},avatarPlaceholder:{width:64,height:64,borderRadius:32,justifyContent:'center',alignItems:'center'},avatarText:{fontSize:24,fontWeight:'bold',color:launchColors.hex_fff},headerInfo:{flex:1,gap:4},squadName:{fontSize:20,fontWeight:'bold'},badgeRow:{flexDirection:'row',gap:8},description:{marginTop:12,fontSize:14,lineHeight:20},card:{padding:16},sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},sectionTitle:{fontSize:16,fontWeight:'600'},memberCount:{fontSize:14},progressBar:{marginVertical:8},progressText:{fontSize:12,textAlign:'center'},bonusText:{fontSize:12,textAlign:'center',marginTop:4},actionRow:{flexDirection:'row',flexWrap:'wrap',gap:8},actionButton:{flex:1,minWidth:120},onlineMembersList:{paddingVertical:8,gap:16},onlineMemberItem:{alignItems:'center',position:'relative'},onlineIndicator:{position:'absolute',bottom:16,right:-2,width:12,height:12,borderRadius:6,backgroundColor:launchColors.hex_4caf50,borderWidth:2,borderColor:launchColors.hex_fff},memberRow:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:8},memberInfo:{flex:1},memberName:{fontSize:14,fontWeight:'500'},memberRole:{fontSize:12},memberDivider:{marginVertical:4},statsGrid:{flexDirection:'row',justifyContent:'space-around',marginTop:12},statItem:{alignItems:'center'},statValue:{fontSize:24,fontWeight:'bold'},statLabel:{fontSize:12,marginTop:4},errorText:{textAlign:'center',fontSize:16,marginTop:24}});
