import React,{useState,useCallback}from'react'; import{View,Text,ScrollView,Pressable,Switch,Alert,Modal}from'react-native'; import{useExportAnalytics,useExportJobs}from'../hooks'; import{ExportProgress}from'./ExportProgress'; import{ErrorBoundary}from'../../../errors/ErrorBoundary'; import{SkeletonList}from'../../../shared/ui/primitives/Skeleton'; import{createSheet}from'@/shared/ui/create-sheet'; interface DataExportScreenProps{userId:string;onClose?:()=>void}type ExportFormat='json'|'csv';type DataCategory='sessions'|'analytics'|'achievements'|'settings'|'all';const CATEGORIES:Array<{key:DataCategory;label:string;icon:string;description:string}> = [{key:'all',label:'Everything',icon:'\uD83D\uDCE6',description:'All your data in one export'},{key:'sessions',label:'Sessions',icon:'\uD83D\uDCC5',description:'Session history and stats'},{key:'analytics',label:'Analytics',icon:'\uD83D\uDCCA',description:'Charts, trends, and insights'},{key:'achievements',label:'Achievements',icon:'\uD83C\uDFC6',description:'Badges and milestones'},{key:'settings',label:'Settings',icon:'\u2699\uFE0F',description:'Preferences and configuration'}]; const FORMATS:Array<{key:ExportFormat;label:string;icon:string;description:string}> = [{key:'json',label:'JSON',icon:'\uD83D\uDCC4',description:'Machine-readable, great for backups'},{key:'csv',label:'CSV',icon:'\uD83D\uDCD1',description:'Spreadsheet format, easy to analyze'}]; export function DataExportScreen({userId,onClose}:DataExportScreenProps){const[selectedCategory,setSelectedCategory] = useState<DataCategory>('all'); const[selectedFormat,setSelectedFormat] = useState<ExportFormat>('json'); const[includeMetadata,setIncludeMetadata] = useState(true); const[showConfirmModal,setShowConfirmModal] = useState(false); const{data:exportJobs,isLoading:jobsLoading} = useExportJobs(userId); const exportMutation = useExportAnalytics(userId); const handleExport = useCallback(()=>{setShowConfirmModal(true);},[]); const confirmExport = useCallback(async()=>{setShowConfirmModal(false); try{await exportMutation.mutateAsync({format:selectedFormat,dataTypes:[selectedCategory],dateRange:{start:Date.now() - 30 * 24 * 60 * 60 * 1000,end:Date.now()}}); Alert.alert('Export Started',"Your data export has been queued. You'll be notified when it's ready.",[{text:'OK'}]);}catch(error){Alert.alert('Export Failed','Unable to start export. Please try again.',[{text:'OK'}]);}},[exportMutation,selectedFormat,selectedCategory]); const handleDownload = useCallback((jobId:string)=>{Alert.alert('Download',`Downloading export ${jobId}...`);},[]); return<View style={styles.container}>
      {}
      <View style={styles.header}>
        <Pressable onPress={onClose}style={({pressed})=>[styles.closeButton,pressed && {opacity:0.8}]}
  accessibilityLabel="Close button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Data Export</Text>
        <View style={styles.headerSpacer}/>
      </View>

      <ScrollView style={styles.content}showsVerticalScrollIndicator={false}>
        <ErrorBoundary>
          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Your Data</Text>
            <Text style={styles.description}>
              Download a copy of your data. Exports are prepared securely and
              available for 7 days.
            </Text>
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What to Export</Text>
            <View style={styles.optionsGrid}>
              {CATEGORIES.map(category=><Pressable key={category.key}style={({pressed})=>[styles.optionCard,selectedCategory === category.key && styles.optionCardSelected,pressed && {opacity:0.8}]}onPress={()=>setSelectedCategory(category.key)}
  accessibilityLabel={`${category.label} category button`}
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                  <Text style={styles.optionIcon}>{category.icon}</Text>
                  <Text style={[styles.optionLabel,selectedCategory === category.key && styles.optionLabelSelected]}>
                    {category.label}
                  </Text>
                  <Text style={styles.optionDescription}>{category.description}</Text>
                  {selectedCategory === category.key && <View style={styles.checkmark}>
                      <Text style={styles.checkmarkIcon}>✓</Text>
                    </View>}
                </Pressable>)}
            </View>
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Format</Text>
            <View style={styles.formatRow}>
              {FORMATS.map(format=><Pressable key={format.key}style={({pressed})=>[styles.formatCard,selectedFormat === format.key && styles.formatCardSelected,pressed && {opacity:0.8}]}onPress={()=>setSelectedFormat(format.key)}
  accessibilityLabel={`${format.label} format button`}
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                  <Text style={styles.formatIcon}>{format.icon}</Text>
                  <Text style={[styles.formatLabel,selectedFormat === format.key && styles.formatLabelSelected]}>
                    {format.label}
                  </Text>
                  <Text style={styles.formatDescription}>{format.description}</Text>
                </Pressable>)}
            </View>
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options</Text>
            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Include Metadata</Text>
                <Text style={styles.optionSubtitle}>Timestamps, device info, app version</Text>
              </View>
              <Switch value={includeMetadata}onValueChange={setIncludeMetadata}trackColor={{false:'theme.colors.primary[500]',true:'theme.colors.primary[500]'}}/>
            </View>
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Category</Text>
                <Text style={styles.previewValue}>
                  {CATEGORIES.find(c=>c.key === selectedCategory)?.label}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Format</Text>
                <Text style={styles.previewValue}>{selectedFormat.toUpperCase()}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Metadata</Text>
                <Text style={styles.previewValue}>{includeMetadata ? 'Included' : 'Excluded'}</Text>
              </View>
            </View>
          </View>

          {}
          <Pressable style={({pressed})=>[styles.exportButton,pressed && {opacity:0.8}]}onPress={handleExport}disabled={exportMutation.isPending}
  accessibilityLabel="Start Export button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            <Text style={styles.exportButtonText}>
              {exportMutation.isPending ? 'Preparing...' : 'Start Export'}
            </Text>
          </Pressable>

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Previous Exports</Text>
            {jobsLoading ? <SkeletonList count={2}/> : exportJobs && exportJobs.length > 0 ? exportJobs.map(job=><ExportProgress key={job.id}job={job}onDownload={()=>handleDownload(job.id)}onRetry={()=>exportMutation.mutateAsync({format:selectedFormat,dataTypes:['analytics'],dateRange:{start:Date.now() - 30 * 24 * 60 * 60 * 1000,end:Date.now()}})}/>) : <View style={styles.emptyExports}>
                <Text style={styles.emptyExportsText}>No exports yet</Text>
              </View>}
          </View>

          {}
          <View style={styles.dangerSection}>
            <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>
            <Text style={styles.dangerDescription}>
              These actions cannot be undone. Please be certain.
            </Text>

            <Pressable style={({pressed})=>[styles.dangerButton,pressed && {opacity:0.8}]}onPress={()=>{Alert.alert('Delete All Data?','This will permanently delete all your data including sessions, achievements, and progress. This action cannot be undone.',[{text:'Cancel',style:'cancel'},{text:'Delete My Data',style:'destructive',onPress:()=>{Alert.alert('Final Confirmation','Are you absolutely sure? Type "DELETE" to confirm.',[{text:'Cancel',style:'cancel'},{text:'Delete Forever',style:'destructive'}]);}}]);}}
  accessibilityLabel="Delete All My Data button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              <Text style={styles.dangerButtonText}>Delete All My Data</Text>
            </Pressable>
          </View>
        </ErrorBoundary>
      </ScrollView>

      {}
      <Modal visible={showConfirmModal}transparent animationType="fade"onRequestClose={()=>setShowConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Export</Text>
            <Text style={styles.modalDescription}>
              We'll prepare your {CATEGORIES.find(c=>c.key === selectedCategory)?.label} data
              as a {selectedFormat.toUpperCase()} file. This may take a few minutes.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable style={({pressed})=>[styles.modalButtonSecondary,pressed && {opacity:0.8}]}onPress={()=>setShowConfirmModal(false)}
  accessibilityLabel="Cancel button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable style={({pressed})=>[styles.modalButtonPrimary,pressed && {opacity:0.8}]}onPress={confirmExport}
  accessibilityLabel="Confirm Export button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                <Text style={styles.modalButtonPrimaryText}>Start Export</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>;}const styles = createSheet({container:{flex:1,backgroundColor:'theme.colors.primary[500]'},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,backgroundColor:'theme.colors.background.primary',borderBottomWidth:1,borderBottomColor:'theme.colors.primary[500]'},closeButton:{padding:8},closeIcon:{fontSize:20,color:'theme.colors.primary[500]'},headerTitle:{fontSize:18,fontWeight:'600',color:'theme.colors.primary[500]'},headerSpacer:{width:40},content:{flex:1,padding:16},section:{marginBottom:24},sectionTitle:{fontSize:16,fontWeight:'600',color:'theme.colors.primary[500]',marginBottom:12},description:{fontSize:14,color:'theme.colors.primary[500]',lineHeight:20},optionsGrid:{flexDirection:'row',flexWrap:'wrap',gap:8},optionCard:{width:'48%',backgroundColor:'theme.colors.background.primary',borderRadius:12,padding:16,borderWidth:2,borderColor:'transparent',position:'relative'},optionCardSelected:{borderColor:'theme.colors.primary[500]',backgroundColor:'theme.colors.primary[500]'},optionIcon:{fontSize:24,marginBottom:8},optionLabel:{fontSize:14,fontWeight:'600',color:'theme.colors.primary[500]',marginBottom:4},optionLabelSelected:{color:'theme.colors.primary[500]'},optionDescription:{fontSize:12,color:'theme.colors.primary[500]'},checkmark:{position:'absolute',top:8,right:8,width:20,height:20,borderRadius:10,backgroundColor:'theme.colors.primary[500]',justifyContent:'center',alignItems:'center'},checkmarkIcon:{color:'theme.colors.background.primary',fontSize:12,fontWeight:'700'},formatRow:{flexDirection:'row',gap:12},formatCard:{flex:1,backgroundColor:'theme.colors.background.primary',borderRadius:12,padding:16,borderWidth:2,borderColor:'transparent'},formatCardSelected:{borderColor:'theme.colors.primary[500]',backgroundColor:'theme.colors.primary[500]'},formatIcon:{fontSize:24,marginBottom:8},formatLabel:{fontSize:14,fontWeight:'600',color:'theme.colors.primary[500]',marginBottom:4},formatLabelSelected:{color:'theme.colors.primary[500]'},formatDescription:{fontSize:12,color:'theme.colors.primary[500]'},optionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'theme.colors.background.primary',padding:16,borderRadius:12},optionInfo:{flex:1},optionTitle:{fontSize:14,fontWeight:'500',color:'theme.colors.primary[500]',marginBottom:2},optionSubtitle:{fontSize:12,color:'theme.colors.primary[500]'},previewCard:{backgroundColor:'theme.colors.background.primary',borderRadius:12,padding:16},previewRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:8,borderBottomWidth:1,borderBottomColor:'theme.colors.primary[500]'},previewLabel:{fontSize:14,color:'theme.colors.primary[500]'},previewValue:{fontSize:14,fontWeight:'500',color:'theme.colors.primary[500]'},exportButton:{backgroundColor:'theme.colors.primary[500]',paddingVertical:16,borderRadius:12,alignItems:'center',marginBottom:24},exportButtonText:{color:'theme.colors.background.primary',fontSize:16,fontWeight:'600'},emptyExports:{backgroundColor:'theme.colors.background.primary',borderRadius:12,padding:24,alignItems:'center'},emptyExportsText:{fontSize:14,color:'theme.colors.primary[500]'},dangerSection:{backgroundColor:'theme.colors.primary[500]',borderRadius:12,padding:16,marginTop:8,marginBottom:32},dangerTitle:{fontSize:16,fontWeight:'600',color:'theme.colors.primary[500]',marginBottom:8},dangerDescription:{fontSize:14,color:'theme.colors.primary[500]',marginBottom:16},dangerButton:{backgroundColor:'theme.colors.primary[500]',paddingVertical:12,borderRadius:8,alignItems:'center'},dangerButtonText:{color:'theme.colors.background.primary',fontSize:14,fontWeight:'600'},modalOverlay:{flex:1,backgroundColor:'rgba(0, 0, 0, 0.5)',justifyContent:'center',alignItems:'center',padding:24},modalContent:{backgroundColor:'theme.colors.background.primary',borderRadius:16,padding:24,width:'100%',maxWidth:400},modalTitle:{fontSize:18,fontWeight:'700',color:'theme.colors.primary[500]',marginBottom:12,textAlign:'center'},modalDescription:{fontSize:14,color:'theme.colors.primary[500]',textAlign:'center',marginBottom:24,lineHeight:20},modalButtons:{flexDirection:'row',gap:12},modalButtonSecondary:{flex:1,paddingVertical:12,borderRadius:8,backgroundColor:'theme.colors.primary[500]',alignItems:'center'},modalButtonSecondaryText:{color:'theme.colors.primary[500]',fontSize:14,fontWeight:'600'},modalButtonPrimary:{flex:1,paddingVertical:12,borderRadius:8,backgroundColor:'theme.colors.primary[500]',alignItems:'center'},modalButtonPrimaryText:{color:'theme.colors.background.primary',fontSize:14,fontWeight:'600'}});

