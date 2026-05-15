import React,{useState,useCallback}from'react'; import{ScrollView,Pressable,View}from'react-native'; import{useSafeAreaInsets}from'react-native-safe-area-context'; import type{NativeStackScreenProps}from'@react-navigation/native-stack'; import{useTheme,ThemeMode}from'../../theme'; import{Box,Text,Card}from'../../components/primitives'; import{Icon}from'../../icons'; import type{SettingsStackParams}from'../../navigation'; type Props=NativeStackScreenProps<SettingsStackParams,'AppearanceSettings'>;type FontSize='small'|'medium'|'large';type TimerFormat='countdown'|'countup';type AccentColor='indigo'|'purple'|'blue'|'green'|'orange'|'pink'|'red'|'teal';interface ThemeOption{id:ThemeMode;label:string;icon:string;}interface AccentColorOption{id:AccentColor;hex:string;}interface FontSizeOption{id:FontSize;label:string;sampleSize:number;}interface TimerFormatOption{id:TimerFormat;label:string;preview:string;}const THEME_OPTIONS:ThemeOption[] = [{id:'dark',label:'Dark',icon:'moon'},{id:'light',label:'Light',icon:'sun'},{id:'system',label:'System',icon:'monitor'}]; const ACCENT_COLORS:AccentColorOption[] = [{id:'indigo',hex:'#6366F1'},{id:'purple',hex:'#A855F7'},{id:'blue',hex:'#3B82F6'},{id:'green',hex:'#10B981'},{id:'orange',hex:'#F97316'},{id:'pink',hex:'#EC4899'},{id:'red',hex:'#EF4444'},{id:'teal',hex:'#14B8A6'}]; const FONT_SIZE_OPTIONS:FontSizeOption[] = [{id:'small',label:'Small',sampleSize:14},{id:'medium',label:'Medium',sampleSize:16},{id:'large',label:'Large',sampleSize:18}]; const TIMER_FORMAT_OPTIONS:TimerFormatOption[] = [{id:'countdown',label:'Countdown',preview:'24:59'},{id:'countup',label:'Count Up',preview:'00:01'}]; export const AppearanceSettingsScreen:React.FC<Props> = ({navigation})=>{const{theme,mode,setMode} = useTheme(); const insets = useSafeAreaInsets(); const[selectedTheme,setSelectedTheme] = useState<ThemeMode>(mode); const[accentColor,setAccentColor] = useState<AccentColor>('indigo'); const[fontSize,setFontSize] = useState<FontSize>('medium'); const[timerFormat,setTimerFormat] = useState<TimerFormat>('countdown'); const handleThemeChange = useCallback((newTheme:ThemeMode)=>{setSelectedTheme(newTheme); setMode(newTheme);},[setMode]); const handleAccentColorChange = useCallback((color:AccentColor)=>{setAccentColor(color);},[]); const handleFontSizeChange = useCallback((size:FontSize)=>{setFontSize(size);},[]); const handleTimerFormatChange = useCallback((format:TimerFormat)=>{setTimerFormat(format);},[]); const getFontSizeMultiplier = ():number=>{switch(fontSize){case'small':return 0.875; case'large':return 1.125; default:return 1;}}; return<Box flex={1}style={{backgroundColor:theme.colors.background.primary}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <Box px={20}pb={16}pt={insets.top + 16}flexDirection="row"alignItems="center">
          <Pressable onPress={()=>navigation.goBack()}style={{marginRight:12}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Icon name="arrow-left"size={24}color={theme.colors.text.primary}/>
          </Pressable>
          <Text variant="h2">Appearance</Text>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            PREVIEW
          </Text>
          <Card size="md"style={{backgroundColor:theme.colors.background.secondary,alignItems:'center',justifyContent:'center',paddingVertical:32}}>
            <Box width={60}height={60}borderRadius={30}justifyContent="center"alignItems="center"mb={16}style={{backgroundColor:ACCENT_COLORS.find(c=>c.id === accentColor)?.hex || theme.colors.primary[500]}}>
              <Icon name="timer"size={28}color="#FFF"/>
            </Box>
            <Text variant="h3"style={{fontSize:36 * getFontSizeMultiplier(),fontWeight:'700',color:theme.colors.text.primary}}>
              {TIMER_FORMAT_OPTIONS.find(f=>f.id === timerFormat)?.preview || '24:59'}
            </Text>
            <Text variant="body"color="text.secondary"style={{marginTop:8,fontSize:16 * getFontSizeMultiplier()}}>
              Focus Session
            </Text>
          </Card>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            THEME
          </Text>
          <Card size="sm"style={{overflow:'hidden'}}>
            {THEME_OPTIONS.map((option,index)=><React.Fragment key={option.id}>
                <Pressable onPress={()=>handleThemeChange(option.id)}style={{flexDirection:'row',alignItems:'center',paddingVertical:16,paddingHorizontal:16}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                  <Box width={40}height={40}borderRadius={10}justifyContent="center"alignItems="center"style={{backgroundColor:selectedTheme === option.id ? theme.colors.primary[50] : theme.colors.background.secondary}}>
                    <Icon name={option.icon}size={20}color={selectedTheme === option.id ? theme.colors.primary[500] : theme.colors.text.tertiary}/>
                  </Box>

                  <Box flex={1}ml={12}>
                    <Text variant="body"style={{fontWeight:selectedTheme === option.id ? '600' : '500',color:theme.colors.text.primary}}>
                      {option.label}
                    </Text>
                  </Box>

                  {selectedTheme === option.id && <Box width={24}height={24}borderRadius={12}justifyContent="center"alignItems="center"style={{backgroundColor:theme.colors.primary[500]}}>
                      <Icon name="check"size={14}color="#FFF"/>
                    </Box>}
                </Pressable>
                {index < THEME_OPTIONS.length - 1 && <Box height={1}ml={68}style={{backgroundColor:theme.colors.border.light}}/>}
              </React.Fragment>)}
          </Card>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            ACCENT COLOR
          </Text>
          <Card size="sm"style={{padding:16}}>
            <Box flexDirection="row"flexWrap="wrap"justifyContent="space-between">
              {ACCENT_COLORS.map(color=><Pressable key={color.id}onPress={()=>handleAccentColorChange(color.id)}style={{width:64,height:64,borderRadius:16,marginBottom:12,justifyContent:'center',alignItems:'center',backgroundColor:color.hex,borderWidth:accentColor === color.id ? 3 : 0,borderColor:theme.colors.text.primary}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                  {accentColor === color.id && <Icon name="check"size={24}color="#FFF"/>}
                </Pressable>)}
            </Box>
          </Card>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            FONT SIZE
          </Text>
          <Card size="sm"style={{overflow:'hidden'}}>
            {FONT_SIZE_OPTIONS.map((option,index)=><React.Fragment key={option.id}>
                <Pressable onPress={()=>handleFontSizeChange(option.id)}style={{flexDirection:'row',alignItems:'center',paddingVertical:16,paddingHorizontal:16}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                  <Box width={40}height={40}borderRadius={10}justifyContent="center"alignItems="center"style={{backgroundColor:fontSize === option.id ? theme.colors.primary[50] : theme.colors.background.secondary}}>
                    <Text style={{fontSize:option.sampleSize,fontWeight:'600',color:fontSize === option.id ? theme.colors.primary[500] : theme.colors.text.tertiary}}>
                      A
                    </Text>
                  </Box>

                  <Box flex={1}ml={12}>
                    <Text variant="body"style={{fontSize:option.sampleSize,fontWeight:fontSize === option.id ? '600' : '400',color:theme.colors.text.primary}}>
                      {option.label}
                    </Text>
                  </Box>

                  {fontSize === option.id && <Box width={24}height={24}borderRadius={12}justifyContent="center"alignItems="center"style={{backgroundColor:theme.colors.primary[500]}}>
                      <Icon name="check"size={14}color="#FFF"/>
                    </Box>}
                </Pressable>
                {index < FONT_SIZE_OPTIONS.length - 1 && <Box height={1}ml={68}style={{backgroundColor:theme.colors.border.light}}/>}
              </React.Fragment>)}
          </Card>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            TIMER DISPLAY
          </Text>
          <Card size="sm"style={{overflow:'hidden'}}>
            {TIMER_FORMAT_OPTIONS.map((option,index)=><React.Fragment key={option.id}>
                <Pressable onPress={()=>handleTimerFormatChange(option.id)}style={{flexDirection:'row',alignItems:'center',paddingVertical:16,paddingHorizontal:16}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                  <Box width={40}height={40}borderRadius={10}justifyContent="center"alignItems="center"style={{backgroundColor:timerFormat === option.id ? theme.colors.primary[50] : theme.colors.background.secondary}}>
                    <Text style={{fontSize:14,fontWeight:'600',color:timerFormat === option.id ? theme.colors.primary[500] : theme.colors.text.tertiary}}>
                      {option.preview}
                    </Text>
                  </Box>

                  <Box flex={1}ml={12}>
                    <Text variant="body"style={{fontWeight:timerFormat === option.id ? '600' : '500',color:theme.colors.text.primary}}>
                      {option.label}
                    </Text>
                  </Box>

                  {timerFormat === option.id && <Box width={24}height={24}borderRadius={12}justifyContent="center"alignItems="center"style={{backgroundColor:theme.colors.primary[500]}}>
                      <Icon name="check"size={14}color="#FFF"/>
                    </Box>}
                </Pressable>
                {index < TIMER_FORMAT_OPTIONS.length - 1 && <Box height={1}ml={68}style={{backgroundColor:theme.colors.border.light}}/>}
              </React.Fragment>)}
          </Card>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Pressable onPress={()=>{setSelectedTheme('dark'); setMode('dark'); setAccentColor('indigo'); setFontSize('medium'); setTimerFormat('countdown');}}style={{backgroundColor:theme.colors.background.secondary,paddingVertical:16,borderRadius:12,alignItems:'center',borderWidth:1,borderColor:theme.colors.border.light}}accessibilityLabel="Reset to Defaults button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={{color:theme.colors.text.primary,fontWeight:'600',fontSize:16}}>
              Reset to Defaults
            </Text>
          </Pressable>
        </Box>

        <Box height={insets.bottom + 20}/>
      </ScrollView>
    </Box>;}; export default AppearanceSettingsScreen;
