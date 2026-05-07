import{getSupabaseClient}from'../../config/supabase'; class RepositoryError extends Error{constructor(public operation:string,public originalError:unknown){super(`Repository error in ${operation}: ${originalError instanceof Error ? originalError.message : 'Unknown error'}`); this.name = 'RepositoryError';}}const supabase = getSupabaseClient(); import{SquadSchema,SquadSummarySchema,SquadMemberSchema,SquadMemberDetailSchema,SquadInviteSchema,SquadInviteDetailSchema,SquadJoinRequestSchema,SquadJoinRequestDetailSchema,SquadSessionSchema,SquadSynergySchema,SquadActivitySchema,SquadChallengeSchema,SquadStatsSchema,SynergyActivitySchema,type Squad,type SquadSummary,type SquadMember,type SquadMemberDetail,type SquadInvite,type SquadInviteDetail,type SquadJoinRequest,type SquadJoinRequestDetail,type SquadSession,type SquadSynergy,type SquadActivity,type SquadChallenge,type SquadStats,type SynergyActivity,type SquadRole,type InviteStatus,type JoinRequestStatus,type SquadSessionStatus,type SquadChallengeStatus}from'./schemas'; function readField(row:unknown,key:string):unknown{return row && typeof row === 'object' ? Reflect.get(row,key) : undefined;}function parseTimestamp(value:unknown):number|null{if(typeof value === 'number'){return value;}if(typeof value === 'string'){const parsed = Date.parse(value); return Number.isNaN(parsed) ? null : parsed;}return null;}export async function fetchSquadWeeklyStats(squadId:string):Promise<{totalSessions:number;totalFocusMinutes:number;activeMemberCount:number;topContributor:{userId:string;displayName:string;focusMinutes:number}|null}>{const since = Date.now() - 7 * 24 * 60 * 60 * 1000; const membersResult = await supabase.from('squad_members').select('user_id').eq('squad_id',squadId).eq('is_active',true); if(membersResult.error){throw new RepositoryError('fetchSquadWeeklyStats.members',membersResult.error);}const memberIds = (membersResult.data || []).map((row:{user_id:string})=>row.user_id).filter((value:string)=>typeof value === 'string' && value.length > 0); if(memberIds.length === 0){return{totalSessions:0,totalFocusMinutes:0,activeMemberCount:0,topContributor:null};}const sessionsResult = await supabase.from('sessions').select('user_id, focus_minutes, total_focus_time, duration_minutes, completed_at, ended_at, started_at, users:user_id ( display_name, username )').in('user_id',memberIds); if(sessionsResult.error){throw new RepositoryError('fetchSquadWeeklyStats.sessions',sessionsResult.error);}const contributionMap = new Map<string,{focusMinutes:number;displayName:string}>(); const recentSessions = (sessionsResult.data || []).filter((row:unknown)=>{const completedAt = parseTimestamp(readField(row,'completed_at')); const endedAt = parseTimestamp(readField(row,'ended_at')); const startedAt = parseTimestamp(readField(row,'started_at')); const relevantAt = completedAt ?? endedAt ?? startedAt; return relevantAt !== null && relevantAt >= since;}).map((row:unknown)=>{const focusMinutesRaw = readField(row,'focus_minutes'); const durationMinutesRaw = readField(row,'duration_minutes'); const totalFocusTimeRaw = readField(row,'total_focus_time'); const focusMinutes = typeof focusMinutesRaw === 'number' ? focusMinutesRaw : typeof durationMinutesRaw === 'number' ? durationMinutesRaw : typeof totalFocusTimeRaw === 'number' ? Math.round(totalFocusTimeRaw / 60) : 0; const userId = typeof readField(row,'user_id') === 'string' ? String(readField(row,'user_id')) : ''; const userRow = readField(row,'users'); const displayName = typeof readField(userRow,'display_name') === 'string' && String(readField(userRow,'display_name')).trim().length > 0 ? String(readField(userRow,'display_name')) : typeof readField(userRow,'username') === 'string' && String(readField(userRow,'username')).trim().length > 0 ? String(readField(userRow,'username')) : 'Unknown'; if(userId){const current = contributionMap.get(userId) ?? {focusMinutes:0,displayName}; contributionMap.set(userId,{focusMinutes:current.focusMinutes + Math.max(0,focusMinutes),displayName:current.displayName || displayName});}return{focusMinutes:Math.max(0,focusMinutes)};}); let topContributor:{userId:string;displayName:string;focusMinutes:number}|null = null; contributionMap.forEach((value,userId)=>{if(!topContributor || value.focusMinutes > topContributor.focusMinutes){topContributor = {userId,displayName:value.displayName,focusMinutes:value.focusMinutes};}}); return{totalSessions:recentSessions.length,totalFocusMinutes:recentSessions.reduce((sum:number,row:{focusMinutes:number})=>sum + row.focusMinutes,0),activeMemberCount:contributionMap.size,topContributor};}export async function createSquad(squad:Omit<Squad,'id'|'createdAt'|'updatedAt'|'memberCount'|'totalFocusTime'|'completedSessions'|'focusMultiplier'|'multiplierLastUpdated'|'synergyLevel'|'challengeProgress'>):Promise<Squad>{const{data,error} = await supabase.from('squads').insert({...squad,member_count:1,total_focus_time:0,completed_sessions:0,focus_multiplier:1,multiplier_last_updated:Date.now(),synergy_level:1,challenge_progress:0,created_at:Date.now(),updated_at:Date.now()}).select().single(); if(error){throw new RepositoryError('createSquad',error);}return SquadSchema.parse(data);}export async function fetchSquadById(squadId:string):Promise<Squad|null>{const{data,error} = await supabase.from('squads').select('*').eq('id',squadId).single(); if(error){if(error.code === 'PGRST116'){return null;}throw new RepositoryError('fetchSquadById',error);}return SquadSchema.parse(data);}export async function updateSquad(squadId:string,updates:Partial<Pick<Squad,'name'|'description'|'avatarUrl'|'bannerUrl'|'isPublic'|'joinRequirements'|'maxMembers'>>):Promise<Squad>{const{data,error} = await supabase.from('squads').update({...updates,updated_at:Date.now()}).eq('id',squadId).select().single(); if(error){throw new RepositoryError('updateSquad',error);}return SquadSchema.parse(data);}export async function deleteSquad(squadId:string):Promise<void>{const{error} = await supabase.from('squads').delete().eq('id',squadId); if(error){throw new RepositoryError('deleteSquad',error);}}export async function fetchPublicSquads(options:{limit?:number;offset?:number;search?:string} = {}):Promise<SquadSummary[]>{const{limit = 20,offset = 0,search} = options; let query = supabase.from('squads').select('*, squad_members!inner(count)').eq('is_public',true).order('synergy_level',{ascending:false}).range(offset,offset + limit - 1); if(search){query = query.ilike('name',`%${search}%`);}const{data,error} = await query; if(error){throw new RepositoryError('fetchPublicSquads',error);}return SquadSummarySchema.array().parse(data || []);}export async function fetchSquadsForUser(userId:string):Promise<SquadSummary[]>{const{data,error} = await supabase.from('squad_members').select('squads(*)').eq('user_id',userId).eq('is_active',true); if(error){throw new RepositoryError('fetchSquadsForUser',error);}return SquadSummarySchema.array().parse(data?.map((row:{squads:unknown})=>row.squads) || []);}export async function addSquadMember(squadId:string,userId:string,role:SquadRole,invitedBy?:string):Promise<SquadMember>{const{data,error} = await supabase.from('squad_members').insert({squad_id:squadId,user_id:userId,role,joined_at:Date.now(),last_active_at:Date.now(),is_active:true,contribution_score:0,sessions_completed:0,total_focus_time:0,invited_by:invitedBy || null}).select().single(); if(error){throw new RepositoryError('addSquadMember',error);}return SquadMemberSchema.parse(data);}export async function fetchSquadMembers(squadId:string):Promise<SquadMemberDetail[]>{const{data,error} = await supabase.from('squad_members').select(`
      *,
      users:user_id (
        id,
        display_name,
        avatar_url,
        level,
        current_streak,
        last_active_at
      )
    `).eq('squad_id',squadId).eq('is_active',true).order('joined_at',{ascending:true}); if(error){throw new RepositoryError('fetchSquadMembers',error);}const members = (data || []).map((row:Record<string,unknown>)=>({...row,display_name:(row.users as Record<string,unknown>)?.display_name,avatar_url:(row.users as Record<string,unknown>)?.avatar_url,level:(row.users as Record<string,unknown>)?.level || 1,current_streak:(row.users as Record<string,unknown>)?.current_streak || 0,is_online:Date.now() - ((row.users as Record<string,unknown>)?.last_active_at as number || 0) < 300000,last_seen_at:(row.users as Record<string,unknown>)?.last_active_at || Date.now()})); return SquadMemberDetailSchema.array().parse(members);}export async function fetchSquadMember(squadId:string,userId:string):Promise<SquadMember|null>{const{data,error} = await supabase.from('squad_members').select('*').eq('squad_id',squadId).eq('user_id',userId).single(); if(error){if(error.code === 'PGRST116'){return null;}throw new RepositoryError('fetchSquadMember',error);}return SquadMemberSchema.parse(data);}export async function updateSquadMemberRole(squadId:string,userId:string,newRole:SquadRole):Promise<SquadMember>{const{data,error} = await supabase.from('squad_members').update({role:newRole}).eq('squad_id',squadId).eq('user_id',userId).select().single(); if(error){throw new RepositoryError('updateSquadMemberRole',error);}return SquadMemberSchema.parse(data);}export async function removeSquadMember(squadId:string,userId:string):Promise<void>{const{error} = await supabase.from('squad_members').update({is_active:false,left_at:Date.now()}).eq('squad_id',squadId).eq('user_id',userId); if(error){throw new RepositoryError('removeSquadMember',error);}}export async function updateMemberActivity(squadId:string,userId:string):Promise<void>{const{error} = await supabase.from('squad_members').update({last_active_at:Date.now()}).eq('squad_id',squadId).eq('user_id',userId); if(error){throw new RepositoryError('updateMemberActivity',error);}}export async function updateMemberContribution(squadId:string,userId:string,contribution:{contributionScore:number;sessionsCompleted?:number;focusTime:number}):Promise<void>{const{error} = await supabase.rpc('increment_member_contribution',{p_squad_id:squadId,p_user_id:userId,p_score:contribution.contributionScore,p_sessions:contribution.sessionsCompleted || 0,p_focus_time:contribution.focusTime}); if(error){throw new RepositoryError('updateMemberContribution',error);}}export async function transferFounderRole(squadId:string,newFounderId:string):Promise<void>{const{error} = await supabase.rpc('transfer_founder_role',{p_squad_id:squadId,p_new_founder_id:newFounderId}); if(error){throw new RepositoryError('transferFounderRole',error);}}export async function createSquadInvite(invite:Omit<SquadInvite,'id'|'status'|'createdAt'|'respondedAt'>):Promise<SquadInvite>{const{data,error} = await supabase.from('squad_invites').insert({...invite,status:'PENDING',created_at:Date.now(),responded_at:null}).select().single(); if(error){throw new RepositoryError('createSquadInvite',error);}return SquadInviteSchema.parse(data);}export async function fetchSquadInviteById(inviteId:string):Promise<SquadInvite|null>{const{data,error} = await supabase.from('squad_invites').select('*').eq('id',inviteId).single(); if(error){if(error.code === 'PGRST116'){return null;}throw new RepositoryError('fetchSquadInviteById',error);}return SquadInviteSchema.parse(data);}export async function fetchSquadInvitesForUser(userId:string):Promise<SquadInviteDetail[]>{const{data,error} = await supabase.from('squad_invites').select(`
      *,
      squads:squad_id (name, avatar_url, member_count),
      inviters:invited_by (display_name, avatar_url)
    `).eq('invited_user_id',userId).eq('status','PENDING').gt('expires_at',Date.now()).order('created_at',{ascending:false}); if(error){throw new RepositoryError('fetchSquadInvitesForUser',error);}const invites = (data || []).map((row:Record<string,unknown>)=>({...row,squad_name:(row.squads as Record<string,unknown>)?.name,squad_avatar_url:(row.squads as Record<string,unknown>)?.avatar_url,squad_member_count:(row.squads as Record<string,unknown>)?.member_count || 0,inviter_name:(row.inviters as Record<string,unknown>)?.display_name || 'Unknown',inviter_avatar_url:(row.inviters as Record<string,unknown>)?.avatar_url})); return SquadInviteDetailSchema.array().parse(invites);}export async function fetchPendingInvitesForSquad(squadId:string):Promise<SquadInvite[]>{const{data,error} = await supabase.from('squad_invites').select('*').eq('squad_id',squadId).eq('status','PENDING').gt('expires_at',Date.now()).order('created_at',{ascending:false}); if(error){throw new RepositoryError('fetchPendingInvitesForSquad',error);}return SquadInviteSchema.array().parse(data || []);}export async function updateSquadInviteStatus(inviteId:string,status:Exclude<InviteStatus,'PENDING'>):Promise<SquadInvite>{const{data,error} = await supabase.from('squad_invites').update({status,responded_at:Date.now()}).eq('id',inviteId).select().single(); if(error){throw new RepositoryError('updateSquadInviteStatus',error);}return SquadInviteSchema.parse(data);}export async function revokeSquadInvite(inviteId:string,revokedBy:string):Promise<void>{const{error} = await supabase.from('squad_invites').update({status:'REVOKED',responded_at:Date.now(),revoked_by:revokedBy}).eq('id',inviteId); if(error){throw new RepositoryError('revokeSquadInvite',error);}}export async function checkExistingInvite(squadId:string,userId:string):Promise<SquadInvite|null>{const{data,error} = await supabase.from('squad_invites').select('*').eq('squad_id',squadId).eq('invited_user_id',userId).eq('status','PENDING').gt('expires_at',Date.now()).maybeSingle(); if(error){throw new RepositoryError('checkExistingInvite',error);}return data ? SquadInviteSchema.parse(data) : null;}export async function createJoinRequest(squadId:string,userId:string,message:string|null):Promise<SquadJoinRequest>{const{data,error} = await supabase.from('squad_join_requests').insert({squad_id:squadId,user_id:userId,status:'PENDING',message,created_at:Date.now(),reviewed_at:null,reviewed_by:null}).select().single(); if(error){throw new RepositoryError('createJoinRequest',error);}return SquadJoinRequestSchema.parse(data);}export async function fetchJoinRequestsForSquad(squadId:string,status?:JoinRequestStatus):Promise<SquadJoinRequestDetail[]>{let query = supabase.from('squad_join_requests').select(`
      *,
      users:user_id (
        display_name,
        avatar_url,
        level,
        current_streak
      )
    `).eq('squad_id',squadId); if(status){query = query.eq('status',status);}const{data,error} = await query.order('created_at',{ascending:false}); if(error){throw new RepositoryError('fetchJoinRequestsForSquad',error);}const requests = (data || []).map((row:Record<string,unknown>)=>({...row,display_name:(row.users as Record<string,unknown>)?.display_name || 'Unknown',avatar_url:(row.users as Record<string,unknown>)?.avatar_url,level:(row.users as Record<string,unknown>)?.level || 1,current_streak:(row.users as Record<string,unknown>)?.current_streak || 0})); return SquadJoinRequestDetailSchema.array().parse(requests);}export async function fetchUserJoinRequest(squadId:string,userId:string):Promise<SquadJoinRequest|null>{const{data,error} = await supabase.from('squad_join_requests').select('*').eq('squad_id',squadId).eq('user_id',userId).eq('status','PENDING').maybeSingle(); if(error){throw new RepositoryError('fetchUserJoinRequest',error);}return data ? SquadJoinRequestSchema.parse(data) : null;}export async function respondToJoinRequest(requestId:string,approved:boolean,reviewedBy:string):Promise<SquadJoinRequest>{const{data,error} = await supabase.from('squad_join_requests').update({status:approved ? 'APPROVED' : 'REJECTED',reviewed_at:Date.now(),reviewed_by:reviewedBy}).eq('id',requestId).select().single(); if(error){throw new RepositoryError('respondToJoinRequest',error);}return SquadJoinRequestSchema.parse(data);}export async function createSquadSession(session:Omit<SquadSession,'id'|'status'|'startedAt'|'completedAt'|'totalFocusTime'|'synergyBonus'>):Promise<SquadSession>{const{data,error} = await supabase.from('squad_sessions').insert({...session,status:'SCHEDULED',started_at:null,completed_at:null,total_focus_time:0,synergy_bonus:0}).select().single(); if(error){throw new RepositoryError('createSquadSession',error);}return SquadSessionSchema.parse(data);}export async function fetchSquadSessionById(sessionId:string):Promise<SquadSession|null>{const{data,error} = await supabase.from('squad_sessions').select('*').eq('id',sessionId).single(); if(error){if(error.code === 'PGRST116'){return null;}throw new RepositoryError('fetchSquadSessionById',error);}return SquadSessionSchema.parse(data);}export async function fetchActiveSquadSessions(squadId:string):Promise<SquadSession[]>{const{data,error} = await supabase.from('squad_sessions').select('*').eq('squad_id',squadId).in('status',['SCHEDULED','ACTIVE','PAUSED']).order('starts_at',{ascending:true}); if(error){throw new RepositoryError('fetchActiveSquadSessions',error);}return SquadSessionSchema.array().parse(data || []);}export async function updateSquadSessionStatus(sessionId:string,status:SquadSessionStatus,additionalUpdates?:Partial<SquadSession>):Promise<SquadSession>{const{data,error} = await supabase.from('squad_sessions').update({status,...additionalUpdates}).eq('id',sessionId).select().single(); if(error){throw new RepositoryError('updateSquadSessionStatus',error);}return SquadSessionSchema.parse(data);}export async function addSquadSessionParticipant(sessionId:string,userId:string,joinedSessionId:string|null):Promise<void>{const{error} = await supabase.from('squad_session_participants').insert({session_id:sessionId,user_id:userId,joined_at:Date.now(),status:'JOINED',focus_time:0,joined_session_id:joinedSessionId}); if(error){throw new RepositoryError('addSquadSessionParticipant',error);}}export async function fetchSquadSynergy(squadId:string):Promise<SquadSynergy|null>{const{data,error} = await supabase.from('squad_synergy').select('*').eq('squad_id',squadId).single(); if(error){if(error.code === 'PGRST116'){return null;}throw new RepositoryError('fetchSquadSynergy',error);}return SquadSynergySchema.parse(data);}export async function updateSquadSynergy(squadId:string,updates:Partial<SquadSynergy>):Promise<SquadSynergy>{const{data,error} = await supabase.from('squad_synergy').update(updates).eq('squad_id',squadId).select().single(); if(error){throw new RepositoryError('updateSquadSynergy',error);}return SquadSynergySchema.parse(data);}export async function addSynergyActivity(activity:Omit<SynergyActivity,'id'|'createdAt'>):Promise<SynergyActivity>{const{data,error} = await supabase.from('synergy_activities').insert({...activity,created_at:Date.now()}).select().single(); if(error){throw new RepositoryError('addSynergyActivity',error);}return SynergyActivitySchema.parse(data);}export async function fetchSynergyActivities(squadId:string,limit:number = 50):Promise<SynergyActivity[]>{const{data,error} = await supabase.from('synergy_activities').select('*').eq('squad_id',squadId).order('created_at',{ascending:false}).limit(limit); if(error){throw new RepositoryError('fetchSynergyActivities',error);}return SynergyActivitySchema.array().parse(data || []);}export async function createSquadChallenge(challenge:Omit<SquadChallenge,'id'|'currentValue'|'status'|'completedAt'>):Promise<SquadChallenge>{const{data,error} = await supabase.from('squad_challenges').insert({...challenge,current_value:0,status:'PENDING',completed_at:null}).select().single(); if(error){throw new RepositoryError('createSquadChallenge',error);}return SquadChallengeSchema.parse(data);}export async function fetchActiveSquadChallenge(squadId:string):Promise<SquadChallenge|null>{const{data,error} = await supabase.from('squad_challenges').select('*').eq('squad_id',squadId).in('status',['PENDING','ACTIVE']).order('starts_at',{ascending:true}).maybeSingle(); if(error){throw new RepositoryError('fetchActiveSquadChallenge',error);}return data ? SquadChallengeSchema.parse(data) : null;}export async function updateSquadChallengeProgress(challengeId:string,progress:number,status?:SquadChallengeStatus):Promise<SquadChallenge>{const updates:Record<string,unknown> = {current_value:progress}; if(status){updates.status = status; if(status === 'COMPLETED' || status === 'FAILED'){updates.completed_at = Date.now();}}const{data,error} = await supabase.from('squad_challenges').update(updates).eq('id',challengeId).select().single(); if(error){throw new RepositoryError('updateSquadChallengeProgress',error);}return SquadChallengeSchema.parse(data);}export async function createSquadActivity(activity:Omit<SquadActivity,'id'|'createdAt'>):Promise<SquadActivity>{const{data,error} = await supabase.from('squad_activities').insert({...activity,created_at:Date.now()}).select().single(); if(error){throw new RepositoryError('createSquadActivity',error);}return SquadActivitySchema.parse(data);}export async function fetchSquadActivity(squadId:string,limit:number = 50):Promise<SquadActivity[]>{const{data,error} = await supabase.from('squad_activities').select('*').eq('squad_id',squadId).order('created_at',{ascending:false}).limit(limit); if(error){throw new RepositoryError('fetchSquadActivity',error);}return SquadActivitySchema.array().parse(data || []);}export async function updateSquadStats(squadId:string,updates:{memberCount?:number;totalFocusTime?:number;completedSessions?:number;focusMultiplier?:number;synergyLevel?:number}):Promise<void>{const{error} = await supabase.from('squads').update({...updates,updated_at:Date.now(),multiplier_last_updated:updates.focusMultiplier ? Date.now() : undefined}).eq('id',squadId); if(error){throw new RepositoryError('updateSquadStats',error);}}export async function checkDuplicateMembership(userId:string,excludeSquadId?:string):Promise<Squad|null>{let query = supabase.from('squad_members').select('squads(*)').eq('user_id',userId).eq('is_active',true); if(excludeSquadId){query = query.neq('squad_id',excludeSquadId);}const{data,error} = await query.maybeSingle(); if(error){throw new RepositoryError('checkDuplicateMembership',error);}return data ? SquadSchema.parse((data as{squads:unknown}).squads) : null;}



