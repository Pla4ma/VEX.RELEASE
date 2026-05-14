import React from'react';import{Pressable,ScrollView}from'react-native';import Animated,{useAnimatedStyle,withRepeat,withSequence,withTiming}from'react-native-reanimated';import{Box}from'../../../components/primitives/Box';import{Text}from'../../../components/primitives/Text';import{Button}from'../../../components/primitives/Button';import{useTheme}from'../../../theme';export interface SquadMember{userId:string;name:string;avatarUrl?:string;status:'done'|'pending'|'focusing';sessionDuration?:number;currentSessionStart?:number;isMe?:boolean;}export interface SquadLiveDashboardProps{squadName:string;streakDays:number;members:SquadMember[];onFocusTogether:()=>void;onNudgeMember?:(userId:string)=>void;onViewMember?:(userId:string)=>void;}function SquadStreak({days}:{days:number;}):JSX.Element{const flameStyle=useAnimatedStyle(()=>({transform:[{scale:withRepeat(withSequence(withTiming(1.1,{duration:800}),withTiming(1,{duration:800})),-1,true)}]}));return<Box flexDirection="row"alignItems="center"gap="sm">
      <Animated.View style={flameStyle}>
        <Text fontSize={32}>🔥</Text>
      </Animated.View>
      <Box>
        <Text variant="h3"color="accent.orange"fontWeight="800">
          {days}-Day Squad Streak
        </Text>
        <Text variant="caption"color="text.tertiary">
          Every member has focused today!
        </Text>
      </Box>
    </Box>;}function MemberStatus({status,duration}:{status:SquadMember['status'];duration?:number;}):JSX.Element{const{theme}=useTheme();if(status==='done'){return<Box flexDirection="row"alignItems="center"gap="xs">
        <Text fontSize={16}>✅</Text>
        <Text variant="bodySmall"color="success.DEFAULT"fontWeight="600">
          Done · {duration}m
        </Text>
      </Box>;}if(status==='focusing'){return<Box flexDirection="row"alignItems="center"gap="xs">
        <Animated.View style={{width:8,height:8,borderRadius:4,backgroundColor:theme.colors.accent.orange}}/>
        <Text variant="bodySmall"color="accent.orange"fontWeight="700">
          🔥 Focusing now
        </Text>
      </Box>;}return<Box flexDirection="row"alignItems="center"gap="xs">
      <Text fontSize={16}>⏳</Text>
      <Text variant="bodySmall"color="text.tertiary">
        Not yet today
      </Text>
    </Box>;}function SquadMemberCard({member,onNudge,onView}:{member:SquadMember;onNudge?:(userId:string)=>void;onView?:(userId:string)=>void;}):JSX.Element{const{theme}=useTheme();const initial=member.name.charAt(0).toUpperCase();const canNudge=member.status==='pending'&&!member.isMe&&onNudge;return<Pressable onPress={()=>onView?.(member.userId)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
      <Box flexDirection="row"alignItems="center"justifyContent="space-between"p="md"borderRadius="xl"bg={member.isMe?`${theme.colors.primary[500]}15`:'background.secondary'}borderWidth={1}borderColor={member.isMe?'primary.500':'border.light'}mb="sm">
        <Box flexDirection="row"alignItems="center"gap="md">
          {}
          <Box width={48}height={48}borderRadius="full"bg={member.isMe?'primary.500':'background.tertiary'}justifyContent="center"alignItems="center">
            {member.avatarUrl?<Box width={44}height={44}borderRadius="full"bg="primary.500"/>:<Text fontSize={18}color={member.isMe?'text.inverse':'text.tertiary'}fontWeight="600">
                {initial}
              </Text>}
          </Box>

          {}
          <Box>
            <Box flexDirection="row"alignItems="center"gap="sm">
              <Text variant="body"color="text.primary"fontWeight="600">
                {member.name}
              </Text>
              {member.isMe&&<Box px="xs"py="xs"borderRadius="sm"bg="primary.500">
                  <Text variant="caption"color="text.inverse"fontSize={10}>
                    YOU
                  </Text>
                </Box>}
            </Box>
            <MemberStatus status={member.status}duration={member.sessionDuration}/>
          </Box>
        </Box>

        {}
        {canNudge&&<Pressable onPress={()=>onNudge?.(member.userId)}accessibilityLabel="Nudge ⚡ button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Box px="md"py="sm"borderRadius="lg"bg="accent.orange">
              <Text variant="caption"color="text.inverse"fontWeight="700">
                Nudge ⚡
              </Text>
            </Box>
          </Pressable>}

        {}
        {member.status==='focusing'&&<Text fontSize={20}>🔥</Text>}
      </Box>
    </Pressable>;}export function SquadLiveDashboard({squadName,streakDays,members,onFocusTogether,onNudgeMember,onViewMember}:SquadLiveDashboardProps):JSX.Element{const{theme}=useTheme();const focusingCount=members.filter(m=>m.status==='focusing').length;const doneCount=members.filter(m=>m.status==='done').length;return<Box flex={1}bg="background.primary">
      <ScrollView contentContainerStyle={{padding:20,paddingBottom:100}}showsVerticalScrollIndicator={false}>
        {}
        <Box alignItems="center"mb="lg">
          <Text variant="label"color="text.tertiary">
            SQUAD
          </Text>
          <Text variant="h2"color="text.primary">
            {squadName}
          </Text>
        </Box>

        {}
        <Box p="lg"borderRadius="xl"bg="background.secondary"mb="lg"alignItems="center">
          <SquadStreak days={streakDays}/>
        </Box>

        {}
        <Box flexDirection="row"justifyContent="center"gap="lg"mb="lg">
          <Box alignItems="center">
            <Text variant="h3"color="text.primary"fontWeight="700">
              {doneCount}
            </Text>
            <Text variant="caption"color="text.tertiary">
              Done today
            </Text>
          </Box>
          <Box alignItems="center">
            <Text variant="h3"color="accent.orange"fontWeight="700">
              {focusingCount}
            </Text>
            <Text variant="caption"color="text.tertiary">
              Focusing now
            </Text>
          </Box>
          <Box alignItems="center">
            <Text variant="h3"color="text.tertiary"fontWeight="700">
              {members.length-doneCount-focusingCount}
            </Text>
            <Text variant="caption"color="text.tertiary">
              Not yet
            </Text>
          </Box>
        </Box>

        {}
        <Box mb="lg">
          <Text variant="label"color="text.tertiary"mb="sm">
            SQUAD MEMBERS
          </Text>
          {members.map(member=><SquadMemberCard key={member.userId}member={member}onNudge={onNudgeMember}onView={onViewMember}/>)}
        </Box>
      </ScrollView>

      {}
      <Box position="absolute"bottom={0}left={0}right={0}p="lg"bg={`${theme.colors.background.primary}F0`}>
        <Button variant="primary"size="lg"fullWidth onPress={onFocusTogether}accessibilityLabel="🔥 Focus Together button"accessibilityRole="button"accessibilityHint="Activates this control">
          🔥 Focus Together
        </Button>
      </Box>
    </Box>;}export default SquadLiveDashboard;
