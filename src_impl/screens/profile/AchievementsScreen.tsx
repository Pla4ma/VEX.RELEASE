import React,{useState,useCallback,useMemo}from'react';import{View,Pressable}from'react-native';import Animated,{FadeInUp,FadeIn}from'react-native-reanimated';import{FlashList}from'@shopify/flash-list';import{Box,Text}from'@/components/primitives';import{Skeleton}from'@/shared/ui/primitives';import{useTheme}from'@/theme';import{useAchievements,useAchievementStats,achievementKeys}from'@/features/achievements/hooks';import{ALL_ACHIEVEMENTS,getRarityColor,getAchievementDisplayInfo}from'@/features/achievements/definitions';import type{Achievement,AchievementCategory,AchievementRarity}from'@/features/achievements/types';import{useQueryClient}from'@tanstack/react-query';type FilterType='ALL'|'UNLOCKED'|'LOCKED';type SortType='RARITY'|'RECENT'|'CATEGORY';type CategoryItem={id:AchievementCategory|'ALL';label:string;icon:string;};interface AchievementWithStatus extends Achievement{progress:number;isUnlocked:boolean;unlockedAt?:number;completionPercentage:number;}const CATEGORIES:CategoryItem[]=[{id:'ALL',label:'All',icon:'🏆'},{id:'SESSION',label:'Session',icon:'📚'},{id:'STREAK',label:'Streak',icon:'🔥'},{id:'BOSS',label:'Boss',icon:'⚔️'},{id:'SOCIAL',label:'Social',icon:'👥'},{id:'PROGRESSION',label:'Progression',icon:'📈'}];const RARITY_ORDER:AchievementRarity[]=['LEGENDARY','EPIC','RARE','UNCOMMON','COMMON'];const CATEGORY_ORDER:AchievementCategory[]=['SESSION','STREAK','BOSS','SOCIAL','PROGRESSION','ECONOMY'];const AchievementsHeader:React.FC<{total:number;unlocked:number;totalPoints:number;pointsEarned:number;}>=({total,unlocked,totalPoints,pointsEarned})=>{const{theme}=useTheme();const percentage=total>0?Math.round(unlocked/total*100):0;return<Box p={4}bg={theme.colors.background.secondary}mb={4}>
      <Box flexDirection="row"alignItems="center"justifyContent="space-between">
        <Box>
          <Text variant="h2"color={theme.colors.text.primary}>
            {unlocked} / {total}
          </Text>
          <Text variant="caption"color={theme.colors.text.secondary}>
            Achievements Unlocked
          </Text>
        </Box>

        <Box alignItems="flex-end">
          <Box flexDirection="row"alignItems="center"gap={2}>
            <Text style={{fontSize:24}}>⭐</Text>
            <Text variant="h3"color={theme.colors.warning.DEFAULT}>
              {pointsEarned.toLocaleString()}
            </Text>
          </Box>
          <Text variant="caption"color={theme.colors.text.secondary}>
            / {totalPoints.toLocaleString()} Points
          </Text>
        </Box>
      </Box>

      {}
      <Box mt={4}>
        <Box height={8}borderRadius={4}bg={theme.colors.background.tertiary}style={{overflow:'hidden'}}>
          <Box height="100%"borderRadius={4}bg={theme.colors.success.DEFAULT}style={{width:`${percentage}%`}}/>
        </Box>
        <Text variant="caption"color={theme.colors.text.tertiary}mt={1}textAlign="center">
          {percentage}% Complete
        </Text>
      </Box>
    </Box>;};const CategoryTabs:React.FC<{selected:AchievementCategory|'ALL';onSelect:(category:AchievementCategory|'ALL')=>void;}>=({selected,onSelect})=>{const{theme}=useTheme();return<Box py={2}>
      <FlashList data={CATEGORIES}horizontal showsHorizontalScrollIndicator={false}estimatedItemSize={100}keyExtractor={(item:CategoryItem)=>item.id}renderItem={({item}:{item:CategoryItem;})=>{const isSelected=selected===item.id;return<Pressable onPress={()=>onSelect(item.id)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
              <Box px={4}py={2}mx={2}borderRadius={20}bg={isSelected?theme.colors.primary[500]:theme.colors.background.tertiary}style={{opacity:isSelected?1:0.7}}>
                <Box flexDirection="row"alignItems="center"gap={2}>
                  <Text style={{fontSize:16}}>{item.icon}</Text>
                  <Text variant="body"color={isSelected?'#FFFFFF':theme.colors.text.secondary}fontWeight={isSelected?'semibold':'normal'}>
                    {item.label}
                  </Text>
                </Box>
              </Box>
            </Pressable>;}}/>
    </Box>;};const FilterSortBar:React.FC<{filter:FilterType;onFilterChange:(filter:FilterType)=>void;sort:SortType;onSortChange:(sort:SortType)=>void;}>=({filter,onFilterChange,sort,onSortChange})=>{const{theme}=useTheme();return<Box flexDirection="row"justifyContent="space-between"alignItems="center"px={4}py={2}style={{borderBottomWidth:1,borderBottomColor:theme.colors.border.light}}>
      {}
      <Box flexDirection="row"gap={2}>
        {(['ALL','UNLOCKED','LOCKED']as FilterType[]).map(f=><Pressable key={f}onPress={()=>onFilterChange(f)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Box px={3}py={1}borderRadius={12}bg={filter===f?theme.colors.accent.purple:'transparent'}style={{borderWidth:1,borderColor:filter===f?theme.colors.primary[500]:theme.colors.border.DEFAULT}}>
              <Text variant="caption"color={filter===f?'#FFFFFF':theme.colors.text.secondary}>
                {f==='ALL'?'All':f==='UNLOCKED'?'Unlocked':'Locked'}
              </Text>
            </Box>
          </Pressable>)}
      </Box>

      {}
      <Box flexDirection="row"alignItems="center"gap={2}>
        <Text variant="caption"color={theme.colors.text.tertiary}>Sort:</Text>
        <Pressable onPress={()=>{const sorts:SortType[]=['RARITY','RECENT','CATEGORY'];const currentIndex=sorts.indexOf(sort);const nextIndex=(currentIndex+1)%sorts.length;onSortChange(sorts[nextIndex]);}}accessibilityLabel="↕️ button"accessibilityRole="button"accessibilityHint="Activates this control">
          <Box flexDirection="row"alignItems="center"gap={1}>
            <Text variant="caption"color={theme.colors.primary[500]}>
              {sort==='RARITY'?'Rarity':sort==='RECENT'?'Recent':'Category'}
            </Text>
            <Text style={{fontSize:12}}>↕️</Text>
          </Box>
        </Pressable>
      </Box>
    </Box>;};const AchievementCard:React.FC<{achievement:AchievementWithStatus;onPress:()=>void;}>=({achievement,onPress})=>{const{theme}=useTheme();const display=getAchievementDisplayInfo(achievement,achievement.isUnlocked);const rarityColor=getRarityColor(achievement.rarity);return<Pressable onPress={onPress}style={({pressed})=>[pressed&&{opacity:0.7}]}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
      <Animated.View entering={FadeInUp.duration(200)}>
        <Box p={4}mx={4}my={2}borderRadius={16}bg={theme.colors.background.secondary}style={{borderWidth:2,borderColor:achievement.isUnlocked?rarityColor:theme.colors.border.DEFAULT,opacity:achievement.isUnlocked?1:0.7}}>
          <Box flexDirection="row"alignItems="center"gap={3}>
            {}
            <Box width={56}height={56}borderRadius={28}bg={achievement.isUnlocked?`${rarityColor}20`:theme.colors.background.tertiary}alignItems="center"justifyContent="center"style={{borderWidth:2,borderColor:achievement.isUnlocked?rarityColor:theme.colors.border.DEFAULT}}>
              <Text style={{fontSize:28,opacity:achievement.isUnlocked?1:0.5}}>
                {display.icon}
              </Text>
            </Box>

            {}
            <Box flex={1}>
              <Box flexDirection="row"alignItems="center"gap={2}mb={1}>
                <Text variant="h4"color={achievement.isUnlocked?theme.colors.text.primary:theme.colors.text.tertiary}numberOfLines={1}>
                  {display.title}
                </Text>
                <Box px={2}py={0.5}borderRadius={4}style={{backgroundColor:`${rarityColor}30`}}>
                  <Text variant="caption"color={rarityColor}fontWeight="bold">
                    {achievement.rarity}
                  </Text>
                </Box>
              </Box>

              <Text variant="bodySmall"color={achievement.isUnlocked?theme.colors.text.secondary:theme.colors.text.tertiary}numberOfLines={2}>
                {display.description}
              </Text>

              {}
              {!achievement.isUnlocked&&achievement.progress>0&&<Box mt={2}>
                  <Box height={4}borderRadius={2}bg={theme.colors.background.tertiary}style={{overflow:'hidden'}}>
                    <Box height="100%"borderRadius={2}bg={rarityColor}style={{width:`${achievement.completionPercentage}%`}}/>
                  </Box>
                  <Text variant="caption"color={theme.colors.text.tertiary}mt={1}>
                    {achievement.progress} / {achievement.progressMax}
                  </Text>
                </Box>}

              {}
              {achievement.isUnlocked&&achievement.unlockedAt&&<Text variant="caption"color={theme.colors.success.DEFAULT}mt={1}>
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </Text>}
            </Box>

            {}
            <Box alignItems="center">
              <Text variant="h4"color={rarityColor}>
                {achievement.pointValue}
              </Text>
              <Text variant="caption"color={theme.colors.text.tertiary}>pts</Text>
            </Box>
          </Box>
        </Box>
      </Animated.View>
    </Pressable>;};const AchievementSkeletonCard:React.FC=()=>{const{theme}=useTheme();return<Box p={4}mx={4}my={2}borderRadius={16}bg={theme.colors.background.secondary}>
      <Box flexDirection="row"alignItems="center"gap={3}>
        <Skeleton width={56}height={56}/>
        <Box flex={1}gap={2}>
          <Skeleton width={120}height={20}/>
          <Skeleton width={200}height={14}/>
        </Box>
        <Skeleton width={40}height={24}/>
      </Box>
    </Box>;};const EmptyState:React.FC=()=>{const{theme}=useTheme();return<Box flex={1}alignItems="center"justifyContent="center"p={8}>
      <Text style={{fontSize:64}}>🏆</Text>
      <Text variant="h3"color={theme.colors.text.secondary}textAlign="center"mt={4}>
        No achievements yet
      </Text>
      <Text variant="body"color={theme.colors.text.tertiary}textAlign="center"mt={2}>
        Start your first focus session to begin collecting achievements!
      </Text>
    </Box>;};export const AchievementsScreen:React.FC=()=>{const{theme}=useTheme();const queryClient=useQueryClient();const userId='current-user';const{data:achievements,isLoading}=useAchievements(userId);const{data:stats}=useAchievementStats(userId);const[selectedCategory,setSelectedCategory]=useState<AchievementCategory|'ALL'>('ALL');const[filter,setFilter]=useState<FilterType>('ALL');const[sort,setSort]=useState<SortType>('RARITY');const[selectedAchievement,setSelectedAchievement]=useState<AchievementWithStatus|null>(null);const filteredAchievements=useMemo(()=>{if(!achievements){return[];}let result=[...achievements];if(selectedCategory!=='ALL'){result=result.filter(a=>a.category===selectedCategory);}if(filter==='UNLOCKED'){result=result.filter(a=>a.isUnlocked);}else if(filter==='LOCKED'){result=result.filter(a=>!a.isUnlocked);}result.sort((a,b)=>{if(sort==='RARITY'){const aIndex=RARITY_ORDER.indexOf(a.rarity);const bIndex=RARITY_ORDER.indexOf(b.rarity);return aIndex-bIndex;}if(sort==='RECENT'){const aTime=a.unlockedAt||0;const bTime=b.unlockedAt||0;return bTime-aTime;}if(sort==='CATEGORY'){const aIndex=CATEGORY_ORDER.indexOf(a.category);const bIndex=CATEGORY_ORDER.indexOf(b.category);return aIndex-bIndex;}return 0;});return result;},[achievements,selectedCategory,filter,sort]);const handleRefresh=useCallback(()=>{queryClient.invalidateQueries({queryKey:achievementKeys.list(userId)});},[queryClient,userId]);const handleAchievementPress=useCallback((achievement:AchievementWithStatus)=>{setSelectedAchievement(achievement);},[]);if(isLoading){return<Box flex={1}bg={theme.colors.background.primary}>
        <Box p={4}>
          <Skeleton width={200}height={32}/>
          <Skeleton width={150}height={20}/>
        </Box>
        <FlashList data={[1,2,3,4,5,6]}renderItem={()=><AchievementSkeletonCard/>}estimatedItemSize={100}keyExtractor={(item:number)=>item.toString()}/>
      </Box>;}if(!filteredAchievements.length){return<Box flex={1}bg={theme.colors.background.primary}>
        <CategoryTabs selected={selectedCategory}onSelect={setSelectedCategory}/>
        <FilterSortBar filter={filter}onFilterChange={setFilter}sort={sort}onSortChange={setSort}/>
        <EmptyState/>
      </Box>;}return<Box flex={1}bg={theme.colors.background.primary}>
      {}
      {stats&&<AchievementsHeader total={stats.total}unlocked={stats.unlocked}totalPoints={stats.totalPoints}pointsEarned={stats.pointsEarned}/>}

      {}
      <CategoryTabs selected={selectedCategory}onSelect={setSelectedCategory}/>

      {}
      <FilterSortBar filter={filter}onFilterChange={setFilter}sort={sort}onSortChange={setSort}/>

      {selectedAchievement&&<Box p={4}bg={theme.colors.background.secondary}mb={4}>
          <Box flexDirection="row"justifyContent="space-between"alignItems="center">
            <Box flex={1}>
              <Text variant="h3"color={theme.colors.text.primary}>
                {selectedAchievement.title}
              </Text>
              <Text variant="body"color={theme.colors.text.secondary}mt={1}>
                {selectedAchievement.description}
              </Text>
            </Box>
            <Pressable onPress={()=>setSelectedAchievement(null)}style={({pressed})=>[pressed&&{opacity:0.8}]}accessibilityLabel="Close button"accessibilityRole="button"accessibilityHint="Activates this control">
              <Text variant="body"color={theme.colors.text.secondary}>
                Close
              </Text>
            </Pressable>
          </Box>
        </Box>}

      {}
      <FlashList data={filteredAchievements}renderItem={({item}:{item:AchievementWithStatus;})=><AchievementCard achievement={item}onPress={()=>handleAchievementPress(item)}/>}estimatedItemSize={120}keyExtractor={(item:AchievementWithStatus)=>item.id}contentContainerStyle={{paddingBottom:20}}refreshing={isLoading}onRefresh={handleRefresh}ListEmptyComponent={<EmptyState/>}/>
    </Box>;};export default AchievementsScreen;