// Active Squad Session Functions
export async function getActiveSquadSessionCount(
  squadId: string,
  excludeUserId?: string
): Promise<{ data: number; error: null } | { data: null; error: Error }> {
  try {
    const membersResult = await supabase
      .from('squad_members')
      .select('user_id')
      .eq('squad_id', squadId)
      .eq('is_active', true);

    if (membersResult.error) {throw membersResult.error;}

    const memberIds = (membersResult.data ?? [])
      .map((row: { user_id: string }) => row.user_id)
      .filter((memberId: string) => memberId !== excludeUserId);

    if (memberIds.length === 0) {
      return { data: 0, error: null };
    }

    const { count, error } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .in('user_id', memberIds)
      .eq('status', 'ACTIVE');
    if (error) {throw error;}
    return { data: count || 0, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export function subscribeToSquadSessions(
  squadId: string,
  callback: (activeCount: number) => void,
  excludeUserId?: string
) {
  const channel = supabase
    .channel(`squad_sessions:${squadId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'sessions',
    }, async () => {
      const { data } = await getActiveSquadSessionCount(squadId, excludeUserId);
      if (typeof data === 'number') {
        callback(data);
      }
    })
    .subscribe();
  return channel;
}

export async function fetchSquadSummary(squadId: string): Promise<SquadSummary | null> {
  const squad = await fetchSquadById(squadId);
  return squad
    ? SquadSummarySchema.parse({
        id: squad.id,
        name: squad.name,
        avatarUrl: squad.avatarUrl,
        memberCount: squad.memberCount,
        maxMembers: squad.maxMembers,
        focusMultiplier: squad.focusMultiplier,
        synergyLevel: squad.synergyLevel,
        isPublic: squad.isPublic,
        isMember: true,
        userRole: null,
      })
    : null;
}

export async function fetchSquadMemberDetails(squadId: string): Promise<SquadMemberDetail[]> {
  return fetchSquadMembers(squadId);
}

export async function fetchUserInvites(userId: string): Promise<SquadInvite[]> {
  return fetchSquadInvitesForUser(userId);
}

export async function fetchUserJoinRequests(userId: string): Promise<SquadJoinRequest[]> {
  const { data, error } = await supabase
    .from('squad_join_requests')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false });
  if (error) {throw new RepositoryError('fetchUserJoinRequests', error);}
  return SquadJoinRequestSchema.array().parse(data || []);
}

export async function fetchSquadInvites(squadId: string): Promise<SquadInviteDetail[]> {
  const invites = await fetchPendingInvitesForSquad(squadId);
  return invites.map((invite) =>
    SquadInviteDetailSchema.parse({
      ...invite,
      squadName: '',
      squadAvatarUrl: null,
      squadMemberCount: 0,
      inviterName: '',
      inviterAvatarUrl: null,
    }),
  );
}

export async function fetchSquadJoinRequests(squadId: string): Promise<SquadJoinRequest[]> {
  return fetchJoinRequestsForSquad(squadId);
}

export async function fetchSquadStats(squadId: string): Promise<SquadStats | null> {
  const weeklyStats = await fetchSquadWeeklyStats(squadId);
  return SquadStatsSchema.parse({
    squadId,
    totalSessions: weeklyStats.totalSessions,
    totalFocusMinutes: weeklyStats.totalFocusMinutes,
    totalBossDamage: 0,
    averageSessionQuality: null,
    topContributor: weeklyStats.topContributor,
    activeStreak: 0,
    lastUpdatedAt: Date.now(),
  });
}

export async function searchSquads(query: string, filters?: { tags?: string[]; isPublic?: boolean }): Promise<SquadSummary[]> {
  return fetchPublicSquads({ search: query, limit: 20 });
}

export async function fetchUserSquads(userId: string): Promise<SquadSummary[]> {
  return fetchSquadsForUser(userId);
}

export async function fetchRecommendedSquads(userId: string): Promise<SquadSummary[]> {
  return fetchPublicSquads({ limit: 10 });
}


