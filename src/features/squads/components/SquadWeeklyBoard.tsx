import React from'react'; import{ScrollView}from'react-native'; import Animated,{FadeInUp}from'react-native-reanimated'; import{Box}from'../../../components/primitives/Box'; import{Text}from'../../../components/primitives/Text'; import{useTheme}from'../../../theme';
import { launchColors } from '@theme/tokens/launch-colors';
 export interface SquadLeaderboardEntry{userId:string;name:string;avatarUrl?:string;focusMinutes:number;sessionsCompleted:number;rank:number;deltaFromLastWeek:number;isMe:boolean;}export interface SquadWeeklyBoardProps{entries:SquadLeaderboardEntry[];squadName:string;weekNumber:number;}function RankBadge({rank}:{rank:number;}):JSX.Element{const{theme} = useTheme(); const getRankStyle = ()=>{if(rank === 1){return{bg:launchColors.hex_f59e0b,text:launchColors.hex_ffffff};}if(rank === 2){return{bg:launchColors.hex_6b7280,text:launchColors.hex_ffffff};}if(rank === 3){return{bg:launchColors.hex_b45309,text:launchColors.hex_ffffff};}return{bg:theme.colors.background.tertiary,text:theme.colors.text.secondary};}; const style = getRankStyle(); return<Box width={36}height={36}borderRadius="full"justifyContent="center"alignItems="center"style={{backgroundColor:style.bg}}>
      <Text fontSize={16}color={style.text}fontWeight="800">
        {rank === 1 ? '👑' : rank}
      </Text>
    </Box>;}function RankDelta({delta}:{delta:number;}):JSX.Element{if(delta === 0){return<Text variant="caption"color="text.tertiary">
        =
      </Text>;}const isUp = delta > 0; return<Box flexDirection="row"alignItems="center">
      <Text variant="caption"color={isUp ? 'success.DEFAULT' : 'error.DEFAULT'}>
        {isUp ? '↑' : '↓'} {Math.abs(delta)}
      </Text>
    </Box>;}function MVPBadge():JSX.Element{return<Box px="sm"py="xs"borderRadius="full"bg="accent.purple"flexDirection="row"alignItems="center"gap="xs">
      <Text fontSize={12}>⭐</Text>
      <Text variant="caption"color="text.inverse"fontWeight="700"fontSize={10}>
        MVP
      </Text>
    </Box>;}function LeaderboardRow({entry,index}:{entry:SquadLeaderboardEntry;index:number;}):JSX.Element{const{theme} = useTheme(); const isTop3 = entry.rank <= 3; return<Animated.View entering={FadeInUp.duration(400).delay(index * 50)}>
      <Box flexDirection="row"alignItems="center"p="md"borderRadius="xl"bg={entry.isMe ? `${theme.colors.primary[500]}15` : 'background.secondary'}borderWidth={2}borderColor={entry.isMe ? 'primary.500' : isTop3 ? 'accent.orange' : 'transparent'}mb="sm">
        {}
        <RankBadge rank={entry.rank}/>

        {}
        <Box width={44}height={44}borderRadius="full"bg="background.tertiary"justifyContent="center"alignItems="center"mx="md">
          {entry.avatarUrl ? <Box width={40}height={40}borderRadius="full"bg="primary.500"/> : <Text fontSize={18}color="text.tertiary"fontWeight="600">
              {entry.name.charAt(0).toUpperCase()}
            </Text>}
        </Box>

        {}
        <Box flex={1}>
          <Box flexDirection="row"alignItems="center"gap="sm">
            <Text variant="body"color="text.primary"fontWeight={entry.isMe ? '700' : '600'}>
              {entry.name}
            </Text>
            {entry.isMe && <Box px="xs"py="xs"borderRadius="sm"bg="primary.500">
                <Text variant="caption"color="text.inverse"fontSize={10}>
                  YOU
                </Text>
              </Box>}
            {entry.rank === 1 && <MVPBadge/>}
          </Box>
          <Text variant="caption"color="text.tertiary">
            {entry.sessionsCompleted} sessions · {entry.focusMinutes}m
          </Text>
        </Box>

        {}
        <RankDelta delta={entry.deltaFromLastWeek}/>
      </Box>
    </Animated.View>;}export function SquadWeeklyBoard({entries,squadName,weekNumber}:SquadWeeklyBoardProps):JSX.Element{const{theme} = useTheme(); const sortedEntries = [...entries].sort((a,b)=>a.rank - b.rank); const myEntry = entries.find(e=>e.isMe); return<Box flex={1}bg="background.primary">
      <ScrollView contentContainerStyle={{padding:20}}showsVerticalScrollIndicator={false}>
        {}
        <Box alignItems="center"mb="lg">
          <Text variant="label"color="text.tertiary">
            WEEK {weekNumber}
          </Text>
          <Text variant="h2"color="text.primary">
            {squadName} Leaderboard
          </Text>
        </Box>

        {}
        {myEntry && <Box p="lg"borderRadius="xl"bg={`${theme.colors.primary[500]}15`}borderWidth={2}borderColor="primary.500"mb="lg"alignItems="center">
            <Text variant="caption"color="primary.500"fontWeight="700">
              YOUR POSITION
            </Text>
            <Text variant="hero"color="text.primary"fontWeight="800">
              #{myEntry.rank}
            </Text>
            <Text variant="body"color="text.secondary">
              of {entries.length} members
            </Text>
            <Box mt="sm">
              <RankDelta delta={myEntry.deltaFromLastWeek}/>
            </Box>
          </Box>}

        {}
        <Box>
          <Text variant="label"color="text.tertiary"mb="sm">
            THIS WEEK'S RANKINGS
          </Text>
          {sortedEntries.map((entry,index)=><LeaderboardRow key={entry.userId}entry={entry}index={index}/>)}
        </Box>

        {}
        <Box mt="xl"p="lg"borderRadius="lg"bg="background.secondary">
          <Text variant="caption"color="text.tertiary"mb="sm">
            HOW RANKING WORKS
          </Text>
          <Text variant="bodySmall"color="text.secondary">
            Rankings reset every Monday. Focus more minutes to climb the leaderboard and earn the Squad MVP badge!
          </Text>
        </Box>
      </ScrollView>
    </Box>;}export default SquadWeeklyBoard;
