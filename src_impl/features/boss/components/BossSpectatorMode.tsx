import React,{useState,useCallback,useEffect}from'react'; import{Pressable}from'react-native'; import Animated,{useAnimatedStyle,withSpring,withSequence,withTiming,FadeIn,FadeOut}from'react-native-reanimated'; import{Box}from'../../../components/primitives/Box'; import{Text}from'../../../components/primitives/Text'; import{Avatar}from'../../../components/Avatar'; import{Button}from'../../../components/primitives/Button'; import{useTheme}from'../../../theme'; export interface SpectatorBossData{id:string;name:string;currentHealth:number;maxHealth:number;tier:number;icon:string;timeRemainingSeconds:number;}export interface Contributor{userId:string;name:string;avatar?:string;damage:number;sessionDuration:number;isActive:boolean;}export interface CheerMessage{id:string;userId:string;name:string;emoji:string;message:string;timestamp:number;}interface BossSpectatorModeProps{boss:SpectatorBossData;contributors:Contributor[];spectatorUserId:string;spectatorName:string;onCheer?:(cheer:{emoji:string;message:string;})=>void;onJoinFight?:()=>void;onClose?:()=>void;}const CHEER_OPTIONS:Array<{emoji:string;message:string;sound?:string;}> = [{emoji:'🔥',message:'Burn it down!'},{emoji:'⚔️',message:'Strike true!'},{emoji:'💪',message:'You got this!'},{emoji:'🎯',message:'Focus up!'},{emoji:'🌟',message:'Epic battle!'},{emoji:'🍀',message:'Good luck!'}]; function FloatingCheer({cheer,onComplete}:{cheer:CheerMessage;onComplete:()=>void;}):JSX.Element{const animatedStyle = useAnimatedStyle(()=>({transform:[{translateY:withSequence(withTiming(-20,{duration:100}),withTiming(-100,{duration:1500}))},{translateX:withTiming(Math.random() * 40 - 20,{duration:1500})}],opacity:withSequence(withTiming(1,{duration:100}),withTiming(0,{duration:1500}))})); useEffect(()=>{const timer = setTimeout(onComplete,1600); return()=>clearTimeout(timer);},[onComplete]); return<Animated.View style={[{position:'absolute',bottom:100,left:`${Math.random() * 60 + 20}%`,zIndex:100},animatedStyle]}>
      <Box px="md"py="sm"borderRadius="full"bg="background.secondary"style={{shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.1,shadowRadius:4,elevation:3}}flexDirection="row"alignItems="center"gap="sm">
        <Text fontSize={16}>{cheer.emoji}</Text>
        <Text variant="caption"color="text.primary"fontWeight="500">
          {cheer.name}
        </Text>
      </Box>
    </Animated.View>;}function BossHealthBar({current,max,tier}:{current:number;max:number;tier:number;}):JSX.Element{const percentage = Math.max(0,Math.min(100,current / max * 100)); const tierColors = ['#22C55E','#3B82F6','#A855F7','#F97316','#EF4444','#DC2626']; const healthColor = tierColors[tier - 1] ?? tierColors[0]; const animatedStyle = useAnimatedStyle(()=>({width:withSpring(`${percentage}%`,{damping:15,stiffness:100})})); return<Box gap="sm">
      <Box flexDirection="row"justifyContent="space-between">
        <Text variant="caption"color="text.secondary">
          Boss Health
        </Text>
        <Text variant="caption"color="text.primary"fontWeight="600">
          {Math.round(current)} / {max} HP
        </Text>
      </Box>

      <Box height={16}borderRadius="full"bg="background.tertiary"style={{overflow:'hidden'}}>
        <Animated.View style={[{height:16,borderRadius:8,backgroundColor:healthColor},animatedStyle]}/>
      </Box>

      <Text variant="caption"color={healthColor}textAlign="center"fontWeight="600">
        {percentage > 50 ? 'The boss stands strong!' : percentage > 25 ? 'The boss is weakening!' : 'Victory is near!'}
      </Text>
    </Box>;}function EscapeTimer({seconds}:{seconds:number;}):JSX.Element{const formatTime = (totalSeconds:number):string=>{const hours = Math.floor(totalSeconds / 3600); const minutes = Math.floor(totalSeconds % 3600 / 60); const secs = totalSeconds % 60; if(hours > 0){return`${hours}h ${minutes}m`;}return`${minutes}m ${secs.toString().padStart(2,'0')}s`;}; const isCritical = seconds < 300; return<Box flexDirection="row"alignItems="center"gap="sm"px="md"py="sm"borderRadius="lg"style={{backgroundColor:isCritical ? '#EF444420' : '#F59E0B20'}}>
      <Text fontSize={16}>⏰</Text>
      <Box>
        <Text variant="caption"color="text.secondary">
          Escapes in:
        </Text>
        <Text variant="body"color={isCritical ? 'error.DEFAULT' : 'warning.DEFAULT'}fontWeight="700">
          {formatTime(seconds)}
        </Text>
      </Box>
    </Box>;}function ContributorRow({contributor,rank}:{contributor:Contributor;rank:number;}):JSX.Element{const rankEmojis = ['🥇','🥈','🥉']; return<Box flexDirection="row"alignItems="center"gap="md"p="md"borderRadius="lg"bg="background.secondary">
      {}
      <Box width={32}alignItems="center">
        {rank <= 3 ? <Text fontSize={20}>{rankEmojis[rank - 1]}</Text> : <Text variant="body"color="text.tertiary"fontWeight="600">
            #{rank}
          </Text>}
      </Box>

      {}
      <Avatar size="sm"source={contributor.avatar ? {uri:contributor.avatar} : undefined}name={contributor.name}/>

      {}
      <Box flex={1}>
        <Box flexDirection="row"alignItems="center"gap="sm">
          <Text variant="body"color="text.primary"fontWeight="600"numberOfLines={1}>
            {contributor.name}
          </Text>
          {contributor.isActive && <Box width={8}height={8}borderRadius="full"bg="success.DEFAULT"/>}
        </Box>
        <Text variant="caption"color="text.tertiary">
          {Math.floor(contributor.sessionDuration / 60)}m session
        </Text>
      </Box>

      {}
      <Box alignItems="flex-end">
        <Text variant="body"color="error.DEFAULT"fontWeight="700">
          ⚔️ {contributor.damage}
        </Text>
        <Text variant="caption"color="text.tertiary">
          damage
        </Text>
      </Box>
    </Box>;}function CheerSelector({onCheer}:{onCheer:(cheer:(typeof CHEER_OPTIONS)[0])=>void;}):JSX.Element{return<Box gap="sm">
      <Text variant="caption"color="text.secondary"textAlign="center">
        Send a cheer!
      </Text>

      <Box flexDirection="row"flexWrap="wrap"justifyContent="center"gap="sm">
        {CHEER_OPTIONS.map((cheer,index)=><Pressable key={index}onPress={()=>onCheer(cheer)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Box px="md"py="sm"borderRadius="full"bg="background.tertiary"style={{shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.1,shadowRadius:2,elevation:2}}>
              <Text fontSize={20}>{cheer.emoji}</Text>
            </Box>
          </Pressable>)}
      </Box>
    </Box>;}export function BossSpectatorMode({boss,contributors,spectatorUserId,spectatorName,onCheer,onJoinFight,onClose}:BossSpectatorModeProps):JSX.Element{const{theme} = useTheme(); const[activeCheers,setActiveCheers] = useState<CheerMessage[]>([]); const sortedContributors = [...contributors].sort((a,b)=>b.damage - a.damage); const handleCheer = useCallback((cheerOption:(typeof CHEER_OPTIONS)[0])=>{const newCheer:CheerMessage = {id:Math.random().toString(36).substr(2,9),userId:spectatorUserId,name:spectatorName,emoji:cheerOption.emoji,message:cheerOption.message,timestamp:Date.now()}; setActiveCheers(prev=>[...prev,newCheer]); onCheer?.(cheerOption);},[spectatorUserId,spectatorName,onCheer]); const removeCheer = useCallback((id:string)=>{setActiveCheers(prev=>prev.filter(c=>c.id !== id));},[]); return<Box flex={1}bg="background.primary">
      {}
      <Box flexDirection="row"alignItems="center"justifyContent="space-between"p="md"style={{borderBottomWidth:1,borderBottomColor:theme.colors.border.light}}>
        <Box>
          <Text variant="caption"color="text.secondary">
            SPECTATOR MODE
          </Text>
          <Text variant="h3"color="text.primary"fontWeight="700">
            Live Boss Fight
          </Text>
        </Box>
        <Pressable onPress={onClose}accessibilityLabel="✕ button"accessibilityRole="button"accessibilityHint="Activates this control">
          <Box p="sm"borderRadius="full"bg="background.secondary">
            <Text fontSize={20}>✕</Text>
          </Box>
        </Pressable>
      </Box>

      {}
      <Box flex={1}p="lg"gap="lg">
        {}
        <Box alignItems="center"gap="md">
          <Box width={120}height={120}borderRadius="full"justifyContent="center"alignItems="center"bg="background.secondary"style={{shadowColor:'#EF4444',shadowOffset:{width:0,height:4},shadowOpacity:0.2,shadowRadius:8,elevation:4}}>
            <Text fontSize={64}>{boss.icon}</Text>
          </Box>

          <Box alignItems="center">
            <Text variant="h2"color="text.primary"fontWeight="800">
              {boss.name}
            </Text>
            <Text variant="caption"color="text.secondary">
              Tier {boss.tier} Boss
            </Text>
          </Box>
        </Box>

        {}
        <BossHealthBar current={boss.currentHealth}max={boss.maxHealth}tier={boss.tier}/>

        {}
        <EscapeTimer seconds={boss.timeRemainingSeconds}/>

        {}
        <Box>
          <Text variant="body"color="text.primary"fontWeight="600"mb="md">
            Top Contributors ({contributors.length})
          </Text>

          <Box gap="sm">
            {sortedContributors.slice(0,5).map((contributor,index)=><ContributorRow key={contributor.userId}contributor={contributor}rank={index + 1}/>)}
          </Box>
        </Box>

        {}
        <CheerSelector onCheer={handleCheer}/>
      </Box>

      {}
      {activeCheers.map(cheer=><FloatingCheer key={cheer.id}cheer={cheer}onComplete={()=>removeCheer(cheer.id)}/>)}

      {}
      <Box p="lg"bg="background.secondary"style={{borderTopWidth:1,borderTopColor:theme.colors.border.light}}>
        <Button variant="primary"size="lg"onPress={onJoinFight}fullWidth accessibilityLabel="⚔️ Join the Fight! button"accessibilityRole="button"accessibilityHint="Activates this control">
          ⚔️ Join the Fight!
        </Button>
      </Box>
    </Box>;}export default BossSpectatorMode;
