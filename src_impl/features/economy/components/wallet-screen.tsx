import React,{useState,useCallback,useMemo}from'react'; import{View,Text,ScrollView,Pressable,RefreshControl,ActivityIndicator,Dimensions}from'react-native'; import{FlashList}from'@shopify/flash-list'; import{useWallet,useTransactionHistory,useBalance,economyKeys}from'../hooks'; import type{WalletTransaction,TransactionSource,CurrencyType}from'../schemas'; import{createSheet}from'@/shared/ui/create-sheet'; const{width} = Dimensions.get('window'); interface WalletScreenProps{userId:string}type TransactionFilter='ALL'|CurrencyType|TransactionSource;interface BalanceCardProps{type:'COINS'|'GEMS'|'SEASONAL';amount:number;icon:string;color:string;subtitle?:string}function BalanceCard({type,amount,icon,color,subtitle}:BalanceCardProps){return<View style={[styles.balanceCard,{backgroundColor:color}]}>
      <Text style={styles.balanceIcon}>{icon}</Text>
      <Text style={styles.balanceAmount}>{amount.toLocaleString()}</Text>
      <Text style={styles.balanceType}>{type}</Text>
      {subtitle && <Text style={styles.balanceSubtitle}>{subtitle}</Text>}
    </View>;}interface TransactionItemProps{transaction:WalletTransaction}const SOURCE_ICONS:Record<TransactionSource,string> = {SESSION:'\u23F1\uFE0F',STREAK:'\uD83D\uDD25',BOSS:'\uD83D\uDC79',LEVEL_UP:'\u2B06\uFE0F',SHOP:'\uD83D\uDED2',REWARD:'\uD83C\uDF81',CRAFTING:'\uD83D\uDD27',SQUAD:'\uD83D\uDC65',DAILY_LOGIN:'\uD83D\uDCC5',ACHIEVEMENT:'\uD83C\uDFC6',FOCUS_POINTS:'\uD83C\uDFAF',PROMOTION:'\uD83D\uDCE2',REFUND:'\u21A9\uFE0F'}; function TransactionItem({transaction}:TransactionItemProps){const isEarn = transaction.type === 'EARN' || transaction.type === 'GIFT_RECEIVE' || transaction.type === 'REFUND'; const icon = SOURCE_ICONS[transaction.source] ?? '\uD83D\uDCB0'; const formatDate = (timestamp:number)=>{const date = new Date(timestamp); return date.toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}; return<View style={styles.transactionItem}>
      <View style={[styles.transactionIcon,{backgroundColor:isEarn ? '#10B98120' : '#EF444420'}]}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
        <Text style={styles.transactionSource}>{transaction.source}</Text>
        <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[styles.amountText,isEarn ? styles.amountEarn : styles.amountSpend]}>
          {isEarn ? '+' : '-'}{transaction.amount.toLocaleString()}
        </Text>
        <Text style={styles.currencyLabel}>{transaction.currency}</Text>
      </View>
    </View>;}const FILTERS:{key:TransactionFilter;label:string}[] = [{key:'ALL',label:'All'},{key:'COINS',label:'Coins'},{key:'GEMS',label:'Gems'},{key:'SESSION',label:'Sessions'},{key:'SHOP',label:'Shop'}]; function WalletSkeleton(){return<View style={styles.container}>
      {}
      <View style={styles.balanceRow}>
        {[1,2].map(i=><View key={i}style={[styles.balanceCard,styles.skeleton,{backgroundColor:'#1e293b'}]}>
            <View style={styles.skeletonText}/>
            <View style={[styles.skeletonText,{width:80}]}/>
          </View>)}
      </View>

      {}
      <View style={styles.filterBar}>
        {FILTERS.map((_,i)=><View key={i}style={[styles.filterChip,styles.skeleton]}/>)}
      </View>

      {}
      {Array(8).fill(null).map((_,i)=><View key={i}style={styles.transactionItem}>
          <View style={[styles.transactionIcon,styles.skeleton]}/>
          <View style={styles.transactionInfo}>
            <View style={[styles.skeletonText,{width:150}]}/>
            <View style={[styles.skeletonText,{width:80}]}/>
          </View>
        </View>)}
    </View>;}function EmptyTransactions({onRefresh}:{onRefresh:()=>void}){return<View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptySubtitle}>
        Complete sessions, make purchases, or earn rewards to see your transaction history here.
      </Text>
      <Pressable onPress={onRefresh}style={({pressed})=>[styles.refreshButton,pressed && {opacity:0.8}]}
  accessibilityLabel="Refresh button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </Pressable>
    </View>;}function WalletError({error,onRetry}:{error:Error;onRetry:()=>void}){return<View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Failed to Load Wallet</Text>
      <Text style={styles.errorSubtitle}>{error.message}</Text>
      <Pressable onPress={onRetry}style={({pressed})=>[styles.retryButton,pressed && {opacity:0.8}]}
  accessibilityLabel="Try Again button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Text style={styles.retryButtonText}>Try Again</Text>
      </Pressable>
    </View>;}export function WalletScreen({userId}:WalletScreenProps){const[selectedFilter,setSelectedFilter] = useState<TransactionFilter>('ALL'); const walletQuery = useWallet(userId); const coinsQuery = useBalance(userId,'COINS'); const gemsQuery = useBalance(userId,'GEMS'); const transactionsQuery = useTransactionHistory(userId,{currency:selectedFilter === 'COINS' || selectedFilter === 'GEMS' || selectedFilter === 'SEASONAL' ? selectedFilter : undefined,source:selectedFilter !== 'ALL' && selectedFilter !== 'COINS' && selectedFilter !== 'GEMS' && selectedFilter !== 'SEASONAL' ? selectedFilter : undefined,limit:50}); const isLoading = walletQuery.isLoading || transactionsQuery.isLoading; const isError = walletQuery.isError || transactionsQuery.isError; const error = walletQuery.error || transactionsQuery.error; const isRefreshing = walletQuery.isRefetching || transactionsQuery.isRefetching; const stats = useMemo(()=>{const transactions = transactionsQuery.data ?? []; const earned = transactions.filter(t=>t.type === 'EARN').reduce((sum,t)=>sum + t.amount,0); const spent = transactions.filter(t=>t.type === 'SPEND').reduce((sum,t)=>sum + t.amount,0); return{earned,spent,net:earned - spent};},[transactionsQuery.data]); const handleRefresh = useCallback(()=>{walletQuery.refetch(); transactionsQuery.refetch();},[walletQuery,transactionsQuery]); if(isLoading){return<WalletSkeleton/>;}if(isError && error){return<WalletError error={error instanceof Error ? error : new Error('Unknown error')}onRetry={handleRefresh}/>;}const wallet = walletQuery.data; const transactions = transactionsQuery.data ?? []; const coins = coinsQuery.data ?? 0; const gems = gemsQuery.data ?? 0; const seasonalTotal = Object.values(wallet?.seasonal ?? {}).reduce((a,b)=>a + b,0); const hasSeasonal = seasonalTotal > 0; return<View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={isRefreshing}onRefresh={handleRefresh}/>}>
        {}
        <View style={styles.balanceRow}>
          <BalanceCard type="COINS"amount={coins}icon="\uD83E\uDE99"color="#F59E0B"subtitle={`Earned: ${wallet?.totalCoinsEarned.toLocaleString() ?? 0}`}/>
          <BalanceCard type="GEMS"amount={gems}icon="\uD83D\uDC8E"color="#3B82F6"subtitle={`Earned: ${wallet?.totalGemsEarned.toLocaleString() ?? 0}`}/>
        </View>

        {}
        {hasSeasonal && <View style={styles.seasonalSection}>
            <Text style={styles.sectionTitle}>✨ Seasonal Currency</Text>
            <View style={styles.seasonalRow}>
              {Object.entries(wallet?.seasonal ?? {}).map(([seasonId,amount])=><View key={seasonId}style={styles.seasonalCard}>
                  <Text style={styles.seasonalAmount}>{amount.toLocaleString()}</Text>
                  <Text style={styles.seasonalName}>{seasonId}</Text>
                </View>)}
            </View>
          </View>}

        {}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.earned.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Earned (30d)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.spent.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Spent (30d)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue,stats.net >= 0 ? styles.positive : styles.negative]}>
              {stats.net >= 0 ? '+' : ''}{stats.net.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Net</Text>
          </View>
        </View>

        {}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}style={styles.filterBar}contentContainerStyle={styles.filterContent}>
          {FILTERS.map(filter=><Pressable key={filter.key}onPress={()=>setSelectedFilter(filter.key)}style={({pressed})=>[styles.filterChip,selectedFilter === filter.key && styles.filterChipActive,pressed && {opacity:0.8}]}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              <Text style={[styles.filterChipText,selectedFilter === filter.key && styles.filterChipTextActive]}>
                {filter.label}
              </Text>
            </Pressable>)}
        </ScrollView>

        {}
        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Text style={styles.transactionCount}>{transactions.length} total</Text>
        </View>

        {}
        {transactions.length === 0 ? <EmptyTransactions onRefresh={handleRefresh}/> : <View style={styles.transactionsList}>
            <FlashList data={transactions}keyExtractor={(transaction:WalletTransaction)=>transaction.id}estimatedItemSize={72}scrollEnabled={false}renderItem={({item}:{item:WalletTransaction})=><TransactionItem transaction={item}/>}/>
          </View>}

        {}
        <View style={styles.bottomSpacer}/>
      </ScrollView>
    </View>;}const styles = createSheet({container:{flex:1,backgroundColor:'#1a1a2e'},balanceRow:{flexDirection:'row',padding:16,gap:12},balanceCard:{flex:1,borderRadius:16,padding:16,alignItems:'center'},balanceIcon:{fontSize:32,marginBottom:8},balanceAmount:{color:'#fff',fontSize:24,fontWeight:'bold',marginBottom:4},balanceType:{color:'#fff',fontSize:12,textTransform:'uppercase',opacity:0.8},balanceSubtitle:{color:'#fff',fontSize:10,opacity:0.6,marginTop:4},seasonalSection:{paddingHorizontal:16,marginBottom:16},sectionTitle:{color:'#fff',fontSize:16,fontWeight:'bold',marginBottom:12},seasonalRow:{flexDirection:'row',flexWrap:'wrap',gap:8},seasonalCard:{backgroundColor:'#16213e',borderRadius:12,padding:12,minWidth:100,alignItems:'center'},seasonalAmount:{color:'#8B5CF6',fontSize:18,fontWeight:'bold'},seasonalName:{color:'#94a3b8',fontSize:10,marginTop:4,textTransform:'capitalize'},statsSection:{flexDirection:'row',paddingHorizontal:16,gap:8,marginBottom:16},statCard:{flex:1,backgroundColor:'#16213e',borderRadius:12,padding:12,alignItems:'center'},statValue:{color:'#fff',fontSize:16,fontWeight:'bold'},statLabel:{color:'#94a3b8',fontSize:10,marginTop:4},positive:{color:'#10B981'},negative:{color:'#EF4444'},filterBar:{maxHeight:50,marginBottom:8},filterContent:{paddingHorizontal:16,gap:8,alignItems:'center'},filterChip:{paddingHorizontal:16,paddingVertical:8,borderRadius:20,backgroundColor:'#16213e'},filterChipActive:{backgroundColor:'#e94560'},filterChipText:{color:'#94a3b8',fontSize:12,fontWeight:'500'},filterChipTextActive:{color:'#fff'},transactionsHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:12},transactionCount:{color:'#94a3b8',fontSize:12},transactionsList:{paddingHorizontal:16},transactionItem:{flexDirection:'row',alignItems:'center',backgroundColor:'#16213e',borderRadius:12,padding:12,marginBottom:8},transactionIcon:{width:40,height:40,borderRadius:20,justifyContent:'center',alignItems:'center',marginRight:12},transactionInfo:{flex:1},transactionDescription:{color:'#fff',fontSize:14,fontWeight:'500',marginBottom:2},transactionSource:{color:'#94a3b8',fontSize:11,textTransform:'capitalize',marginBottom:2},transactionDate:{color:'#64748b',fontSize:10},transactionAmount:{alignItems:'flex-end'},amountText:{fontSize:16,fontWeight:'bold'},amountEarn:{color:'#10B981'},amountSpend:{color:'#EF4444'},currencyLabel:{color:'#64748b',fontSize:10,marginTop:2},emptyContainer:{alignItems:'center',paddingVertical:60},emptyIcon:{fontSize:64,marginBottom:16},emptyTitle:{color:'#fff',fontSize:18,fontWeight:'bold',marginBottom:8},emptySubtitle:{color:'#94a3b8',fontSize:14,textAlign:'center',marginBottom:24,paddingHorizontal:32},refreshButton:{paddingHorizontal:24,paddingVertical:12,backgroundColor:'#e94560',borderRadius:12},refreshButtonText:{color:'#fff',fontSize:16,fontWeight:'600'},errorContainer:{flex:1,justifyContent:'center',alignItems:'center',padding:24},errorIcon:{fontSize:64,marginBottom:16},errorTitle:{color:'#fff',fontSize:20,fontWeight:'bold',marginBottom:8},errorSubtitle:{color:'#94a3b8',fontSize:14,textAlign:'center',marginBottom:24},retryButton:{paddingHorizontal:24,paddingVertical:12,backgroundColor:'#e94560',borderRadius:12},retryButtonText:{color:'#fff',fontSize:16,fontWeight:'600'},skeleton:{backgroundColor:'#0f3460'},skeletonText:{width:60,height:16,backgroundColor:'#1e293b',borderRadius:4},bottomSpacer:{height:40}});
