import React,{useState,useCallback,useMemo}from'react';import{Pressable,ScrollView,View}from'react-native';import Animated,{FadeInUp}from'react-native-reanimated';import{Box,Text,Button,Skeleton}from'@/components/primitives';import{useTheme}from'@/theme';import{FlashList}from'@shopify/flash-list';import{useInventory,useFilteredInventory,inventoryKeys,useInventoryStats}from'@/features/inventory/hooks';import type{InventoryItem,InventoryFilter,ItemType}from'@/features/inventory/schemas';import{useQueryClient}from'@tanstack/react-query';import{InventoryGrid}from'@/features/inventory/components/inventory-grid';type TabType='ALL'|ItemType;const TABS:{id:TabType;label:string;icon:string;}[]=[{id:'ALL',label:'All',icon:'🎒'},{id:'CONSUMABLE',label:'Consumables',icon:'🧪'},{id:'EQUIPMENT',label:'Equipment',icon:'⚔️'},{id:'COSMETIC',label:'Cosmetics',icon:'👑'},{id:'CRAFTING',label:'Crafting',icon:'🔧'}];const InventoryHeader:React.FC<{totalItems:number;uniqueItems:number;equippedCount:number;}>=({totalItems,uniqueItems,equippedCount})=>{const{theme}=useTheme();return<Box p={4}bg={theme.colors.background.secondary}>
      <Box flexDirection="row"justifyContent="space-between"alignItems="center">
        <Box>
          <Text variant="caption"color={theme.colors.text.tertiary}mb={1}>
            YOUR COLLECTION
          </Text>
          <Text variant="h2"color={theme.colors.text.primary}>
            {uniqueItems} / {totalItems}
          </Text>
          <Text variant="caption"color={theme.colors.text.secondary}>
            Unique Items
          </Text>
        </Box>

        {equippedCount>0&&<Box px={3}py={2}borderRadius={12}bg={theme.colors.primary[500]}>
            <Box flexDirection="row"alignItems="center"gap={2}>
              <Text style={{fontSize:16}}>⚔️</Text>
              <Text variant="body"color="#FFFFFF"fontWeight="bold">
                {equippedCount} Equipped
              </Text>
            </Box>
          </Box>}
      </Box>
    </Box>;};const TabBar:React.FC<{activeTab:TabType;onTabChange:(tab:TabType)=>void;itemCounts:Record<TabType,number>;}>=({activeTab,onTabChange,itemCounts})=>{const{theme}=useTheme();return<Box py={2}bg={theme.colors.background.secondary}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}contentContainerStyle={{paddingHorizontal:16}}>
        <Box flexDirection="row"gap={2}>
          {TABS.map(tab=>{const isActive=activeTab===tab.id;const count=itemCounts[tab.id]||0;return<Pressable key={tab.id}onPress={()=>onTabChange(tab.id)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                <Box px={4}py={2}borderRadius={20}bg={isActive?theme.colors.primary[500]:theme.colors.background.tertiary}style={{opacity:isActive?1:0.7}}>
                  <Box flexDirection="row"alignItems="center"gap={2}>
                    <Text style={{fontSize:16}}>{tab.icon}</Text>
                    <Text variant="body"color={isActive?'#FFFFFF':theme.colors.text.secondary}fontWeight={isActive?'semibold':'normal'}>
                      {tab.label}
                    </Text>
                    {count>0&&<Box px={2}py={0.5}borderRadius={8}bg={isActive?'rgba(255,255,255,0.3)':theme.colors.background.secondary}>
                        <Text variant="caption"color={isActive?'#FFFFFF':theme.colors.text.tertiary}>
                          {count}
                        </Text>
                      </Box>}
                  </Box>
                </Box>
              </Pressable>;})}
        </Box>
      </ScrollView>
    </Box>;};const EquipmentLoadoutPanel:React.FC<{equippedItems:InventoryItem[];onUnequip:(itemId:string)=>void;isVisible:boolean;onToggle:()=>void;}>=({equippedItems,onUnequip,isVisible,onToggle})=>{const{theme}=useTheme();if(!isVisible){return<Pressable onPress={onToggle}accessibilityLabel="⚔️ Equipment Loadout ▶ button"accessibilityRole="button"accessibilityHint="Activates this control">
        <Box p={3}bg={theme.colors.background.secondary}flexDirection="row"alignItems="center"justifyContent="space-between">
          <Box flexDirection="row"alignItems="center"gap={2}>
            <Text style={{fontSize:20}}>⚔️</Text>
            <Text variant="body"color={theme.colors.text.primary}>
              Equipment Loadout
            </Text>
          </Box>
          <Text style={{fontSize:16}}>▶</Text>
        </Box>
      </Pressable>;}return<Box bg={theme.colors.background.secondary}>
      <Pressable onPress={onToggle}accessibilityLabel="⚔️ Equipment Loadout ( /5) ▼ button"accessibilityRole="button"accessibilityHint="Activates this control">
        <Box p={3}flexDirection="row"alignItems="center"justifyContent="space-between">
          <Box flexDirection="row"alignItems="center"gap={2}>
            <Text style={{fontSize:20}}>⚔️</Text>
            <Text variant="body"color={theme.colors.text.primary}>
              Equipment Loadout ({equippedItems.length}/5)
            </Text>
          </Box>
          <Text style={{fontSize:16}}>▼</Text>
        </Box>
      </Pressable>

      <Box p={4}>
        {equippedItems.length===0?<Box p={4}borderRadius={12}bg={theme.colors.background.tertiary}alignItems="center">
            <Text style={{fontSize:32}}>🎒</Text>
            <Text variant="body"color={theme.colors.text.secondary}mt={2}textAlign="center">
              No equipment equipped. Tap on equipment items to equip them.
            </Text>
          </Box>:<Box flexDirection="row"flexWrap="wrap"gap={2}>
            {equippedItems.map((item,index)=><Animated.View key={item.id}entering={FadeInUp.delay(index*100)}style={{width:'18%',aspectRatio:1}}>
                <Box flex={1}borderRadius={8}bg={theme.colors.background.tertiary}alignItems="center"justifyContent="center"style={{borderWidth:2,borderColor:theme.colors.primary[500]}}>
                  <Text style={{fontSize:24}}>⚔️</Text>
                  <Pressable onPress={()=>onUnequip(item.id)}style={{position:'absolute',top:-4,right:-4,width:20,height:20,backgroundColor:theme.colors.error.DEFAULT,borderRadius:10,alignItems:'center',justifyContent:'center'}}accessibilityLabel="× button"accessibilityRole="button"accessibilityHint="Activates this control">
                    <Text style={{fontSize:12,color:'#FFFFFF'}}>×</Text>
                  </Pressable>
                </Box>
              </Animated.View>)}
            {}
            {Array.from({length:Math.max(0,5-equippedItems.length)}).map((_,i)=><Box key={`empty-${i}`}width="18%"aspectRatio={1}borderRadius={8}borderWidth={1}borderColor={theme.colors.border.DEFAULT}bg={theme.colors.background.tertiary}style={{opacity:0.5}}/>)}
          </Box>}
      </Box>
    </Box>;};const ItemDetailModal:React.FC<{item:InventoryItem|null;visible:boolean;onClose:()=>void;onUse?:()=>void;onEquip?:()=>void;onUnequip?:()=>void;}>=({item,visible,onClose,onUse,onEquip,onUnequip})=>{if(!visible||!item){return null;}return<View style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'}}>
      <Pressable onPress={onClose}style={{flex:1}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control"/>
      <Box bg="white"style={{borderTopLeftRadius:24,borderTopRightRadius:24,minHeight:300,padding:20}}>
        <Text>Item Detail for {item.id}</Text>
        <Button onPress={onClose}accessibilityLabel="Close button"accessibilityRole="button"accessibilityHint="Activates this control">Close</Button>
      </Box>
    </View>;};export const InventoryScreen:React.FC=()=>{const{theme}=useTheme();const queryClient=useQueryClient();const userId='current-user';const[activeTab,setActiveTab]=useState<TabType>('ALL');const[selectedItem,setSelectedItem]=useState<InventoryItem|null>(null);const[showLoadout,setShowLoadout]=useState(false);const filter=useMemo<InventoryFilter>(()=>{const baseFilter:InventoryFilter={sortBy:'acquiredAt',sortOrder:'desc'};if(activeTab!=='ALL'){return{...baseFilter,types:[activeTab]};}return baseFilter;},[activeTab]);const{data:inventory,isLoading,isError,refetch}=useFilteredInventory(userId,filter);const{data:stats}=useInventoryStats(userId);const itemCounts=useMemo(()=>{const counts:Record<TabType,number>={ALL:stats?.totalItems||0,CONSUMABLE:0,EQUIPMENT:0,COSMETIC:0,CRAFTING:0,COLLECTIBLE:0};if(inventory){inventory.forEach(item=>{});}return counts;},[inventory,stats]);const equippedItems=useMemo(()=>{return inventory?.filter(item=>item.status==='EQUIPPED')||[];},[inventory]);const handleItemPress=useCallback((item:InventoryItem)=>{setSelectedItem(item);},[]);const handleItemLongPress=useCallback((item:InventoryItem)=>{setSelectedItem(item);},[]);const handleCloseModal=useCallback(()=>{setSelectedItem(null);},[]);const handleUnequip=useCallback((itemId:string)=>{setSelectedItem(current=>current?.id===itemId?null:current);void queryClient.invalidateQueries({queryKey:inventoryKeys.state(userId)});},[queryClient,userId]);if(isLoading){return<Box flex={1}bg={theme.colors.background.primary}>
        <Box p={4}>
          <Skeleton width={200}height={32}/>
          <Skeleton width={150}height={20}mt={2}/>
        </Box>
        <Box p={4}>
          <Skeleton width="100%"height={40}borderRadius={20}/>
        </Box>
        <Box flex={1}p={4}>
          <Box flexDirection="row"flexWrap="wrap">
            {Array.from({length:12}).map((_,i)=><Box key={i}width="23%"margin="1%">
                <Skeleton width="100%"height={88}borderRadius={16}/>
              </Box>)}
          </Box>
        </Box>
      </Box>;}if(isError){return<Box flex={1}bg={theme.colors.background.primary}alignItems="center"justifyContent="center"p={8}>
        <Text style={{fontSize:48}}>⚠️</Text>
        <Text variant="h3"color={theme.colors.text.secondary}mt={4}textAlign="center">
          Failed to load inventory
        </Text>
        <Button variant="primary"onPress={()=>(refetch)()}mt={4}accessibilityLabel="Retry button"accessibilityRole="button"accessibilityHint="Activates this control">
          Retry
        </Button>
      </Box>;}return<Box flex={1}bg={theme.colors.background.primary}>
      {}
      {stats&&<InventoryHeader totalItems={stats.totalItems}uniqueItems={stats.uniqueItems}equippedCount={equippedItems.length}/>}

      {}
      <EquipmentLoadoutPanel equippedItems={equippedItems}onUnequip={handleUnequip}isVisible={showLoadout}onToggle={()=>setShowLoadout(!showLoadout)}/>

      {}
      <TabBar activeTab={activeTab}onTabChange={setActiveTab}itemCounts={itemCounts}/>

      {}
      <Box flex={1}>
        <InventoryGrid userId={userId}onItemPress={handleItemPress}onItemLongPress={handleItemLongPress}filter={filter}/>
      </Box>

      {}
      <ItemDetailModal item={selectedItem}visible={!!selectedItem}onClose={handleCloseModal}/>
    </Box>;};export default InventoryScreen;
