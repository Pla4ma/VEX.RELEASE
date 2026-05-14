import React,{useState,useCallback}from'react'; import{View,Text,ScrollView,Pressable,TextInput,ActivityIndicator}from'react-native'; import{FlashList}from'@shopify/flash-list'; import Animated,{runOnJS,useAnimatedStyle,useSharedValue,withSequence,withTiming}from'react-native-reanimated'; import{Card,Button,Avatar}from'../../../components'; import{useSquad,useInviteToSquad,useSquadPermissions}from'../hooks'; import{SquadRole}from'../schemas'; import{createSheet}from'@/shared/ui/create-sheet'; type InviteStep='SEARCH'|'CONFIGURE'|'REVIEW'|'SUCCESS';interface UserSearchResult{id:string;displayName:string;avatarUrl:string|null;level:number}interface SquadInviteFlowProps{squadId:string;userId:string;searchUsers:(query:string)=>Promise<UserSearchResult[]>;onComplete?:()=>void;onCancel?:()=>void}const ROLE_OPTIONS:{value:SquadRole;label:string;description:string}[] = [{value:'MEMBER',label:'Member',description:'Can participate in sessions and chat'},{value:'MODERATOR',label:'Moderator',description:'Can kick members and moderate chat'},{value:'ADMIN',label:'Admin',description:'Can manage squad settings and invites'}]; export const SquadInviteFlow:React.FC<SquadInviteFlowProps> = ({squadId,userId,searchUsers,onComplete,onCancel})=>{const{data:squad} = useSquad(squadId); const{hasPermission} = useSquadPermissions(squadId,userId); const inviteMutation = useInviteToSquad(userId); const[step,setStep] = useState<InviteStep>('SEARCH'); const[selectedUsers,setSelectedUsers] = useState<UserSearchResult[]>([]); const[searchQuery,setSearchQuery] = useState(''); const[selectedRole,setSelectedRole] = useState<SquadRole>('MEMBER'); const[message,setMessage] = useState(''); const[isSearching,setIsSearching] = useState(false); const[searchResults,setSearchResults] = useState<UserSearchResult[]>([]); const[sentCount,setSentCount] = useState(0); const[error,setError] = useState<string|null>(null); const fadeAnim = useSharedValue(1); const animatedStyle = useAnimatedStyle(()=>({opacity:fadeAnim.value})); const animateTransition = useCallback((nextStep:InviteStep)=>{fadeAnim.value = withSequence(withTiming(0,{duration:150},()=>{runOnJS(setStep)(nextStep);}),withTiming(1,{duration:150}));},[fadeAnim]); const handleSearch = useCallback(async()=>{if(!searchQuery.trim()){return;}setIsSearching(true); setError(null); try{const results = await searchUsers(searchQuery); const selectedIds = selectedUsers.map(u=>u.id); const filtered = results.filter(u=>!selectedIds.includes(u.id)); setSearchResults(filtered);}catch(err){setError(err instanceof Error ? err.message : 'Failed to search users'); setSearchResults([]);}finally{setIsSearching(false);}},[searchQuery,searchUsers,selectedUsers]); const toggleUserSelection = useCallback((user:UserSearchResult)=>{setSelectedUsers(prev=>prev.find(u=>u.id === user.id) ? prev.filter(u=>u.id !== user.id) : [...prev,user]); setSearchResults(prev=>prev.filter(u=>u.id !== user.id));},[]); const removeSelectedUser = useCallback((userId:string)=>{setSelectedUsers(prev=>prev.filter(u=>u.id !== userId));},[]); const handleSendInvites = useCallback(async()=>{setError(null); try{let sent = 0; for(const targetUser of selectedUsers){await inviteMutation.mutateAsync({squadId,invitedUserId:targetUser.id,roleOffered:selectedRole,message:message || null,expiresInHours:48}); sent++;}setSentCount(sent); animateTransition('SUCCESS');}catch(err){setError(err instanceof Error ? err.message : 'Failed to send invites');}},[selectedUsers,squadId,selectedRole,message,inviteMutation,animateTransition]); const handleNext = useCallback(()=>{switch(step){case'SEARCH':if(selectedUsers.length > 0){animateTransition('CONFIGURE');}break; case'CONFIGURE':animateTransition('REVIEW'); break; case'REVIEW':void handleSendInvites(); break; case'SUCCESS':onComplete?.(); break;}},[step,selectedUsers.length,animateTransition,onComplete,handleSendInvites]); const handleBack = useCallback(()=>{switch(step){case'CONFIGURE':animateTransition('SEARCH'); break; case'REVIEW':animateTransition('CONFIGURE'); break; default:onCancel?.();}},[step,animateTransition,onCancel]); if(!hasPermission('INVITE_MEMBERS')){return<Card style={styles.container}>
        <View style={styles.permissionDenied}>
          <Text style={styles.permissionIcon}>🚫</Text>
          <Text style={styles.permissionTitle}>Cannot Send Invites</Text>
          <Text style={styles.permissionText}>
            You don't have permission to invite members to this squad.
          </Text>
          <Button onPress={onCancel}variant="secondary"style={styles.permissionButton}
  accessibilityLabel="Go Back button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            Go Back
          </Button>
        </View>
      </Card>;}const renderStepIndicator = ()=><View style={styles.stepIndicator}>
      {['Search','Configure','Review','Done'].map((label,index)=>{const stepIndex = ['SEARCH','CONFIGURE','REVIEW','SUCCESS'].indexOf(step); const isActive = index === stepIndex; const isCompleted = index < stepIndex; return<View key={label}style={styles.stepItem}>
            <View style={[styles.stepDot,isActive && styles.stepDotActive,isCompleted && styles.stepDotCompleted]}>
              {isCompleted ? <Text style={styles.stepCheck}>✓</Text> : <Text style={[styles.stepNumber,isActive && styles.stepNumberActive]}>{index + 1}</Text>}
            </View>
            <Text style={[styles.stepLabel,isActive && styles.stepLabelActive]}>{label}</Text>
            {index < 3 && <View style={[styles.stepLine,isCompleted && styles.stepLineCompleted]}/>}
          </View>;})}
    </View>; const renderSearchStep = ()=><View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Find Users to Invite</Text>

      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput}placeholder="Search by name..."value={searchQuery}onChangeText={setSearchQuery}onSubmitEditing={handleSearch}returnKeyType="search"/>
        <Button onPress={handleSearch}isLoading={isSearching}isDisabled={!searchQuery.trim()}size="sm"
  accessibilityLabel="Search button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          Search
        </Button>
      </View>

      {isSearching ? <ActivityIndicator style={styles.searchLoading}/> : searchResults.length > 0 ? <FlashList data={searchResults}estimatedItemSize={64}keyExtractor={(item:UserSearchResult)=>item.id}renderItem={({item}:{item:UserSearchResult})=><Pressable style={({pressed})=>[styles.userItem,pressed && {opacity:0.7}]}onPress={()=>toggleUserSelection(item)}
  accessibilityLabel="Level + button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              <Avatar name={item.displayName}size="md"/>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.displayName}</Text>
                <Text style={styles.userMeta}>Level {item.level}</Text>
              </View>
              <View style={styles.checkbox}>
                <Text style={styles.checkmark}>+</Text>
              </View>
            </Pressable>}style={styles.userList}/> : searchQuery && !isSearching ? <View style={styles.emptySearch}>
          <Text style={styles.emptySearchText}>No users found</Text>
        </View> : null}

      {selectedUsers.length > 0 && <View style={styles.selectionPreview}>
          <Text style={styles.selectionText}>
            {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
          </Text>
        </View>}

      {error && <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>}
    </View>; const renderConfigureStep = ()=><View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Configure Invites</Text>

      <View style={styles.selectedUsersPreview}>
        <Text style={styles.sectionLabel}>Selected Users ({selectedUsers.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}style={styles.selectedUsersList}>
          {selectedUsers.map(user=><View key={user.id}style={styles.selectedUserChip}>
              <Avatar name={user.displayName}size="sm"/>
              <Text style={styles.selectedUserName}numberOfLines={1}>
                {user.displayName}
              </Text>
              <Pressable onPress={()=>removeSelectedUser(user.id)}
  accessibilityLabel="× button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                <Text style={styles.removeUser}>×</Text>
              </Pressable>
            </View>)}
        </ScrollView>
      </View>

      <Text style={styles.sectionLabel}>Select Role</Text>
      {ROLE_OPTIONS.map(role=><Pressable key={role.value}style={({pressed})=>[styles.roleOption,selectedRole === role.value && styles.roleOptionSelected,pressed && {opacity:0.7}]}onPress={()=>setSelectedRole(role.value)}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          <View style={styles.roleRadio}>
            {selectedRole === role.value && <View style={styles.roleRadioSelected}/>}
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleLabel}>{role.label}</Text>
            <Text style={styles.roleDescription}>{role.description}</Text>
          </View>
        </Pressable>)}

      <Text style={styles.sectionLabel}>Message (Optional)</Text>
      <TextInput style={styles.messageInput}placeholder="Add a personal message..."value={message}onChangeText={setMessage}multiline maxLength={200}/>
      <Text style={styles.messageCharCount}>{message.length}/200</Text>
    </View>; const renderReviewStep = ()=><View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review and Send</Text>

      <Card style={styles.reviewCard}>
        <Text style={styles.reviewLabel}>Squad</Text>
        <Text style={styles.reviewValue}>{squad?.name}</Text>

        <Text style={styles.reviewLabel}>Recipients</Text>
        <Text style={styles.reviewValue}>{selectedUsers.length} users</Text>

        <Text style={styles.reviewLabel}>Role Offered</Text>
        <Text style={styles.reviewValue}>{ROLE_OPTIONS.find(r=>r.value === selectedRole)?.label}</Text>

        {message && <>
            <Text style={styles.reviewLabel}>Message</Text>
            <Text style={styles.reviewMessage}>{message}</Text>
          </>}
      </Card>

      <Text style={styles.reviewNote}>
        Invites will expire in 48 hours if not accepted.
      </Text>
    </View>; const renderSuccessStep = ()=><View style={styles.stepContent}>
      <View style={styles.successContainer}>
        <View style={styles.successIconContainer}>
          <Text style={styles.successIcon}>🎉</Text>
        </View>
        <Text style={styles.successTitle}>Invites Sent!</Text>
        <Text style={styles.successText}>
          Successfully sent {sentCount} invitation{sentCount !== 1 ? 's' : ''}.
        </Text>
        <Text style={styles.successSubtext}>
          You'll be notified when they accept or decline.
        </Text>
      </View>
    </View>; return<Card style={styles.container}>
      {renderStepIndicator()}

      <Animated.View style={[styles.content,animatedStyle]}>
        {step === 'SEARCH' && renderSearchStep()}
        {step === 'CONFIGURE' && renderConfigureStep()}
        {step === 'REVIEW' && renderReviewStep()}
        {step === 'SUCCESS' && renderSuccessStep()}
      </Animated.View>

      <View style={styles.footer}>
        {step !== 'SUCCESS' && <Button onPress={handleBack}variant="secondary"isDisabled={inviteMutation.isPending}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            {step === 'SEARCH' ? 'Cancel' : 'Back'}
          </Button>}

        <Button onPress={handleNext}isLoading={inviteMutation.isPending}isDisabled={step === 'SEARCH' && selectedUsers.length === 0 || inviteMutation.isPending || !!error}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          {step === 'REVIEW' ? 'Send Invites' : step === 'SUCCESS' ? 'Done' : 'Next'}
        </Button>
      </View>
    </Card>;}; const styles = createSheet({container:{padding:20,maxHeight:'80%'},content:{flex:1},stepIndicator:{flexDirection:'row',justifyContent:'space-between',marginBottom:24,paddingHorizontal:8},stepItem:{alignItems:'center',flex:1,position:'relative'},stepDot:{width:28,height:28,borderRadius:14,backgroundColor:'#E0E0E0',justifyContent:'center',alignItems:'center'},stepDotActive:{backgroundColor:'#007AFF'},stepDotCompleted:{backgroundColor:'#4CAF50'},stepNumber:{fontSize:12,fontWeight:'600',color:'#666'},stepNumberActive:{color:'#fff'},stepCheck:{fontSize:14,color:'#fff',fontWeight:'bold'},stepLabel:{fontSize:10,marginTop:4,color:'#999'},stepLabelActive:{color:'#007AFF',fontWeight:'600'},stepLine:{position:'absolute',top:14,right:'50%',left:'50%',height:2,backgroundColor:'#E0E0E0',zIndex:-1},stepLineCompleted:{backgroundColor:'#4CAF50'},stepContent:{flex:1},stepTitle:{fontSize:20,fontWeight:'600',marginBottom:16},searchContainer:{flexDirection:'row',gap:8,marginBottom:16},searchInput:{flex:1,borderWidth:1,borderColor:'#E0E0E0',borderRadius:8,padding:12,fontSize:14},searchLoading:{marginTop:32},userList:{maxHeight:200},userItem:{flexDirection:'row',alignItems:'center',padding:12,backgroundColor:'#F5F5F5',borderRadius:8,marginBottom:8},userItemSelected:{backgroundColor:'#E3F2FD',borderWidth:2,borderColor:'#2196F3'},userInfo:{flex:1,marginLeft:12},userName:{fontSize:14,fontWeight:'500'},userMeta:{fontSize:12,color:'#666',marginTop:2},checkbox:{width:24,height:24,borderRadius:12,borderWidth:2,borderColor:'#CCC',justifyContent:'center',alignItems:'center'},checkboxChecked:{backgroundColor:'#2196F3',borderColor:'#2196F3'},checkmark:{color:'#fff',fontSize:14,fontWeight:'bold'},emptySearch:{alignItems:'center',padding:32},emptySearchText:{fontSize:14,color:'#666'},selectionPreview:{backgroundColor:'#E3F2FD',padding:12,borderRadius:8,marginTop:8},selectionText:{fontSize:14,fontWeight:'500',color:'#1976D2'},errorContainer:{backgroundColor:'#FFEBEE',padding:12,borderRadius:8,marginTop:8},errorText:{color:'#C62828',fontSize:14},selectedUsersPreview:{marginBottom:16},sectionLabel:{fontSize:12,fontWeight:'600',color:'#666',marginBottom:8,textTransform:'uppercase'},selectedUsersList:{flexDirection:'row'},selectedUserChip:{flexDirection:'row',alignItems:'center',backgroundColor:'#F5F5F5',padding:8,borderRadius:20,marginRight:8,gap:6},selectedUserName:{fontSize:12,maxWidth:100},removeUser:{fontSize:18,color:'#666',marginLeft:4},roleOption:{flexDirection:'row',alignItems:'center',padding:16,backgroundColor:'#F5F5F5',borderRadius:8,marginBottom:8},roleOptionSelected:{backgroundColor:'#E3F2FD',borderWidth:2,borderColor:'#2196F3'},roleRadio:{width:20,height:20,borderRadius:10,borderWidth:2,borderColor:'#999',justifyContent:'center',alignItems:'center',marginRight:12},roleRadioSelected:{width:10,height:10,borderRadius:5,backgroundColor:'#2196F3'},roleInfo:{flex:1},roleLabel:{fontSize:14,fontWeight:'500'},roleDescription:{fontSize:12,color:'#666',marginTop:2},messageInput:{borderWidth:1,borderColor:'#E0E0E0',borderRadius:8,padding:12,fontSize:14,minHeight:80,textAlignVertical:'top'},messageCharCount:{fontSize:12,color:'#999',textAlign:'right',marginTop:4},reviewCard:{padding:16,marginBottom:16},reviewLabel:{fontSize:12,color:'#666',marginBottom:4},reviewValue:{fontSize:16,fontWeight:'500',marginBottom:12},reviewMessage:{fontSize:14,fontStyle:'italic',color:'#555',backgroundColor:'#F5F5F5',padding:12,borderRadius:8},reviewNote:{fontSize:12,color:'#666',fontStyle:'italic'},successContainer:{alignItems:'center',justifyContent:'center',padding:32},successIconContainer:{width:80,height:80,borderRadius:40,backgroundColor:'#E8F5E9',justifyContent:'center',alignItems:'center',marginBottom:16},successIcon:{fontSize:40},successTitle:{fontSize:24,fontWeight:'600',marginBottom:8},successText:{fontSize:16,color:'#666',marginBottom:8},successSubtext:{fontSize:14,color:'#999'},permissionDenied:{alignItems:'center',padding:32},permissionIcon:{fontSize:48,marginBottom:16},permissionTitle:{fontSize:18,fontWeight:'600',marginBottom:8},permissionText:{fontSize:14,color:'#666',textAlign:'center',marginBottom:16},permissionButton:{minWidth:120},footer:{flexDirection:'row',justifyContent:'space-between',marginTop:16,paddingTop:16,borderTopWidth:1,borderTopColor:'#E0E0E0'}});



