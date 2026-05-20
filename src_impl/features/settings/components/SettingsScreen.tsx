import { captureSilentFailure } from '../../../utils/silent-failure';
import React,{useState,useCallback}from'react'; import{View,Text,ScrollView,Pressable,ActivityIndicator,RefreshControl,Alert}from'react-native'; import{useSettingsUIState,useSyncSettings,useResetSettings}from'../hooks'; import{type SettingCategory}from'../types'; import{eventBus}from'../../../events'; import*as Sentry from'@sentry/react-native'; import{SettingItem}from'./SettingItem'; import{ToggleSetting}from'./ToggleSetting'; import{SliderSetting}from'./SliderSetting'; import{createSheet}from'@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
 type SettingsState='idle'|'loading'|'error'|'saving'|'syncing';interface SettingsScreenProps{userId:string;initialCategory?:SettingCategory;onBackPress?:()=>void;onCategoryChange?:(category:SettingCategory)=>void}const CATEGORIES:Array<{key:SettingCategory;label:string;icon:string}> = [{key:'general',label:'General',icon:'\u2699\uFE0F'},{key:'notifications',label:'Notifications',icon:'\uD83D\uDD14'},{key:'coach',label:'Coach',icon:'\uD83C\uDFAF'},{key:'appearance',label:'Appearance',icon:'\uD83C\uDFA8'},{key:'privacy',label:'Privacy',icon:'\uD83D\uDD12'},{key:'data',label:'Data',icon:'\uD83D\uDCBE'}]; export function SettingsScreen({userId,initialCategory = 'general',onBackPress,onCategoryChange}:SettingsScreenProps){const[activeCategory,setActiveCategory] = useState<SettingCategory>(initialCategory); const[settingsState,setSettingsState] = useState<SettingsState>('idle'); const{isLoading,isError,error,preferences,notifications,coach,appearance,privacy,refetch} = useSettingsUIState(userId); const syncMutation = useSyncSettings(userId); const resetMutation = useResetSettings(userId); const handleRefresh = useCallback(async()=>{setSettingsState('loading'); try{await (refetch)(); setSettingsState('idle');}catch (error) { captureSilentFailure(error, { feature: 'settings', operation: 'ui-fallback', type: 'ui' }); setSettingsState('error');}},[refetch]); const handleSync = useCallback(async()=>{setSettingsState('syncing'); try{await syncMutation.mutateAsync({}); setSettingsState('idle'); Sentry.addBreadcrumb({category:'settings',message:'Settings synced successfully',level:'info'});}catch(err){setSettingsState('error'); Sentry.captureException(err,{tags:{operation:'settingsSync'}});}},[syncMutation]); const handleReset = useCallback(()=>{Alert.alert('Reset Settings',`Are you sure you want to reset ${activeCategory} settings to defaults?`,[{text:'Cancel',style:'cancel'},{text:'Reset',style:'destructive',onPress:async()=>{setSettingsState('saving'); try{await resetMutation.mutateAsync({category:activeCategory}); setSettingsState('idle'); eventBus.publish('settings:reset',{category:activeCategory});}catch(err){setSettingsState('error');}}}]);},[activeCategory,resetMutation]); const handleCategoryChange = useCallback((category:SettingCategory)=>{setActiveCategory(category); onCategoryChange?.(category);},[onCategoryChange]); const renderContent = ()=>{if(isLoading || settingsState === 'loading'){return<View style={styles.centerContainer}>
          <ActivityIndicator size="large"color={launchColors.hex_6366f1}/>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>;}if(isError || settingsState === 'error'){return<View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to load settings</Text>
          <Text style={styles.errorMessage}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
          <Pressable style={({pressed})=>[styles.retryButton,pressed && {opacity:0.8}]}onPress={handleRefresh}
  accessibilityLabel="Retry button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>;}return<ScrollView style={styles.contentScroll}refreshControl={<RefreshControl refreshing={isLoading}onRefresh={handleRefresh}/>}>
        {}
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>
            {CATEGORIES.find(c=>c.key === activeCategory)?.label}
          </Text>
          {settingsState === 'syncing' && <ActivityIndicator size="small"color={launchColors.hex_6366f1}/>}
        </View>

        {}
        {renderCategorySettings()}

        {}
        <View style={styles.actionsContainer}>
          <Pressable style={({pressed})=>[styles.actionButton,pressed && {opacity:0.8}]}onPress={handleSync}disabled={settingsState === 'syncing'}
  accessibilityLabel="Sync button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            <Text style={styles.actionButtonText}>
              {settingsState === 'syncing' ? 'Syncing...' : 'Sync Now'}
            </Text>
          </Pressable>

          <Pressable style={({pressed})=>[styles.actionButton,styles.dangerButton,pressed && {opacity:0.8}]}onPress={handleReset}disabled={settingsState === 'saving'}
  accessibilityLabel="Reset to Defaults button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            <Text style={[styles.actionButtonText,styles.dangerButtonText]}>
              Reset to Defaults
            </Text>
          </Pressable>
        </View>
      </ScrollView>;}; const renderCategorySettings = ()=>{switch(activeCategory){case'general':return<View style={styles.settingsGroup}>
            <SettingItem label="Language"value={preferences?.settings?.['general.language']?.value ?? 'en'}onPress={()=>{}}/>
            <SettingItem label="Timezone"value={preferences?.settings?.['general.timezone']?.value ?? Intl.DateTimeFormat().resolvedOptions().timeZone}onPress={()=>{}}/>
          </View>; case'notifications':return<View style={styles.settingsGroup}>
            <ToggleSetting label="Push Notifications"value={notifications?.channels?.push?.enabled ?? true}onToggle={value=>{}}/>
            <ToggleSetting label="Email Notifications"value={notifications?.channels?.email?.enabled ?? true}onToggle={value=>{}}/>
            <ToggleSetting label="In-App Notifications"value={notifications?.channels?.inApp?.enabled ?? true}onToggle={value=>{}}/>
            <SettingItem label="Quiet Hours"value={`${notifications?.channels?.push?.quietHoursStart ?? 22}:00 - ${notifications?.channels?.push?.quietHoursEnd ?? 8}:00`}onPress={()=>{}}/>
          </View>; case'coach':return<View style={styles.settingsGroup}>
            <ToggleSetting label="Enable Coach"value={coach?.enabled ?? true}onToggle={value=>{}}/>
            <SettingItem label="Personality"value={coach?.personality ?? 'supportive'}onPress={()=>{}}/>
            <SettingItem label="Frequency"value={coach?.frequency ?? 'moderate'}onPress={()=>{}}/>
            <ToggleSetting label="Streak Reminders"value={coach?.messageTypes?.streakReminders ?? true}onToggle={value=>{}}/>
            <ToggleSetting label="Session Tips"value={coach?.messageTypes?.sessionTips ?? true}onToggle={value=>{}}/>
          </View>; case'appearance':return<View style={styles.settingsGroup}>
            <SettingItem label="Theme"value={appearance?.theme ?? 'system'}onPress={()=>{}}/>
            <SettingItem label="Accent Color"value={appearance?.accentColor ?? launchColors.hex_6366f1}onPress={()=>{}}/>
            <SliderSetting label="Font Scale"value={appearance?.fontScale ?? 1}min={0.5}max={2}onChange={value=>{}}/>
            <ToggleSetting label="Reduce Motion"value={appearance?.reduceMotion ?? false}onToggle={value=>{}}/>
            <ToggleSetting label="High Contrast"value={appearance?.highContrast ?? false}onToggle={value=>{}}/>
          </View>; case'privacy':return<View style={styles.settingsGroup}>
            <SettingItem label="Profile Visibility"value={privacy?.profileVisibility ?? 'friends'}onPress={()=>{}}/>
            <ToggleSetting label="Show Online Status"value={privacy?.showOnlineStatus ?? true}onToggle={value=>{}}/>
            <ToggleSetting label="Allow Data Analysis"value={privacy?.allowDataAnalysis ?? true}onToggle={value=>{}}/>
            <ToggleSetting label="Opt Out of Analytics"value={privacy?.analyticsOptOut ?? false}onToggle={value=>{}}/>
          </View>; case'data':return<View style={styles.settingsGroup}>
            <SettingItem label="Data Retention"value="standard"onPress={()=>{}}/>
            <SettingItem label="Auto Export"value="disabled"onPress={()=>{}}/>
            <Pressable style={({pressed})=>[styles.actionRow,pressed && {opacity:0.8}]}onPress={()=>{eventBus.publish('analytics:export_requested',{jobId:`export_${Date.now()}`,userId,format:'json'});}}
  accessibilityLabel="Export Data button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              <View>
                <Text style={styles.actionRowText}>Export Data</Text>
                <Text style={styles.actionRowSubtext}>Download your data →</Text>
              </View>
              <Text style={styles.actionRowArrow}>→</Text>
            </Pressable>
            <Pressable style={({pressed})=>[styles.actionRow,pressed && {opacity:0.8}]}onPress={()=>{Alert.alert('Import Data','Import data from a previous export file.',[{text:'Cancel',style:'cancel'},{text:'Select File',style:'default'}]);}}
  accessibilityLabel="Import Data button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              <View>
                <Text style={styles.actionRowText}>Import Data</Text>
                <Text style={styles.actionRowSubtext}>Restore from backup →</Text>
              </View>
              <Text style={styles.actionRowArrow}>→</Text>
            </Pressable>

            {}
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Danger Zone</Text>
              <Pressable style={({pressed})=>[styles.dangerAction,pressed && {opacity:0.8}]}onPress={()=>{Alert.alert('Delete All Data?','This will permanently delete all your data. This action cannot be undone.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>{Alert.alert('Final Confirmation','Type "DELETE" to permanently delete all data.',[{text:'Cancel',style:'cancel'},{text:'Delete Forever',style:'destructive'}]);}}]);}}
  accessibilityLabel="Delete All My Data button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                <Text style={styles.dangerActionText}>Delete All My Data</Text>
              </Pressable>
            </View>
          </View>; default:return null;}}; return<View style={styles.container}>
      {}
      <View style={styles.header}>
        <Pressable onPress={onBackPress}style={({pressed})=>[styles.backButton,pressed && {opacity:0.8}]}
  accessibilityLabel="Back button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer}/>
      </View>

      {}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}style={styles.tabsContainer}contentContainerStyle={styles.tabsContent}>
        {CATEGORIES.map(category=><Pressable key={category.key}style={({pressed})=>[styles.tab,activeCategory === category.key && styles.activeTab,pressed && {opacity:0.8}]}onPress={()=>handleCategoryChange(category.key)}
  accessibilityLabel={`${category.label} category button`}
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            <Text style={styles.tabIcon}>{category.icon}</Text>
            <Text style={[styles.tabLabel,activeCategory === category.key && styles.activeTabLabel]}>
              {category.label}
            </Text>
          </Pressable>)}
      </ScrollView>

      {}
      {renderContent()}
    </View>;}const styles = createSheet({container:{flex:1,backgroundColor:launchColors.hex_f9fafb},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,backgroundColor:launchColors.hex_ffffff,borderBottomWidth:1,borderBottomColor:launchColors.hex_e5e7eb},backButton:{padding:8},backButtonText:{fontSize:16,color:launchColors.hex_6366f1},headerTitle:{fontSize:18,fontWeight:'600',color:launchColors.hex_111827},headerSpacer:{width:60},tabsContainer:{backgroundColor:launchColors.hex_ffffff,borderBottomWidth:1,borderBottomColor:launchColors.hex_e5e7eb,maxHeight:80},tabsContent:{paddingHorizontal:12,paddingVertical:12,gap:8},tab:{alignItems:'center',paddingHorizontal:16,paddingVertical:8,borderRadius:20,backgroundColor:launchColors.hex_f3f4f6,marginHorizontal:4},activeTab:{backgroundColor:launchColors.hex_6366f1},tabIcon:{fontSize:20,marginBottom:4},tabLabel:{fontSize:12,color:launchColors.hex_6b7280},activeTabLabel:{color:launchColors.hex_ffffff,fontWeight:'500'},contentScroll:{flex:1},centerContainer:{flex:1,justifyContent:'center',alignItems:'center',padding:32},loadingText:{marginTop:16,fontSize:16,color:launchColors.hex_6b7280},errorIcon:{fontSize:48,marginBottom:16},errorTitle:{fontSize:18,fontWeight:'600',color:launchColors.hex_ef4444,marginBottom:8},errorMessage:{fontSize:14,color:launchColors.hex_6b7280,textAlign:'center',marginBottom:16},retryButton:{backgroundColor:launchColors.hex_3b82f6,paddingHorizontal:24,paddingVertical:12,borderRadius:8},retryButtonText:{color:launchColors.hex_ffffff,fontWeight:'600',fontSize:14},categoryHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:launchColors.hex_ffffff},categoryTitle:{fontSize:20,fontWeight:'600',color:launchColors.hex_111827},settingsGroup:{backgroundColor:launchColors.hex_ffffff,marginTop:8,paddingHorizontal:16},settingItem:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:16,borderBottomWidth:1,borderBottomColor:launchColors.hex_f3f4f6},settingLabel:{fontSize:16,color:launchColors.hex_374151},settingValueContainer:{flexDirection:'row',alignItems:'center'},settingValue:{fontSize:14,color:launchColors.hex_6b7280,marginRight:8},settingArrow:{fontSize:18,color:launchColors.hex_9ca3af},toggle:{width:50,height:28,borderRadius:14,backgroundColor:launchColors.hex_e5e7eb,padding:2},toggleActive:{backgroundColor:launchColors.hex_6366f1},toggleKnob:{width:24,height:24,borderRadius:12,backgroundColor:launchColors.hex_ffffff,shadowColor:launchColors.hex_000,shadowOffset:{width:0,height:1},shadowOpacity:0.2,shadowRadius:1},toggleKnobActive:{transform:[{translateX:22}]},sliderContainer:{flexDirection:'row',alignItems:'center',gap:12},sliderButton:{width:32,height:32,borderRadius:16,backgroundColor:launchColors.hex_f3f4f6,justifyContent:'center',alignItems:'center'},sliderButtonText:{fontSize:18,color:launchColors.hex_374151,fontWeight:'600'},sliderValue:{fontSize:16,color:launchColors.hex_374151,minWidth:40,textAlign:'center'},actionRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:16,borderBottomWidth:1,borderBottomColor:launchColors.hex_f3f4f6},actionRowText:{fontSize:16,color:launchColors.hex_6366f1},actionRowSubtext:{fontSize:12,color:launchColors.hex_9ca3af,marginTop:2},actionRowArrow:{fontSize:18,color:launchColors.hex_6366f1},actionsContainer:{padding:16,gap:12,marginTop:16},actionButton:{backgroundColor:launchColors.hex_6366f1,paddingVertical:14,borderRadius:8,alignItems:'center'},actionButtonText:{color:launchColors.hex_ffffff,fontSize:16,fontWeight:'600'},dangerButton:{backgroundColor:launchColors.hex_fee2e2},dangerButtonText:{color:launchColors.hex_ef4444},dangerZone:{marginTop:24,padding:16,backgroundColor:launchColors.hex_fef2f2,borderRadius:12,borderWidth:1,borderColor:launchColors.hex_fecaca},dangerTitle:{fontSize:14,fontWeight:'600',color:launchColors.hex_ef4444,marginBottom:12},dangerAction:{backgroundColor:launchColors.hex_ef4444,paddingVertical:12,paddingHorizontal:16,borderRadius:8,alignItems:'center'},dangerActionText:{color:launchColors.hex_ffffff,fontSize:14,fontWeight:'600'}});
