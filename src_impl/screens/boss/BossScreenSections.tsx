import React,{useEffect,useMemo,useState}from'react'; import{Pressable,View}from'react-native'; import{useIsFocused}from'@react-navigation/native'; import{z}from'zod'; import{Text}from'../../components/primitives'; import{RealTimeBossCombat,calculatePurityMultiplier,createBossEncounter}from'../../features/boss-realtime'; import type{BossEncounterSummary,BossTemplate}from'../../features/boss/schemas'; import type{SquadSummary}from'../../features/squads/schemas'; import{useTheme}from'../../theme'; import{useSessionHistory}from'../../session/hooks/useSession'; const ATTACK_PRESETS = [{minutes:15,label:'⚡ 15m Quick Strike'},{minutes:25,label:'🎯 25m Pomodoro'},{minutes:60,label:'🔥 60m Deep Strike'}]as const; const BossDamageSchema = z.object({bossDamage:z.number().optional()}).passthrough(); const ContributorsSchema = z.object({contributors:z.array(z.object({userId:z.string(),name:z.string().optional(),damageDealt:z.number().optional(),damage:z.number().optional()})).optional()}).passthrough(); type BossScreenSectionsProps={encounter:BossEncounterSummary;template?:BossTemplate;activeSquad?:SquadSummary;progressionLevel:number;streakMultiplier:number;userDamage:number;userId:string;onLaunchAttack:(minutes:number)=>void;onOpenSquad:()=>void;};const cardStyle = (theme:ReturnType<typeof useTheme>['theme'])=>({backgroundColor:theme.colors.background.secondary,borderColor:theme.colors.border.light,borderRadius:theme.borderRadius['2xl'],borderWidth:1,gap:theme.spacing[3],padding:theme.spacing[5]}); const formatDate = (value:number)=>new Date(value).toLocaleDateString(undefined,{month:'short',day:'numeric'}); const formatDuration = (seconds:number)=>`${Math.max(1,Math.round(seconds / 60))} min`; const estimateDamage = (minutes:number,streakMultiplier:number)=>Math.round(minutes * streakMultiplier * 1.5); export function BossScreenSections({encounter,template,activeSquad,progressionLevel,streakMultiplier,userDamage,userId,onLaunchAttack,onOpenSquad}:BossScreenSectionsProps):JSX.Element{const{theme} = useTheme(); const isFocused = useIsFocused(); const historyQuery = useSessionHistory(userId,20); const[elapsedSeconds,setElapsedSeconds] = useState(0); const[selectedMinutes,setSelectedMinutes] = useState<number>(25); useEffect(()=>{if(!isFocused){return;}const intervalId = setInterval(()=>setElapsedSeconds(value=>(value + 1) % 301),1000); return()=>clearInterval(intervalId);},[isFocused]); const demoEncounter = useMemo(()=>createBossEncounter(encounter.bossId,template?.name ?? 'Boss','👹',userId,'preview',5,progressionLevel),[encounter.bossId,progressionLevel,template?.name,userId]); const purityScore = Math.round(75 + Math.sin(elapsedSeconds / 10) * 15); const recentAttacks = useMemo(()=>{const since = Date.now() - 7 * 24 * 60 * 60 * 1000; return historyQuery.history.filter(entry=>entry.startedAt >= since && entry.summary).map(entry=>{const parsed = BossDamageSchema.safeParse(entry.summary); const duration = entry.summary?.effectiveDuration ?? entry.summary?.actualDuration ?? entry.config.duration; const purity = entry.summary?.focusPurityScore ?? entry.summary?.focusQuality ?? 75; const damage = parsed.success && parsed.data.bossDamage !== undefined ? parsed.data.bossDamage : Math.round(duration / 60 * calculatePurityMultiplier(purity)); return{damage,duration,endedAt:entry.endedAt ?? entry.startedAt,purity};}).filter(entry=>entry.damage > 0).slice(0,5);},[historyQuery.history]); const initialMinutes = useMemo(()=>{const lastDuration = historyQuery.history[0]?.config.duration; if(!lastDuration){return 25;}const lastMinutes = Math.round(lastDuration / 60); let closest:number = ATTACK_PRESETS[1].minutes; ATTACK_PRESETS.forEach(preset=>{if(Math.abs(preset.minutes - lastMinutes) < Math.abs(closest - lastMinutes)){closest = preset.minutes;}}); return closest;},[historyQuery.history]); const leaderboard = useMemo(()=>{const parsed = ContributorsSchema.safeParse(encounter); const contributors = parsed.success ? parsed.data.contributors ?? [] : []; const rows = contributors.length > 0 ? contributors.map(item=>({damage:item.damageDealt ?? item.damage ?? 0,name:item.name ?? (item.userId === userId ? 'You' : `Hunter ${item.userId.slice(0,4)}`),userId:item.userId})) : [{damage:userDamage,name:'You',userId}]; return rows.sort((left,right)=>right.damage - left.damage).slice(0,5);},[encounter,userDamage,userId]); useEffect(()=>{setSelectedMinutes(initialMinutes);},[initialMinutes]); return<>
      <View style={cardStyle(theme)}>
        <Text variant="h4"color={theme.colors.text.primary}>Live Combat Preview</Text>
        <Text variant="bodySmall"color={theme.colors.text.secondary}>This is how your next session will play out</Text>
        <View style={{borderRadius:theme.borderRadius.xl,overflow:'hidden',backgroundColor:theme.colors.background.primary}}>
          <RealTimeBossCombat encounter={demoEncounter}elapsedSeconds={elapsedSeconds}purityScore={purityScore}isPaused={!isFocused}/>
        </View>
      </View>
      <View style={cardStyle(theme)}>
        <Text variant="h4"color={theme.colors.text.primary}>Attack History</Text>
        {historyQuery.isLoading ? <Text variant="bodySmall"color={theme.colors.text.secondary}>Loading your latest hits...</Text> : null}
        {historyQuery.error ? <Text variant="bodySmall"color={theme.colors.error.DEFAULT}>We could not load your recent attacks right now.</Text> : null}
        {!historyQuery.isLoading && !historyQuery.error && recentAttacks.length === 0 ? <Text variant="bodySmall"color={theme.colors.text.secondary}>No boss damage recorded in the last 7 days yet.</Text> : null}
        {recentAttacks.map(entry=><View key={`${entry.endedAt}-${entry.damage}`}style={{alignItems:'center',flexDirection:'row',justifyContent:'space-between'}}>
            <View style={{gap:theme.spacing[1]}}>
              <Text variant="body"color={theme.colors.text.primary}>{formatDate(entry.endedAt)}</Text>
              <Text variant="caption"color={theme.colors.text.secondary}>{`${formatDuration(entry.duration)} • Purity ${entry.purity}`}</Text>
            </View>
            <Text variant="h4"color={theme.colors.error.DEFAULT}>{entry.damage}</Text>
          </View>)}
      </View>
      <View style={cardStyle(theme)}>
        <Text variant="h4"color={theme.colors.text.primary}>Attack Now</Text>
        <Text variant="bodySmall"color={theme.colors.text.secondary}>Strike before the weekly reset and turn your streak into raw damage.</Text>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
          <View><Text variant="caption"color={theme.colors.text.secondary}>Your total damage</Text><Text variant="h3"color={theme.colors.text.primary}>{userDamage.toLocaleString()}</Text></View>
          <View style={{alignItems:'flex-end'}}><Text variant="caption"color={theme.colors.text.secondary}>Streak multiplier</Text><Text variant="h3"color={theme.colors.primary[500]}>{`x${streakMultiplier.toFixed(2)}`}</Text></View>
        </View>
        <View style={{backgroundColor:theme.colors.background.primary,borderRadius:theme.borderRadius.xl,padding:theme.spacing[4]}}>
          <Text variant="caption"color={theme.colors.text.secondary}>Estimated damage preview</Text>
          <Text variant="h2"color={theme.colors.error.DEFAULT}>{estimateDamage(selectedMinutes,streakMultiplier)}</Text>
          <Text variant="bodySmall"color={theme.colors.text.secondary}>{`Based on your recent ${selectedMinutes} minute rhythm.`}</Text>
        </View>
        {ATTACK_PRESETS.map(preset=>{const selected = preset.minutes === selectedMinutes; return<Pressable key={preset.minutes}onPress={()=>selected ? onLaunchAttack(preset.minutes) : setSelectedMinutes(preset.minutes)}style={{backgroundColor:selected ? theme.colors.primary[500] : theme.colors.background.primary,borderColor:selected ? theme.colors.primary[500] : theme.colors.border.light,borderRadius:theme.borderRadius.xl,borderWidth:1,gap:theme.spacing[1],padding:theme.spacing[4]}}accessibilityLabel="est. damage`} button"accessibilityRole="button"accessibilityHint="Activates this control">
              <Text variant="body"color={selected ? theme.colors.text.inverse : theme.colors.text.primary}>{preset.label}</Text>
              <Text variant="bodySmall"color={selected ? theme.colors.text.inverse : theme.colors.text.secondary}>{`${estimateDamage(preset.minutes,streakMultiplier)} est. damage`}</Text>
              {selected ? <Text variant="label"color={theme.colors.text.inverse}>Launch Attack →</Text> : null}
            </Pressable>;})}
      </View>
      {activeSquad ? <View style={cardStyle(theme)}>
          <Text variant="h4"color={theme.colors.text.primary}>Squad Damage Board</Text>
          <Text variant="bodySmall"color={theme.colors.text.secondary}>{`${activeSquad.name} is in the fight this week.`}</Text>
          {leaderboard.map((entry,index)=><View key={`${entry.userId}-${index}`}style={{alignItems:'center',flexDirection:'row',justifyContent:'space-between'}}>
              <View style={{alignItems:'center',flexDirection:'row',gap:theme.spacing[3]}}>
                <Text variant="label"color={theme.colors.text.secondary}>{`${index + 1}`}</Text>
                <View style={{alignItems:'center',backgroundColor:theme.colors.primary[100],borderRadius:999,height:32,justifyContent:'center',width:32}}>
                  <Text variant="label"color={theme.colors.primary[700]}>{entry.name.slice(0,1).toUpperCase()}</Text>
                </View>
                <Text variant="body"color={theme.colors.text.primary}>{entry.name}</Text>
              </View>
              <Text variant="h4"color={theme.colors.text.primary}>{entry.damage}</Text>
            </View>)}
          <Pressable onPress={onOpenSquad}style={{alignItems:'center',borderColor:theme.colors.border.light,borderRadius:theme.borderRadius.xl,borderWidth:1,padding:theme.spacing[4]}}accessibilityLabel="Open squad button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text variant="label"color={theme.colors.text.primary}>Open squad</Text>
          </Pressable>
        </View> : null}
    </>;}
