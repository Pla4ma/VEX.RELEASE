import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React,{useState,useCallback}from'react'; import{ScrollView,Pressable,Alert}from'react-native'; import{useSafeAreaInsets}from'react-native-safe-area-context'; import type{NativeStackScreenProps}from'@react-navigation/native-stack'; import{useTheme}from'../../theme'; import{Box,Text,Card}from'../../components/primitives'; import{Icon}from'../../icons'; import{useUIStore}from'../../store/index'; import type{SettingsStackParams}from'../../navigation'; type Props=NativeStackScreenProps<SettingsStackParams,'CoachSettings'>;type CoachPersona='cheerleader'|'mentor'|'drill-sergeant';type MessageFrequency='frequent'|'normal'|'minimal';type CoachLanguage='en';interface PersonaOption{id:CoachPersona;label:string;emoji:string;description:string;exampleMessages:string[];color:string;}interface FrequencyOption{id:MessageFrequency;label:string;description:string;messagesPerDay:string;}interface LanguageOption{id:CoachLanguage;label:string;flag:string;}const PERSONA_OPTIONS:PersonaOption[] = [{id:'cheerleader',label:'The Cheerleader',emoji:'🎉',description:'Enthusiastic, encouraging, high energy',exampleMessages:["You're absolutely crushing it! 🔥",'That focus session was AMAZING!'],color:'#EC4899'},{id:'mentor',label:'The Mentor',emoji:'📚',description:'Calm, wise, strategic guidance',exampleMessages:['Your consistency is building momentum.','Consider a longer session tomorrow for deeper focus.'],color:'#3B82F6'},{id:'drill-sergeant',label:'The Drill Sergeant',emoji:'💀',description:'Intense, zero tolerance for excuses',exampleMessages:['Excuses are for losers. FOCUS!','Your enemy is winning while you hesitate.'],color:'#EF4444'}]; const FREQUENCY_OPTIONS:FrequencyOption[] = [{id:'frequent',label:'Frequent',description:'Before, during, and after sessions',messagesPerDay:'5-8 messages'},{id:'normal',label:'Normal',description:'Key moments and milestones',messagesPerDay:'2-4 messages'},{id:'minimal',label:'Minimal',description:'Only important achievements',messagesPerDay:'0-1 messages'}]; const LANGUAGE_OPTIONS:LanguageOption[] = [{id:'en',label:'English',flag:'🇺🇸'}]; export const CoachSettingsScreen:React.FC<Props> = ({navigation})=>{const{theme} = useTheme(); const insets = useSafeAreaInsets(); const{showToast} = useUIStore(); const[selectedPersona,setSelectedPersona] = useState<CoachPersona>('mentor'); const[frequency,setFrequency] = useState<MessageFrequency>('normal'); const[language,setLanguage] = useState<CoachLanguage>('en'); const handlePersonaChange = useCallback((persona:CoachPersona)=>{setSelectedPersona(persona);},[]); const handleFrequencyChange = useCallback((freq:MessageFrequency)=>{setFrequency(freq);},[]); const handleLanguageChange = useCallback((lang:CoachLanguage)=>{setLanguage(lang);},[]); const handleResetMemory = useCallback(()=>{Alert.alert('Reset Coach Memory?','This will clear all conversation history and reset your coach to default. This action cannot be undone.',[{text:'Cancel',style:'cancel'},{text:'Reset',style:'destructive',onPress:()=>{showToast({message:'Coach memory has been reset',type:'success',duration:3000});}}]);},[showToast]); const selectedPersonaData = PERSONA_OPTIONS.find(p=>p.id === selectedPersona); return<Box flex={1}style={{backgroundColor:theme.colors.background.primary}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <Box px={20}pb={16}pt={insets.top + 16}flexDirection="row"alignItems="center">
          <Pressable onPress={()=>navigation.goBack()}style={{marginRight:12}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Icon name="arrow-left"size={24}color={theme.colors.text.primary}/>
          </Pressable>
          <Text variant="h2">AI Coach</Text>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            YOUR COACH
          </Text>
          <Card size="md"style={{overflow:'hidden',backgroundColor:theme.colors.background.secondary}}>
            <Box p={20}alignItems="center">
              <Box width={80}height={80}borderRadius={40}justifyContent="center"alignItems="center"mb={16}style={{backgroundColor:selectedPersonaData?.color || theme.colors.primary[500]}}>
                <Text style={{fontSize:40}}>{selectedPersonaData?.emoji}</Text>
              </Box>
              <Text variant="h3"style={{marginBottom:4}}>
                {selectedPersonaData?.label}
              </Text>
              <Text variant="body"color="text.secondary"style={{marginBottom:16}}>
                {selectedPersonaData?.description}
              </Text>

              {}
              <Box width="100%">
                {selectedPersonaData?.exampleMessages.map((message,index)=><Box key={index}p={12}borderRadius={12}mb={8}style={{backgroundColor:theme.colors.background.primary,borderLeftWidth:3,borderLeftColor:selectedPersonaData?.color}}>
                    <Text variant="body"color="text.secondary"style={{fontStyle:'italic'}}>
                      "{message}"
                    </Text>
                  </Box>)}
              </Box>
            </Box>
          </Card>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            COACH PERSONA
          </Text>
          <Card size="sm"style={{overflow:'hidden'}}>
            {PERSONA_OPTIONS.map((option,index)=><React.Fragment key={option.id}>
                <Pressable onPress={()=>handlePersonaChange(option.id)}style={{flexDirection:'row',alignItems:'center',paddingVertical:16,paddingHorizontal:16}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                  <Box width={48}height={48}borderRadius={12}justifyContent="center"alignItems="center"style={{backgroundColor:option.color + '20',borderWidth:selectedPersona === option.id ? 2 : 0,borderColor:option.color}}>
                    <Text style={{fontSize:24}}>{option.emoji}</Text>
                  </Box>

                  <Box flex={1}ml={12}>
                    <Text variant="body"style={{fontWeight:selectedPersona === option.id ? '600' : '500',color:theme.colors.text.primary}}>
                      {option.label}
                    </Text>
                    <Text variant="caption"color="text.secondary"style={{marginTop:2}}>
                      {option.description}
                    </Text>
                  </Box>

                  {selectedPersona === option.id && <Box width={24}height={24}borderRadius={12}justifyContent="center"alignItems="center"style={{backgroundColor:option.color}}>
                      <Icon name="check"size={14}color="#FFF"/>
                    </Box>}
                </Pressable>
                {index < PERSONA_OPTIONS.length - 1 && <Box height={1}ml={76}style={{backgroundColor:theme.colors.border.light}}/>}
              </React.Fragment>)}
          </Card>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            MESSAGE FREQUENCY
          </Text>
          <Card size="sm"style={{overflow:'hidden'}}>
            {FREQUENCY_OPTIONS.map((option,index)=><React.Fragment key={option.id}>
                <Pressable onPress={()=>handleFrequencyChange(option.id)}style={{flexDirection:'row',alignItems:'center',paddingVertical:16,paddingHorizontal:16}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                  <Box width={40}height={40}borderRadius={10}justifyContent="center"alignItems="center"style={{backgroundColor:frequency === option.id ? theme.colors.primary[50] : theme.colors.background.secondary}}>
                    <Icon name="message-circle"size={20}color={frequency === option.id ? theme.colors.primary[500] : theme.colors.text.tertiary}/>
                  </Box>

                  <Box flex={1}ml={12}>
                    <Text variant="body"style={{fontWeight:frequency === option.id ? '600' : '500',color:theme.colors.text.primary}}>
                      {option.label}
                    </Text>
                    <Text variant="caption"color="text.secondary"style={{marginTop:2}}>
                      {option.description}
                    </Text>
                    <Text variant="caption"style={{marginTop:4,color:frequency === option.id ? theme.colors.primary[500] : theme.colors.text.tertiary}}>
                      {option.messagesPerDay}
                    </Text>
                  </Box>

                  {frequency === option.id && <Box width={24}height={24}borderRadius={12}justifyContent="center"alignItems="center"style={{backgroundColor:theme.colors.primary[500]}}>
                      <Icon name="check"size={14}color="#FFF"/>
                    </Box>}
                </Pressable>
                {index < FREQUENCY_OPTIONS.length - 1 && <Box height={1}ml={68}style={{backgroundColor:theme.colors.border.light}}/>}
              </React.Fragment>)}
          </Card>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            LANGUAGE
          </Text>
          <Card size="sm"style={{overflow:'hidden'}}>
            {LANGUAGE_OPTIONS.map((option,index)=><React.Fragment key={option.id}>
                <Pressable onPress={()=>handleLanguageChange(option.id)}style={{flexDirection:'row',alignItems:'center',paddingVertical:16,paddingHorizontal:16}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                  <Box width={40}height={40}borderRadius={10}justifyContent="center"alignItems="center"style={{backgroundColor:language === option.id ? theme.colors.primary[50] : theme.colors.background.secondary}}>
                    <Text style={{fontSize:20}}>{option.flag}</Text>
                  </Box>

                  <Box flex={1}ml={12}>
                    <Text variant="body"style={{fontWeight:language === option.id ? '600' : '500',color:theme.colors.text.primary}}>
                      {option.label}
                    </Text>
                  </Box>

                  {language === option.id && <Box width={24}height={24}borderRadius={12}justifyContent="center"alignItems="center"style={{backgroundColor:theme.colors.primary[500]}}>
                      <Icon name="check"size={14}color="#FFF"/>
                    </Box>}
                </Pressable>
              </React.Fragment>)}
          </Card>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            DATA
          </Text>
          <Pressable onPress={handleResetMemory}style={{backgroundColor:theme.colors.error[50] || '#FEF2F2',paddingVertical:16,paddingHorizontal:16,borderRadius:12,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:theme.colors.error.DEFAULT + '30'}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Box width={40}height={40}borderRadius={10}justifyContent="center"alignItems="center"style={{backgroundColor:theme.colors.error.DEFAULT + '20'}}>
              <Icon name="refresh-cw"size={20}color={theme.colors.error.DEFAULT}/>
            </Box>
            <Box flex={1}ml={12}>
              <Text variant="body"style={{fontWeight:'600',color:theme.colors.error.DEFAULT}}>
                Reset Coach Memory
              </Text>
              <Text variant="caption"color="text.secondary"style={{marginTop:2}}>
                Clear all conversation history
              </Text>
            </Box>
          </Pressable>
        </Box>

        <Box height={insets.bottom + 20}/>
      </ScrollView>
    </Box>;}; export default withScreenErrorBoundary(CoachSettingsScreen, 'CoachSettings');
