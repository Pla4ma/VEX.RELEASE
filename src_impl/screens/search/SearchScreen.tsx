import React,{useState,useCallback}from'react'; import{TextInput,Pressable,Keyboard}from'react-native'; import type{ViewStyle}from'react-native'; import{FlashList}from'@shopify/flash-list'; import{useSafeAreaInsets}from'react-native-safe-area-context'; import{useTheme}from'../../theme'; import{Box,Text,Card}from'../../components/primitives'; import{Badge}from'../../components/Badge'; import{Icon}from'../../icons'; import{Loading}from'../../components/states'; const CATEGORIES = [{id:'all',label:'All',icon:'grid'},{id:'sessions',label:'Sessions',icon:'play'},{id:'challenges',label:'Challenges',icon:'trophy'},{id:'users',label:'Users',icon:'users'},{id:'content',label:'Content',icon:'file'}]; type SearchCategory=(typeof CATEGORIES)[number];const RECENT_SEARCHES = ['meditation basics','morning routine','focus techniques','breathing exercises']; const MOCK_RESULTS = [{id:'1',type:'session',title:'Morning Meditation',subtitle:'10 min • Beginner',icon:'play'},{id:'2',type:'challenge',title:'7-Day Mindfulness',subtitle:'Challenge • 1.2k participants',icon:'trophy'},{id:'3',type:'user',title:'Sarah Johnson',subtitle:'Level 24 • 45 day streak',icon:'user'},{id:'4',type:'content',title:'Focus Techniques Guide',subtitle:'Article • 5 min read',icon:'file'}]; type SearchResult=(typeof MOCK_RESULTS)[number];export const SearchScreen:React.FC = ()=>{const{theme} = useTheme(); const insets = useSafeAreaInsets(); const[query,setQuery] = useState(''); const[activeCategory,setActiveCategory] = useState('all'); const[isSearching,setIsSearching] = useState(false); const[showResults,setShowResults] = useState(false); const handleSearch = useCallback(()=>{if(!query.trim()){return;}Keyboard.dismiss(); setIsSearching(true); setShowResults(true); setTimeout(()=>{setIsSearching(false);},800);},[query]); const handleClear = ()=>{setQuery(''); setShowResults(false);}; const renderSearchBar = ()=><Box px={16}pb={12}pt={insets.top + 16}style={{backgroundColor:theme.colors.background.primary}}>
      <Box flexDirection="row"alignItems="center"height={48}borderRadius={12}px={12}style={{backgroundColor:theme.colors.background.secondary}}>
        <Icon name="search"size={20}color={theme.colors.text.tertiary}style={{marginRight:8}}/>
        <TextInput style={{flex:1,fontSize:16,height:'100%',color:theme.colors.text.primary}}placeholder="Search sessions, challenges, users..."placeholderTextColor={theme.colors.text.placeholder}value={query}onChangeText={setQuery}onSubmitEditing={handleSearch}returnKeyType="search"autoCapitalize="none"autoCorrect={false}maxLength={100}/>
        {query.length > 0 && <Pressable onPress={handleClear}style={{padding:4}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Icon name="close"size={18}color={theme.colors.text.tertiary}/>
          </Pressable>}
      </Box>
    </Box>; const renderCategories = ()=><Box mb={8}>
      <FlashList horizontal showsHorizontalScrollIndicator={false}data={CATEGORIES}keyExtractor={(item:SearchCategory)=>item.id}contentContainerStyle={{paddingHorizontal:16,gap:8}}estimatedItemSize={40}renderItem={({item}:{item:SearchCategory;})=><Pressable style={{flexDirection:'row',alignItems:'center',paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:activeCategory === item.id ? theme.colors.primary[500] : theme.colors.background.secondary}}onPress={()=>setActiveCategory(item.id)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Icon name={item.icon}size={16}color={activeCategory === item.id ? '#FFF' : theme.colors.text.secondary}style={{marginRight:6}}/>
            <Text variant="caption"style={{fontWeight:'600',color:activeCategory === item.id ? '#FFF' : theme.colors.text.secondary}}>
              {item.label}
            </Text>
          </Pressable>}/>
    </Box>; const renderRecentSearches = ()=><Box mb={24}>
      <Box flexDirection="row"justifyContent="space-between"alignItems="center"mb={12}>
        <Text variant="h4">Recent Searches</Text>
        <Pressable accessibilityLabel="Clear All button"accessibilityRole="button"accessibilityHint="Activates this control">
          <Text variant="caption"style={{color:theme.colors.primary[500]}}>
            Clear All
          </Text>
        </Pressable>
      </Box>
      {RECENT_SEARCHES.map((search,index)=><Pressable key={index}style={{flexDirection:'row',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#E2E8F0'}}onPress={()=>{setQuery(search); handleSearch();}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
          <Icon name="clock"size={18}color={theme.colors.text.tertiary}/>
          <Text variant="body"style={{marginLeft:12,flex:1}}>
            {search}
          </Text>
          <Icon name="arrow-right"size={18}color={theme.colors.text.tertiary}/>
        </Pressable>)}
    </Box>; const renderResults = ()=>{if(isSearching){return<Box flex={1}justifyContent="center"alignItems="center">
          <Loading variant="spinner"size="lg"/>
        </Box>;}return<FlashList data={MOCK_RESULTS}keyExtractor={(item:SearchResult)=>item.id}contentContainerStyle={{padding:16,gap:12}}estimatedItemSize={80}renderItem={({item}:{item:SearchResult;})=><Card style={{flexDirection:'row',alignItems:'center'}as ViewStyle}size="md"onPress={()=>{}}>
            <Box width={44}height={44}borderRadius={12}justifyContent="center"alignItems="center"style={{backgroundColor:item.type === 'session' ? theme.colors.primary[100] : item.type === 'challenge' ? theme.colors.warning.light : item.type === 'user' ? theme.colors.success.light : theme.colors.info.light}}>
              <Icon name={item.icon}size={20}color={item.type === 'session' ? theme.colors.primary[500] : item.type === 'challenge' ? theme.colors.warning.DEFAULT : item.type === 'user' ? theme.colors.success.DEFAULT : theme.colors.info.DEFAULT}/>
            </Box>
            <Box flex={1}ml={12}>
              <Text variant="body"style={{fontWeight:'600'}}>
                {item.title}
              </Text>
              <Text variant="caption"color="text.secondary">
                {item.subtitle}
              </Text>
            </Box>
            <Badge variant={item.type === 'session' ? 'primary' : item.type === 'challenge' ? 'warning' : item.type === 'user' ? 'success' : 'info'}size="sm">
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Badge>
          </Card>}ListEmptyComponent={<Box alignItems="center"py={48}>
            <Icon name="search"size={48}color={theme.colors.text.tertiary}/>
            <Text variant="h4"style={{marginTop:16,textAlign:'center'}}>
              No Results Found
            </Text>
            <Text variant="body"color="text.secondary"style={{marginTop:8,textAlign:'center'}}>
              Try adjusting your search terms
            </Text>
          </Box>}/>;}; return<Box flex={1}style={{backgroundColor:theme.colors.background.primary}}>
      {renderSearchBar()}
      {renderCategories()}

      {showResults ? renderResults() : <Box flex={1}p={16}>
          {renderRecentSearches()}

          <Box mt={8}>
            <Text variant="h4"style={{marginBottom:12}}>
              Trending
            </Text>
            <Box flexDirection="row"flexWrap="wrap"gap={8}>
              {['mindfulness','productivity','sleep','focus','meditation','yoga'].map(tag=><Pressable key={tag}style={{paddingHorizontal:12,paddingVertical:8,borderRadius:16,backgroundColor:theme.colors.background.secondary}}onPress={()=>{setQuery(tag); handleSearch();}}accessibilityLabel="# button"accessibilityRole="button"accessibilityHint="Activates this control">
                  <Text variant="caption"style={{textTransform:'capitalize'}}>
                    #{tag}
                  </Text>
                </Pressable>)}
            </Box>
          </Box>
        </Box>}
    </Box>;}; export default SearchScreen;
