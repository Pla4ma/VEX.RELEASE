import React,{useState,useCallback}from'react'; import{ScrollView,Pressable,Switch,Alert}from'react-native'; import{useSafeAreaInsets}from'react-native-safe-area-context'; import type{NativeStackScreenProps}from'@react-navigation/native-stack'; import{useTheme}from'../../theme'; import{Box,Text,Card}from'../../components/primitives'; import{Icon}from'../../icons'; import{useUIStore}from'../../store/index'; import type{SettingsStackParams}from'../../navigation'; type Props=NativeStackScreenProps<SettingsStackParams,'NotificationSettings'>;interface NotificationToggle{id:string;icon:string;title:string;description:string;enabled:boolean;}interface QuietHours{enabled:boolean;start:string;end:string;}export const NotificationSettingsScreen:React.FC<Props> = ({navigation})=>{const{theme} = useTheme(); const insets = useSafeAreaInsets(); const{showToast} = useUIStore(); const[toggles,setToggles] = useState<Record<string,boolean>>({streakReminders:true,bossAlerts:true,squadNotifications:true,rivalNotifications:true,weeklyReport:true,coachMessages:true,achievementUnlocks:true,sessionReminders:true,dailyChallenge:true}); const[quietHours,setQuietHours] = useState<QuietHours>({enabled:false,start:'22:00',end:'08:00'}); const handleToggle = useCallback((id:string)=>{setToggles(prev=>({...prev,[id]:!prev[id]}));},[]); const handleQuietHoursToggle = useCallback(()=>{setQuietHours(prev=>({...prev,enabled:!prev.enabled}));},[]); const handleSetQuietHours = useCallback((type:'start'|'end')=>{Alert.alert(`Set ${type === 'start' ? 'Start' : 'End'} Time`,'Choose a time',[{text:'20:00',onPress:()=>updateQuietTime(type,'20:00')},{text:'21:00',onPress:()=>updateQuietTime(type,'21:00')},{text:'22:00',onPress:()=>updateQuietTime(type,'22:00')},{text:'23:00',onPress:()=>updateQuietTime(type,'23:00')},{text:'Cancel',style:'cancel'}]);},[]); const updateQuietTime = (type:'start'|'end',time:string)=>{setQuietHours(prev=>({...prev,[type]:time}));}; const handleSendTestNotification = useCallback(()=>{showToast({message:'Test notification sent! Check your device.',type:'success',duration:3000});},[showToast]); const notificationGroups:{title:string;items:NotificationToggle[];}[] = [{title:'Core Notifications',items:[{id:'streakReminders',icon:'flame',title:'Streak Reminders',description:'Get alerted when your streak is at risk',enabled:toggles.streakReminders},{id:'sessionReminders',icon:'clock',title:'Session Reminders',description:'Daily prompts to start a focus session',enabled:toggles.sessionReminders}]},{title:'Game Notifications',items:[{id:'bossAlerts',icon:'target',title:'Boss Alerts',description:'Boss spawn, timeout warnings, and defeat',enabled:toggles.bossAlerts},{id:'squadNotifications',icon:'users',title:'Squad Activity',description:'Squad invites, wars, and member activity',enabled:toggles.squadNotifications},{id:'rivalNotifications',icon:'zap',title:'Rival Challenges',description:'New challenges and duel results',enabled:toggles.rivalNotifications},{id:'dailyChallenge',icon:'calendar',title:'Daily Challenges',description:'New challenges and completion reminders',enabled:toggles.dailyChallenge}]},{title:'Progress & Social',items:[{id:'achievementUnlocks',icon:'award',title:'Achievement Unlocks',description:'Celebrate when you earn achievements',enabled:toggles.achievementUnlocks},{id:'coachMessages',icon:'message-circle',title:'AI Coach Messages',description:'Tips, encouragement, and insights',enabled:toggles.coachMessages},{id:'weeklyReport',icon:'bar-chart-2',title:'Weekly Report',description:'Summary of your week every Monday',enabled:toggles.weeklyReport}]}]; const renderToggleItem = (item:NotificationToggle)=>{const iconColor = toggles[item.id] ? theme.colors.primary[500] : theme.colors.text.tertiary; return<Pressable key={item.id}style={{flexDirection:'row',alignItems:'center',paddingVertical:16,paddingHorizontal:16}}onPress={()=>handleToggle(item.id)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
        <Box width={40}height={40}borderRadius={10}justifyContent="center"alignItems="center"style={{backgroundColor:toggles[item.id] ? theme.colors.primary[50] : theme.colors.background.secondary}}>
          <Icon name={item.icon}size={20}color={iconColor}/>
        </Box>

        <Box flex={1}ml={12}>
          <Text variant="body"style={{fontWeight:'500',color:theme.colors.text.primary}}>
            {item.title}
          </Text>
          <Text variant="caption"color="text.secondary"style={{marginTop:2}}>
            {item.description}
          </Text>
        </Box>

        <Switch value={toggles[item.id]}onValueChange={()=>handleToggle(item.id)}trackColor={{false:theme.colors.background.tertiary,true:theme.colors.primary[500] + '80'}}thumbColor={toggles[item.id] ? theme.colors.primary[500] : '#FFF'}/>
      </Pressable>;}; return<Box flex={1}style={{backgroundColor:theme.colors.background.primary}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <Box px={20}pb={16}pt={insets.top + 16}flexDirection="row"alignItems="center">
          <Pressable onPress={()=>navigation.goBack()}style={{marginRight:12}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Icon name="arrow-left"size={24}color={theme.colors.text.primary}/>
          </Pressable>
          <Text variant="h2">Notifications</Text>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            QUIET HOURS
          </Text>
          <Card size="sm"style={{overflow:'hidden'}}>
            {}
            <Pressable style={{flexDirection:'row',alignItems:'center',paddingVertical:16,paddingHorizontal:16}}onPress={handleQuietHoursToggle}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
              <Box width={40}height={40}borderRadius={10}justifyContent="center"alignItems="center"style={{backgroundColor:quietHours.enabled ? theme.colors.primary[50] : theme.colors.background.secondary}}>
                <Icon name="moon"size={20}color={quietHours.enabled ? theme.colors.primary[500] : theme.colors.text.tertiary}/>
              </Box>

              <Box flex={1}ml={12}>
                <Text variant="body"style={{fontWeight:'500',color:theme.colors.text.primary}}>
                  Quiet Hours
                </Text>
                <Text variant="caption"color="text.secondary"style={{marginTop:2}}>
                  No notifications during this time
                </Text>
              </Box>

              <Switch value={quietHours.enabled}onValueChange={handleQuietHoursToggle}trackColor={{false:theme.colors.background.tertiary,true:theme.colors.primary[500] + '80'}}thumbColor={quietHours.enabled ? theme.colors.primary[500] : '#FFF'}/>
            </Pressable>

            {}
            {quietHours.enabled && <>
                <Box height={1}style={{backgroundColor:theme.colors.border.light}}/>
                <Box flexDirection="row"px={16}py={12}>
                  <Pressable style={{flex:1,marginRight:8}}onPress={()=>handleSetQuietHours('start')}accessibilityLabel="Start button"accessibilityRole="button"accessibilityHint="Activates this control">
                    <Box p={12}borderRadius={8}style={{backgroundColor:theme.colors.background.secondary,borderWidth:1,borderColor:theme.colors.border.light}}>
                      <Text variant="caption"color="text.secondary">
                        Start
                      </Text>
                      <Text variant="body"style={{fontWeight:'600',marginTop:4}}>
                        {quietHours.start}
                      </Text>
                    </Box>
                  </Pressable>
                  <Box justifyContent="center">
                    <Icon name="arrow-right"size={16}color={theme.colors.text.tertiary}/>
                  </Box>
                  <Pressable style={{flex:1,marginLeft:8}}onPress={()=>handleSetQuietHours('end')}accessibilityLabel="End button"accessibilityRole="button"accessibilityHint="Activates this control">
                    <Box p={12}borderRadius={8}style={{backgroundColor:theme.colors.background.secondary,borderWidth:1,borderColor:theme.colors.border.light}}>
                      <Text variant="caption"color="text.secondary">
                        End
                      </Text>
                      <Text variant="body"style={{fontWeight:'600',marginTop:4}}>
                        {quietHours.end}
                      </Text>
                    </Box>
                  </Pressable>
                </Box>
              </>}
          </Card>
        </Box>

        {}
        {notificationGroups.map(group=><Box key={group.title}px={16}mb={24}>
            <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
              {group.title.toUpperCase()}
            </Text>
            <Card size="sm"style={{overflow:'hidden'}}>
              {group.items.map((item,index)=><React.Fragment key={item.id}>
                  {renderToggleItem(item)}
                  {index < group.items.length - 1 && <Box height={1}ml={68}style={{backgroundColor:theme.colors.border.light}}/>}
                </React.Fragment>)}
            </Card>
          </Box>)}

        {}
        <Box px={16}mb={24}>
          <Pressable onPress={handleSendTestNotification}style={{backgroundColor:theme.colors.primary[500],paddingVertical:16,borderRadius:12,alignItems:'center'}}accessibilityLabel="Send Test Notification button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Box flexDirection="row"alignItems="center">
              <Icon name="bell"size={18}color="#FFF"/>
              <Text style={{color:'#FFF',fontWeight:'600',fontSize:16,marginLeft:8}}>
                Send Test Notification
              </Text>
            </Box>
          </Pressable>
        </Box>

        <Box height={insets.bottom + 20}/>
      </ScrollView>
    </Box>;}; export default NotificationSettingsScreen;
