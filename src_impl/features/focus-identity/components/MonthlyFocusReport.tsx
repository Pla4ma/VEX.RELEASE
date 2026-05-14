import React,{useMemo}from'react';import{View,Pressable,Share}from'react-native';import Animated,{useSharedValue,useAnimatedStyle,withSpring,withTiming,FadeIn,SlideInDown}from'react-native-reanimated';import{Text}from'../../../components/primitives/Text';import{Box}from'../../../components/primitives/Box';import{Button}from'../../../components/primitives/Button';import{useTheme}from'../../../theme';import{useMonthlyReport}from'../hooks';import{useFocusScoreColor}from'../hooks';import{publishMonthlyReportViewed,publishMonthlyReportShared,publishMonthlyReportDismissed}from'../events';interface MonthlyFocusReportProps{userId:string;onClose:()=>void;visible:boolean;}function MonthlyReportSkeleton():JSX.Element{const{theme}=useTheme();return<View style={{flex:1,backgroundColor:theme.colors.background.primary,paddingHorizontal:theme.spacing[6],paddingTop:theme.spacing[8]}}>
      <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:theme.spacing[4]}}>
        <View style={{width:200,height:32,backgroundColor:theme.colors.border?.DEFAULT||'#E5E5E5',borderRadius:4}}/>
        <View style={{width:32,height:32,backgroundColor:theme.colors.border?.DEFAULT||'#E5E5E5',borderRadius:16}}/>
      </View>
      <View style={{gap:theme.spacing[4]}}>
        <View style={{height:200,backgroundColor:theme.colors.surface?.card||'#F5F5F5',borderRadius:16}}/>
        <View style={{height:150,backgroundColor:theme.colors.surface?.card||'#F5F5F5',borderRadius:16}}/>
        <View style={{height:100,backgroundColor:theme.colors.surface?.card||'#F5F5F5',borderRadius:16}}/>
      </View>
    </View>;}export function MonthlyFocusReport({userId,onClose,visible}:MonthlyFocusReportProps){const{theme}=useTheme();const now=new Date();const year=now.getFullYear();const month=now.getMonth()+1;const{data:report,status:loadingState,error,refetch:refresh}=useMonthlyReport(userId,year,month);const[hasPublishedView,setHasPublishedView]=React.useState(false);React.useEffect(()=>{if(report&&!hasPublishedView){publishMonthlyReportViewed(userId,report.month,report.grade,report.change);setHasPublishedView(true);}},[report,hasPublishedView,userId]);const scale=useSharedValue(0.8);const opacity=useSharedValue(0);const scoreColor=useFocusScoreColor(report?.endingScore||null);React.useEffect(()=>{if(visible&&report){scale.value=withSpring(1,{damping:15,stiffness:400});opacity.value=withTiming(1,{duration:300});}},[visible,report,scale,opacity]);const animatedStyles=useAnimatedStyle(()=>({transform:[{scale:scale.value}],opacity:opacity.value}));const scoreDrivers=useMemo(()=>{if(!report){return[];}const drivers=[];if(report.sessionsCompleted>=15){drivers.push({name:'Consistency',value:'+23'});}else if(report.sessionsCompleted>=10){drivers.push({name:'Consistency',value:'+15'});}else if(report.sessionsCompleted>=5){drivers.push({name:'Consistency',value:'+8'});}if(report.change<0){drivers.push({name:'Boss Damage',value:String(report.change)});}if(report.grade==='A+'||report.grade==='A'){drivers.push({name:'Purity',value:'+11'});}else if(report.grade==='B+'||report.grade==='B'){drivers.push({name:'Purity',value:'+5'});}return drivers.slice(0,3);},[report]);const identityStatement=useMemo(()=>{if(!report){return'';}const statements:Record<string,string>={'A+':'You are a Focus Virtuoso. Your discipline inspires others.',A:'You are an Elite Performer. Excellence is your standard.','B+':'You have Exceptional Focus. You are building something great.',B:'You have Strong Focus. You are developing powerful habits.',C:'You have Good Focus. You are on the right path.',D:'You are Developing Focus. Every session makes you stronger.'};return statements[report.grade]||'Keep building your focus habit.';},[report]);const percentile=useMemo(()=>{if(!report){return 0;}if(report.endingScore>=800){return 99;}if(report.endingScore>=740){return 95;}if(report.endingScore>=670){return 85;}if(report.endingScore>=580){return 70;}if(report.endingScore>=500){return 50;}if(report.endingScore>=420){return 30;}return 15;},[report]);const handleShare=async()=>{if(!report){return;}const shareText=`📊 Monthly Focus Report - ${report.month}

${identityStatement}

Score: ${report.endingScore} (${report.change>0?'+':''}${report.change})
Grade: ${report.grade}
Sessions: ${report.sessionsCompleted}
Percentile: Top ${100-percentile}%

${report.highlight}

#VEX #FocusProductivity`;try{await Share.share({message:shareText,title:'Monthly Focus Report'});if(report){publishMonthlyReportShared(userId,report.month,report.grade);}}catch(_shareError){}};const handleClose=()=>{if(report){publishMonthlyReportDismissed(userId,report.month);}onClose();};if(loadingState==='loading'||loadingState==='pending'){return<MonthlyReportSkeleton/>;}if(loadingState==='error'){return<View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:theme.colors.background.primary,paddingHorizontal:theme.spacing[6]}}>
        <Text variant="heading3"color="error"style={{marginBottom:theme.spacing[4]}}>
          ⚠️ Report Unavailable
        </Text>
        <Text variant="body"color="textSecondary"style={{textAlign:'center',marginBottom:theme.spacing[6]}}>
          {error?.message||'Unable to generate your monthly focus report.'}
        </Text>
        <Button onPress={refresh}variant="primary"style={{marginBottom:theme.spacing[4]}}>
          Try Again
        </Button>
        <Button onPress={handleClose}variant="secondary">
          Close
        </Button>
      </View>;}if(!report){return<View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:theme.colors.background.primary,paddingHorizontal:theme.spacing[6]}}>
        <Text variant="heading2"color="text"style={{marginBottom:theme.spacing[4]}}>
          No Report Available
        </Text>
        <Text variant="body"color="textSecondary"style={{textAlign:'center',marginBottom:theme.spacing[6]}}>
          Complete sessions this month to generate your first focus report.
        </Text>
        <Button onPress={handleClose}variant="primary">
          Start a Session
        </Button>
      </View>;}const handleHeaderClose=()=>{handleClose();};return<View style={{flex:1,backgroundColor:theme.colors.background.primary}}>
      {}
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:theme.spacing[6],paddingTop:theme.spacing[8],paddingBottom:theme.spacing[4]}}>
        <Text variant="heading2"color="text">
          Monthly Focus Report
        </Text>
        <Pressable onPress={handleHeaderClose}style={{padding:theme.spacing[2]}}>
          <Text variant="heading3"color="textSecondary">
            ✕
          </Text>
        </Pressable>
      </View>

      {}
      <Animated.ScrollView style={[{flex:1},animatedStyles]}contentContainerStyle={{paddingHorizontal:theme.spacing[6],paddingBottom:theme.spacing[8]}}showsVerticalScrollIndicator={false}>
        {}
        <Animated.View entering={FadeIn.delay(100).duration(300)}>
          <Box backgroundColor="surface"borderRadius="xl"padding="xl"style={{marginBottom:theme.spacing[6]}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
              <View>
                <Text variant="heading3"color="textSecondary">
                  {new Date(report.month+'-01').toLocaleDateString('en-US',{month:'long',year:'numeric'})}
                </Text>
                <Text variant="display"color="text"style={{marginTop:theme.spacing[2],fontWeight:'700'}}>
                  {report.endingScore}
                </Text>
                <Text variant="body"color="textSecondary">
                  Focus Score
                </Text>
              </View>
              <View style={{paddingHorizontal:theme.spacing[3],paddingVertical:theme.spacing[2],borderRadius:theme.borderRadius.lg,backgroundColor:scoreColor+'20',minWidth:60,alignItems:'center'}}>
                <Text variant="heading2"style={{fontWeight:'700',color:scoreColor}}>
                  {report.grade}
                </Text>
              </View>
            </View>

            {}
            <View style={{marginTop:theme.spacing[4]}}>
              <Text variant="body"style={{fontWeight:'600',color:report.change>0?theme.colors.success.DEFAULT:theme.colors.error.DEFAULT}}>
                {report.change>0?'↑':'↓'} {Math.abs(report.change)} from last month
              </Text>
            </View>
          </Box>
        </Animated.View>

        {}
        {scoreDrivers.length>0&&<Animated.View entering={FadeIn.delay(200).duration(300)}>
            <Box backgroundColor="surface"borderRadius="xl"padding="xl"style={{marginBottom:theme.spacing[6]}}>
              <Text variant="heading3"color="text"style={{marginBottom:theme.spacing[4]}}>
                Score Drivers
              </Text>
              <View style={{gap:theme.spacing[3]}}>
                {scoreDrivers.map((driver,index)=><View key={index}style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <Text variant="body"color="text">
                      {driver.name}
                    </Text>
                    <Text variant="body"style={{fontWeight:'600',color:driver.value.startsWith('+')?theme.colors.success.DEFAULT:theme.colors.error.DEFAULT}}>
                      {driver.value}
                    </Text>
                  </View>)}
              </View>
            </Box>
          </Animated.View>}

        {}
        <Animated.View entering={FadeIn.delay(300).duration(300)}>
          <Box backgroundColor="surface"borderRadius="xl"padding="xl"style={{marginBottom:theme.spacing[6]}}>
            <Text variant="heading3"color="text"style={{marginBottom:theme.spacing[4]}}>
              Month Highlights
            </Text>
            <Text variant="body"color="textSecondary"style={{marginBottom:theme.spacing[2]}}>
              Sessions completed: {report.sessionsCompleted}
            </Text>
            <Text variant="body"color="textSecondary">
              {report.highlight}
            </Text>
          </Box>
        </Animated.View>

        {}
        <Animated.View entering={FadeIn.delay(400).duration(300)}>
          <Box backgroundColor="surface"borderRadius="xl"padding="xl"style={{marginBottom:theme.spacing[6]}}>
            <Text variant="heading3"color="text"style={{marginBottom:theme.spacing[4]}}>
              Your Focus Identity
            </Text>
            <Text variant="body"color="textSecondary"style={{marginBottom:theme.spacing[3]}}>
              You're in the top {100-percentile}% of focused people
            </Text>
            <Text variant="body"color="text"style={{fontStyle:'italic',lineHeight:24}}>
              {identityStatement}
            </Text>
          </Box>
        </Animated.View>

        {}
        <Animated.View entering={SlideInDown.delay(500).duration(300)}>
          <Button onPress={handleShare}variant="primary"style={{marginBottom:theme.spacing[4]}}>
            Share Monthly Report
          </Button>
          <Button onPress={handleClose}variant="secondary">
            Close
          </Button>
        </Animated.View>
      </Animated.ScrollView>
    </View>;}
