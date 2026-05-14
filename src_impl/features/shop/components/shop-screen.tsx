import React,{useState,useCallback,useMemo}from'react';import{View,Text,ScrollView,Pressable,RefreshControl,Alert}from'react-native';import{useWalletSummary,useActiveOffers,useBalance}from'../../economy/hooks';import{useShopItems,useInitiatePurchase,useCompletePurchaseDelivery,useProcessPurchasePayment}from'../../shop/hooks';import{useInventory}from'../../inventory/hooks';import type{ItemDefinition}from'../../items/schemas';import type{LimitedOffer}from'../../economy/schemas';import{createSheet}from'@/shared/ui/create-sheet';import{CurrencyDisplay,ShopItemCard,PurchaseModal,ShopSkeleton,EmptyShop,ShopError,CATEGORIES,type ShopCategory}from'./';interface ShopScreenProps{userId:string;userLevel:number;}export function ShopScreen({userId,userLevel}:ShopScreenProps){const[selectedCategory,setSelectedCategory]=useState<ShopCategory>('ALL');const[selectedItem,setSelectedItem]=useState<ItemDefinition|null>(null);const[selectedOffer,setSelectedOffer]=useState<LimitedOffer|null>(null);const[purchaseError,setPurchaseError]=useState<string|null>(null);const walletQuery=useWalletSummary(userId);const coinsQuery=useBalance(userId,'COINS');const gemsQuery=useBalance(userId,'GEMS');const offersQuery=useActiveOffers(userId,userLevel);const shopItemsQuery=useShopItems(selectedCategory==='ALL'?undefined:selectedCategory);const inventoryQuery=useInventory(userId);const initiatePurchase=useInitiatePurchase();const completePurchase=useCompletePurchaseDelivery();const processPayment=useProcessPurchasePayment();const isLoading=walletQuery.isLoading||shopItemsQuery.isLoading||offersQuery.isLoading;const isError=walletQuery.isError||shopItemsQuery.isError||offersQuery.isError;const error=walletQuery.error||shopItemsQuery.error||offersQuery.error;const displayedItems=useMemo(()=>{if(selectedCategory==='OFFERS'){return[];}return shopItemsQuery.data??[];},[shopItemsQuery.data,selectedCategory]);const displayedOffers=useMemo(()=>{if(selectedCategory==='ALL'||selectedCategory==='OFFERS'){return offersQuery.data??[];}return[];},[offersQuery.data,selectedCategory]);const handleItemPress=useCallback((item:ItemDefinition,offer?:LimitedOffer)=>{setSelectedItem(item);setSelectedOffer(offer||null);setPurchaseError(null);},[]);const handlePurchaseConfirm=useCallback(async()=>{if(!selectedItem){return;}try{const result=await initiatePurchase.mutateAsync({userId,shopItemId:selectedItem.id,quantity:1,expectedPrice:{currency:'COINS',amount:selectedOffer?.discountedPrice?.amount??selectedItem.baseValue}});if(result.success&&result.purchaseId){await processPayment.mutateAsync({purchaseId:result.purchaseId,currency:'COINS',amount:selectedOffer?.discountedPrice?.amount??selectedItem.baseValue});const complete=await completePurchase.mutateAsync({purchaseId:result.purchaseId,inventoryItemIds:result.inventoryItemIds??[]});if(complete.success){Alert.alert('Purchase Successful!',`You bought ${selectedItem.name}`,[{text:'Awesome!',onPress:()=>{setSelectedItem(null);setSelectedOffer(null);}}]);(walletQuery.refetch)();(inventoryQuery.refetch)();}else{setPurchaseError((complete as{error?:{message?:string;};}).error?.message||'Purchase failed');}}else{setPurchaseError(result.error?.message||'Could not start purchase');}}catch(err){setPurchaseError(err instanceof Error?err.message:'Unknown error');}},[completePurchase,initiatePurchase,inventoryQuery,processPayment,selectedItem,selectedOffer,userId,walletQuery]);const handleCancelPurchase=useCallback(()=>{setSelectedItem(null);setSelectedOffer(null);setPurchaseError(null);},[]);const handleRefresh=useCallback(()=>{(walletQuery.refetch)();(shopItemsQuery.refetch)();(offersQuery.refetch)();},[walletQuery,shopItemsQuery,offersQuery]);if(isLoading){return<ShopSkeleton/>;}if(isError&&error){return<ShopError error={error instanceof Error?error:new Error('Unknown error')}onRetry={handleRefresh}/>;}const userCoins=coinsQuery.data??0;const userGems=gemsQuery.data??0;const hasSeasonal=walletQuery.data?.hasSeasonal??false;return<View style={styles.container}>
      {}
      <CurrencyDisplay coins={userCoins}gems={userGems}hasSeasonal={hasSeasonal}/>

      {}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}style={(styles as any).categoryBar}contentContainerStyle={(styles as any).categoryContent}>
        {CATEGORIES.map(cat=><Pressable key={cat.key}onPress={()=>setSelectedCategory(cat.key)}style={({pressed})=>[(styles as any).categoryButton,selectedCategory===cat.key&&(styles as any).categoryButtonActive,pressed&&{opacity:0.8}]}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={[(styles as any).categoryIcon,selectedCategory===cat.key&&(styles as any).categoryIconActive]}>{cat.icon}</Text>
            <Text style={[(styles as any).categoryLabel,selectedCategory===cat.key&&(styles as any).categoryLabelActive]}>{cat.label}</Text>
          </Pressable>)}
      </ScrollView>

      {}
      <ScrollView style={styles.scrollView}refreshControl={<RefreshControl refreshing={isLoading}onRefresh={handleRefresh}/>}>
        {displayedItems.length===0&&displayedOffers.length===0?<EmptyShop category={selectedCategory}onRefresh={handleRefresh}/>:<>
            {}
            {displayedOffers.length>0&&<View style={styles.section}>
                <Text style={styles.sectionTitle}>🔥 Limited Time Offers</Text>
                <View style={styles.grid}>
                  {displayedOffers.map((offer:{id:string;itemIds:string[];status:string;discountPercent:number;discountedPrice:{currency:string;amount:number;};originalPrice:{currency:string;amount:number;};})=>{const itemId=offer.itemIds[0];const item=displayedItems.find((i:ItemDefinition)=>i.id===itemId);if(!item){return null;}return<ShopItemCard key={offer.id}item={item}offer={offer as LimitedOffer}userLevel={userLevel}onPress={()=>handleItemPress(item,offer as LimitedOffer)}disabled={offer.status!=='ACTIVE'}/>;})}
                </View>
              </View>}

            {}
            {displayedItems.length>0&&<View style={styles.section}>
                <Text style={styles.sectionTitle}>{selectedCategory==='ALL'?'All Items':selectedCategory}</Text>
                <View style={styles.grid}>
                  {displayedItems.map((item:ItemDefinition)=><ShopItemCard key={item.id}item={item}userLevel={userLevel}onPress={()=>handleItemPress(item)}/>)}
                </View>
              </View>}
          </>}

        {}
        <View style={styles.bottomSpacer}/>
      </ScrollView>

      {}
      <PurchaseModal visible={selectedItem!==null}item={selectedItem}offer={selectedOffer}userCoins={userCoins}userGems={userGems}onConfirm={handlePurchaseConfirm}onCancel={handleCancelPurchase}isProcessing={initiatePurchase.isPending||completePurchase.isPending}/>

      {}
      {purchaseError&&<View style={styles.errorToast}>
          <Text style={styles.errorToastText}>{purchaseError}</Text>
        </View>}
    </View>;}const styles=createSheet({container:{flex:1,backgroundColor:'#1a1a2e'},categoryBar:{maxHeight:60,backgroundColor:'#16213e',borderBottomWidth:1,borderBottomColor:'#0f3460'},categoryContent:{paddingHorizontal:12,gap:8,alignItems:'center'},categoryButton:{flexDirection:'row',alignItems:'center',paddingHorizontal:12,paddingVertical:8,borderRadius:20,backgroundColor:'#0f3460',gap:4},categoryButtonActive:{backgroundColor:'#e94560'},categoryIcon:{fontSize:16},categoryLabel:{color:'#94a3b8',fontSize:12,fontWeight:'500'},categoryLabelActive:{color:'#fff'},scrollView:{flex:1},section:{padding:16},sectionTitle:{color:'#fff',fontSize:18,fontWeight:'bold',marginBottom:12},grid:{flexDirection:'row',flexWrap:'wrap',gap:12},errorToast:{position:'absolute',bottom:100,left:24,right:24,backgroundColor:'#ef4444',padding:12,borderRadius:8,alignItems:'center'},errorToastText:{color:'#fff',fontSize:14,fontWeight:'500'},bottomSpacer:{height:40}});
