import React,{useState,useCallback}from'react'; import{View,Text,ScrollView,Pressable,TextInput,ActivityIndicator}from'react-native'; import{FlashList}from'@shopify/flash-list'; import Animated,{useSharedValue,useAnimatedStyle,withTiming}from'react-native-reanimated'; import{Card,Button,Avatar,Badge,ProgressBar}from'../../../components'; import{usePublicSquads,useJoinSquadWithCode,useRequestToJoinSquad}from'../hooks'; import{type SquadSummary,type JoinRequirement}from'../schemas'; import{createSheet}from'@/shared/ui/create-sheet'; type JoinStep='BROWSE'|'DETAILS'|'CODE'|'SUCCESS';interface JoinSquadFlowProps{userId:string;onComplete?:(squadId:string)=>void;onCancel?:()=>void;inviteCode?:string}function getDefaultJoinRequirement():JoinRequirement{return 'OPEN';}export const JoinSquadFlow:React.FC<JoinSquadFlowProps> = ({userId,onComplete,onCancel,inviteCode})=>{const{data:publicSquads,isLoading:isLoadingSquads} = usePublicSquads({limit:50}); const joinWithCodeMutation = useJoinSquadWithCode(userId); const requestToJoinMutation = useRequestToJoinSquad(userId); const[step,setStep] = useState<JoinStep>(inviteCode ? 'CODE' : 'BROWSE'); const[selectedSquad,setSelectedSquad] = useState<SquadSummary|null>(null); const[searchQuery,setSearchQuery] = useState(''); const[searchResults,setSearchResults] = useState<SquadSummary[]>([]); const[hasSearched,setHasSearched] = useState(false); const[joinCode,setJoinCode] = useState(inviteCode || ''); const[requestMessage,setRequestMessage] = useState(''); const[joinedSquadId,setJoinedSquadId] = useState<string|null>(null); const[error,setError] = useState<string|null>(null); const fadeAnim = useSharedValue(1); const animatedStyle = useAnimatedStyle(()=>({opacity:fadeAnim.value})); const animateTransition = useCallback((nextStep:JoinStep)=>{fadeAnim.value = withTiming(0,{duration:150},()=>{setStep(nextStep); fadeAnim.value = withTiming(1,{duration:150});});},[fadeAnim]); const handleSearch = useCallback(()=>{setHasSearched(true); if(!publicSquads){setSearchResults([]); return;}const query = searchQuery.toLowerCase(); const results = publicSquads.filter(s=>s.name.toLowerCase().includes(query)); setSearchResults(results);},[searchQuery,publicSquads]); const handleSelectSquad = useCallback((squad:SquadSummary)=>{setSelectedSquad(squad); setError(null); animateTransition('DETAILS');},[animateTransition]); const handleJoin = useCallback(async()=>{if(!selectedSquad){return;}if(getDefaultJoinRequirement() === 'INVITE_ONLY'){animateTransition('CODE'); return;}setError(null); try{await requestToJoinMutation.mutateAsync({squadId:selectedSquad.id,message:''}); setJoinedSquadId(selectedSquad.id); animateTransition('SUCCESS');}catch(err){setError(err instanceof Error ? err.message : 'Failed to join squad');}},[selectedSquad,requestToJoinMutation,animateTransition]); const handleRequestJoin = useCallback(async()=>{if(!selectedSquad){return;}setError(null); try{await requestToJoinMutation.mutateAsync({squadId:selectedSquad.id,message:requestMessage}); animateTransition('SUCCESS');}catch(err){setError(err instanceof Error ? err.message : 'Failed to send request');}},[selectedSquad,requestToJoinMutation,requestMessage,animateTransition]); const handleCodeJoin = useCallback(async()=>{if(!joinCode.trim()){return;}setError(null); try{const squad = await joinWithCodeMutation.mutateAsync(joinCode.trim()); setJoinedSquadId(squad.id); animateTransition('SUCCESS');}catch(err){setError(err instanceof Error ? err.message : 'Invalid invite code');}},[joinCode,joinWithCodeMutation,animateTransition]); const handleBack = useCallback(()=>{switch(step){case'DETAILS':setSelectedSquad(null); animateTransition('BROWSE'); break; case'CODE':animateTransition('DETAILS'); break; default:onCancel?.();}},[step,animateTransition,onCancel]); const handleComplete = useCallback(()=>{if(joinedSquadId){onComplete?.(joinedSquadId);}else{onCancel?.();}},[joinedSquadId,onComplete,onCancel]); const getRequirementBadge = (requirement:JoinRequirement)=>{switch(requirement){case 'OPEN':return<Badge variant="success">Open</Badge>; case'APPROVAL':return<Badge variant="warning">Approval Required</Badge>; case'INVITE_ONLY':return<Badge variant="error">Invite Only</Badge>; case'LEVEL_REQ':return<Badge variant="info">Level 5+ Required</Badge>; default:return null;}}; const renderBrowseStep = ()=><View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Find a Squad</Text>

      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput}placeholder="Search squads..."value={searchQuery}onChangeText={setSearchQuery}onSubmitEditing={handleSearch}returnKeyType="search"/>
        <Button onPress={handleSearch}isLoading={isLoadingSquads}isDisabled={!searchQuery.trim()}size="sm"
  accessibilityLabel="Search button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          Search
        </Button>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine}/>
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine}/>
      </View>

      <Pressable style={({pressed})=>[styles.codeEntryButton,pressed && {opacity:0.7}]}onPress={()=>animateTransition('CODE')}
  accessibilityLabel="Have an invite code? Tap to enter code button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Text style={styles.codeEntryText}>Have an invite code?</Text>
        <Text style={styles.codeEntrySubtext}>Tap to enter code</Text>
      </Pressable>

      {isLoadingSquads ? <ActivityIndicator style={styles.loading}/> : hasSearched ? searchResults.length > 0 ? <FlashList data={searchResults}keyExtractor={(item:SquadSummary)=>item.id}renderItem={({item}:{item:SquadSummary})=><Pressable style={({pressed})=>[styles.squadItem,pressed && {opacity:0.7}]}onPress={()=>handleSelectSquad(item)}
  accessibilityLabel="/ members • button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                <View style={styles.squadHeader}>
                  <Avatar name={item.name}size="lg"/>
                  <View style={styles.squadInfo}>
                    <Text style={styles.squadName}>{item.name}</Text>
                    <Text style={styles.squadMeta}>
                      {item.memberCount}/{item.maxMembers} members • {getDefaultJoinRequirement() === getDefaultJoinRequirement() ? 'Open to join' : getDefaultJoinRequirement() === 'APPROVAL' ? 'Approval required' : 'Invite only'}
                    </Text>
                  </View>
                  {getRequirementBadge(getDefaultJoinRequirement())}
                </View>


              </Pressable>}style={styles.squadList}/> : <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No squads found</Text>
            <Text style={styles.emptyText}>Try a different search term</Text>
          </View> : publicSquads && publicSquads.length > 0 ? <FlashList data={publicSquads.slice(0,10)}keyExtractor={(item:SquadSummary)=>item.id}renderItem={({item}:{item:SquadSummary})=><Pressable style={({pressed})=>[styles.squadItem,pressed && {opacity:0.7}]}onPress={()=>handleSelectSquad(item)}
  accessibilityLabel="/ members • button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              <View style={styles.squadHeader}>
                <Avatar name={item.name}size="lg"/>
                <View style={styles.squadInfo}>
                  <Text style={styles.squadName}>{item.name}</Text>
                  <Text style={styles.squadMeta}>
                    {item.memberCount}/{item.maxMembers} members • {getDefaultJoinRequirement() === getDefaultJoinRequirement() ? 'Open to join' : getDefaultJoinRequirement() === 'APPROVAL' ? 'Approval required' : 'Invite only'}
                  </Text>
                </View>
                {getRequirementBadge(getDefaultJoinRequirement())}
              </View>


            </Pressable>}style={styles.squadList}ListHeaderComponent={<Text style={styles.sectionTitle}>Popular Squads</Text>}/> : <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>Find Your Squad</Text>
          <Text style={styles.emptyText}>
            Search for squads to join or use an invite code
          </Text>
        </View>}
    </View>; const renderDetailsStep = ()=>{if(!selectedSquad){return null;}const canJoin = getDefaultJoinRequirement() === getDefaultJoinRequirement(); const needsApproval = getDefaultJoinRequirement() === 'APPROVAL'; const needsCode = getDefaultJoinRequirement() === 'INVITE_ONLY'; return<View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Squad Details</Text>

        <Card style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Avatar name={selectedSquad.name}size="xl"/>
            <View style={styles.detailsTitleSection}>
              <Text style={styles.detailsName}>{selectedSquad.name}</Text>
              {getRequirementBadge(getDefaultJoinRequirement())}
            </View>
          </View>

          <Text style={styles.detailsDescription}>
            No description provided
          </Text>

          <View style={styles.detailsStats}>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatValue}>{selectedSquad.memberCount}</Text>
              <Text style={styles.detailStatLabel}>Members</Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatValue}>{selectedSquad.maxMembers}</Text>
              <Text style={styles.detailStatLabel}>Max</Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatValue}>{selectedSquad.synergyLevel}</Text>
              <Text style={styles.detailStatLabel}>Synergy</Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatValue}>
                {selectedSquad.focusMultiplier.toFixed(1)}x
              </Text>
              <Text style={styles.detailStatLabel}>Focus Multiplier</Text>
            </View>
          </View>

          <View style={styles.capacitySection}>
            <Text style={styles.capacityLabel}>Capacity</Text>
            <ProgressBar progress={selectedSquad.memberCount / selectedSquad.maxMembers}style={styles.capacityBar}/>
            <Text style={styles.capacityText}>
              {selectedSquad.maxMembers - selectedSquad.memberCount} spots remaining
            </Text>
          </View>
        </Card>

        {needsApproval && <Card style={styles.requestCard}>
            <Text style={styles.requestTitle}>Request to Join</Text>
            <Text style={styles.requestDescription}>
              This squad requires approval to join. Add a message to your request:
            </Text>
            <TextInput style={styles.requestInput}placeholder="Why do you want to join this squad?"value={requestMessage}onChangeText={setRequestMessage}multiline maxLength={200}/>
            <Text style={styles.charCount}>{requestMessage.length}/200</Text>
          </Card>}

        {error && <Card style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </Card>}
      </View>;}; const renderCodeStep = ()=><View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Enter Invite Code</Text>

      <Card style={styles.codeCard}>
        <Text style={styles.codeDescription}>
          Enter the invite code you received to join a squad:
        </Text>

        <TextInput style={styles.codeInput}placeholder="XXXX-XXXX"value={joinCode}onChangeText={setJoinCode}autoCapitalize="characters"maxLength={9}/>

        <Text style={styles.codeHint}>
          Codes are 8 characters with a dash in the middle
        </Text>
      </Card>
    </View>; const renderSuccessStep = ()=><View style={styles.stepContent}>
      <View style={styles.successContainer}>
        <View style={styles.successIconCircle}>
          <Text style={styles.successIcon}>🎉</Text>
        </View>
        <Text style={styles.successTitle}>
          {getDefaultJoinRequirement() === 'APPROVAL' ? 'Request Sent!' : 'Welcome to the Squad!'}
        </Text>
        <Text style={styles.successText}>
          {getDefaultJoinRequirement() === 'APPROVAL' ? "Your request has been sent. You'll be notified when approved." : 'You have successfully joined the squad. Start collaborating!'}
        </Text>
      </View>
    </View>; const getFooterButtons = ()=>{switch(step){case'BROWSE':return{left:{label:'Cancel',action:onCancel},right:null}; case'DETAILS':if(!selectedSquad){return{left:{label:'Back',action:handleBack},right:null};}const canJoin = getDefaultJoinRequirement() === getDefaultJoinRequirement(); const needsApproval = getDefaultJoinRequirement() === 'APPROVAL'; const isProcessing = requestToJoinMutation.isPending || joinWithCodeMutation.isPending; return{left:{label:'Back',action:handleBack},right:{label:needsApproval ? 'Request to Join' : canJoin ? 'Join Squad' : 'Enter Code',action:needsApproval ? handleRequestJoin : handleJoin,loading:isProcessing}}; case'CODE':return{left:{label:'Back',action:handleBack},right:{label:'Join with Code',action:handleCodeJoin,loading:joinWithCodeMutation.isPending,disabled:!joinCode.trim() || joinCode.length < 8}}; case'SUCCESS':return{left:null,right:{label:'Done',action:handleComplete}}; default:return{left:{label:'Cancel',action:onCancel},right:null};}}; const footerButtons = getFooterButtons(); return<Card style={styles.container}>
      <Animated.View style={[styles.content,animatedStyle]}>
        {step === 'BROWSE' && renderBrowseStep()}
        {step === 'DETAILS' && renderDetailsStep()}
        {step === 'CODE' && renderCodeStep()}
        {step === 'SUCCESS' && renderSuccessStep()}
      </Animated.View>

      <View style={styles.footer}>
        {footerButtons.left && <Button onPress={footerButtons.left.action}variant="secondary"isDisabled={requestToJoinMutation.isPending || joinWithCodeMutation.isPending}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            {footerButtons.left.label}
          </Button>}

        {footerButtons.right && <Button onPress={footerButtons.right.action}isLoading={footerButtons.right.loading}isDisabled={footerButtons.right.disabled || !!error}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            {footerButtons.right.label}
          </Button>}
      </View>
    </Card>;}; const styles = createSheet({container:{padding:20,maxHeight:'85%'},content:{flex:1},stepContent:{flex:1},stepTitle:{fontSize:20,fontWeight:'600',marginBottom:16},searchContainer:{flexDirection:'row',gap:8,marginBottom:16},searchInput:{flex:1,borderWidth:1,borderColor:'#E0E0E0',borderRadius:8,padding:12,fontSize:14},divider:{flexDirection:'row',alignItems:'center',marginVertical:16},dividerLine:{flex:1,height:1,backgroundColor:'#E0E0E0'},dividerText:{marginHorizontal:12,color:'#999',fontSize:12},codeEntryButton:{backgroundColor:'#F5F5F5',padding:16,borderRadius:8,alignItems:'center',marginBottom:16},codeEntryText:{fontSize:14,fontWeight:'500'},codeEntrySubtext:{fontSize:12,color:'#666',marginTop:4},loading:{marginTop:32},squadList:{maxHeight:300},squadItem:{backgroundColor:'#F5F5F5',padding:16,borderRadius:12,marginBottom:12},squadHeader:{flexDirection:'row',alignItems:'center',marginBottom:8},squadInfo:{flex:1,marginLeft:12},squadName:{fontSize:16,fontWeight:'600'},squadMeta:{fontSize:12,color:'#666',marginTop:2},squadDescription:{fontSize:14,color:'#555',marginBottom:12},squadStats:{flexDirection:'row'},stat:{backgroundColor:'#fff',padding:8,borderRadius:8,minWidth:80},statValue:{fontSize:14,fontWeight:'600'},statLabel:{fontSize:10,color:'#666'},emptyState:{alignItems:'center',justifyContent:'center',padding:40},emptyIcon:{fontSize:48,marginBottom:12},emptyTitle:{fontSize:16,fontWeight:'600',marginBottom:4},emptyText:{fontSize:14,color:'#666',textAlign:'center'},detailsCard:{padding:16,marginBottom:16},detailsHeader:{flexDirection:'row',alignItems:'center',marginBottom:16},detailsTitleSection:{marginLeft:16,flex:1},detailsName:{fontSize:20,fontWeight:'600',marginBottom:4},detailsDescription:{fontSize:14,color:'#555',marginBottom:16,lineHeight:20},detailsStats:{flexDirection:'row',justifyContent:'space-around',marginBottom:16},detailStat:{alignItems:'center'},detailStatValue:{fontSize:18,fontWeight:'600'},detailStatLabel:{fontSize:12,color:'#666',marginTop:2},capacitySection:{borderTopWidth:1,borderTopColor:'#E0E0E0',paddingTop:16},capacityLabel:{fontSize:12,fontWeight:'600',marginBottom:8},capacityBar:{marginBottom:8},capacityText:{fontSize:12,color:'#666',textAlign:'center'},requestCard:{padding:16},requestTitle:{fontSize:16,fontWeight:'600',marginBottom:8},requestDescription:{fontSize:14,color:'#666',marginBottom:12},requestInput:{borderWidth:1,borderColor:'#E0E0E0',borderRadius:8,padding:12,fontSize:14,minHeight:100,textAlignVertical:'top'},charCount:{fontSize:12,color:'#999',textAlign:'right',marginTop:4},codeCard:{padding:24},codeDescription:{fontSize:14,color:'#666',marginBottom:16,textAlign:'center'},codeInput:{borderWidth:2,borderColor:'#007AFF',borderRadius:12,padding:16,fontSize:24,textAlign:'center',letterSpacing:4,fontWeight:'600'},codeHint:{fontSize:12,color:'#999',textAlign:'center',marginTop:12},successContainer:{alignItems:'center',justifyContent:'center',padding:40},successIconCircle:{width:100,height:100,borderRadius:50,backgroundColor:'#E8F5E9',justifyContent:'center',alignItems:'center',marginBottom:24},successIcon:{fontSize:50},successTitle:{fontSize:24,fontWeight:'600',marginBottom:12,textAlign:'center'},successText:{fontSize:14,color:'#666',textAlign:'center'},sectionTitle:{fontSize:16,fontWeight:'600',marginBottom:12,color:'#666'},errorCard:{padding:12,backgroundColor:'#FFEBEE',borderRadius:8,marginTop:12},errorText:{color:'#C62828',fontSize:14},footer:{flexDirection:'row',justifyContent:'space-between',marginTop:16,paddingTop:16,borderTopWidth:1,borderTopColor:'#E0E0E0'}});




