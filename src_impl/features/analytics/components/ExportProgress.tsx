import React from'react';import{View,Text,Pressable,ActivityIndicator}from'react-native';import{ExportJobSchema}from'../schemas';import type{z}from'zod';import{createSheet}from'@/shared/ui/create-sheet';type ExportJob=z.infer<typeof ExportJobSchema>;interface ExportProgressProps{job:ExportJob;onDownload?:()=>void;onCancel?:()=>void;onRetry?:()=>void;}const STATUS_CONFIG:Record<string,{color:string;label:string;icon:string;}>={pending:{color:'#6b7280',label:'Queued',icon:'⏳'},processing:{color:'#3b82f6',label:'Processing',icon:'⚙️'},completed:{color:'#10b981',label:'Ready',icon:'✅'},failed:{color:'#ef4444',label:'Failed',icon:'❌'},cancelled:{color:'#9ca3af',label:'Cancelled',icon:'🚫'}};export function ExportProgress({job,onDownload,onCancel,onRetry}:ExportProgressProps){const status=STATUS_CONFIG[job.status];const isActive=job.status==='pending'||job.status==='processing';const isComplete=job.status==='completed';const isFailed=job.status==='failed';return<View style={[styles.container,{borderColor:status.color}]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{status.icon}</Text>
        <View style={styles.info}>
          <Text style={styles.title}>Export {status.label}</Text>
          <Text style={styles.subtitle}>
            {job.format.toUpperCase()} • {formatDate(job.createdAt)}
          </Text>
        </View>
        <View style={[styles.statusBadge,{backgroundColor:status.color+'20'}]}>
          <Text style={[styles.statusText,{color:status.color}]}>{status.label}</Text>
        </View>
      </View>

      {(isActive||isComplete)&&<View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar,{width:`${job.progress}%`,backgroundColor:isComplete?'#10b981':'#3b82f6'}]}/>
          </View>
          <Text style={styles.progressText}>{Math.round(job.progress)}%</Text>
        </View>}

      {isComplete&&job.fileUrl&&<View style={styles.fileInfo}>
          <Text style={styles.fileSize}>{job.fileSize?formatFileSize(job.fileSize):'Unknown size'}</Text>
          <Text style={styles.fileUrl}numberOfLines={1}>
            {job.fileUrl}
          </Text>
        </View>}

      {isFailed&&job.errorMessage&&<View style={styles.errorSection}>
          <Text style={styles.errorText}>{job.errorMessage}</Text>
        </View>}

      <View style={styles.actions}>
        {isActive&&onCancel&&<Pressable style={({pressed})=>[styles.button,styles.cancelButton,pressed&&{opacity:0.8}]}onPress={onCancel}accessibilityRole="button"accessibilityLabel="Cancel button"accessibilityHint="Activates this control">
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>}

        {isActive&&<View style={styles.loadingIndicator}>
            <ActivityIndicator size="small"color="#3b82f6"/>
            <Text style={styles.loadingText}>Working...</Text>
          </View>}

        {isComplete&&onDownload&&<Pressable style={({pressed})=>[styles.button,styles.downloadButton,pressed&&{opacity:0.8}]}onPress={onDownload}accessibilityRole="button"accessibilityLabel="Download button"accessibilityHint="Activates this control">
            <Text style={styles.downloadButtonText}>Download</Text>
          </Pressable>}

        {isFailed&&onRetry&&<Pressable style={({pressed})=>[styles.button,styles.retryButton,pressed&&{opacity:0.8}]}onPress={onRetry}accessibilityRole="button"accessibilityLabel="Retry button"accessibilityHint="Activates this control">
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>}
      </View>
    </View>;}function formatDate(timestamp:number):string{return new Date(timestamp).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}function formatFileSize(bytes:number):string{if(bytes===0){return'0 B';}const k=1024;const sizes=['B','KB','MB','GB'];const i=Math.floor(Math.log(bytes)/Math.log(k));return parseFloat((bytes/Math.pow(k,i)).toFixed(1))+' '+sizes[i];}const styles=createSheet({container:{backgroundColor:'#ffffff',borderRadius:12,padding:16,marginVertical:8,marginHorizontal:12,borderLeftWidth:4,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.1,shadowRadius:2,elevation:2},header:{flexDirection:'row',alignItems:'flex-start'},icon:{fontSize:24,marginRight:12},info:{flex:1},title:{fontSize:16,fontWeight:'600',color:'#111827'},subtitle:{fontSize:13,color:'#6b7280',marginTop:2},statusBadge:{paddingHorizontal:8,paddingVertical:4,borderRadius:12},statusText:{fontSize:12,fontWeight:'600'},progressSection:{flexDirection:'row',alignItems:'center',marginTop:12,gap:12},progressBarContainer:{flex:1,height:6,backgroundColor:'#e5e7eb',borderRadius:3,overflow:'hidden'},progressBar:{height:'100%',borderRadius:3},progressText:{fontSize:14,fontWeight:'600',color:'#374151',minWidth:40},fileInfo:{marginTop:12,padding:12,backgroundColor:'#f9fafb',borderRadius:8},fileSize:{fontSize:14,fontWeight:'500',color:'#374151'},fileUrl:{fontSize:12,color:'#6b7280',marginTop:4},errorSection:{marginTop:12,padding:12,backgroundColor:'#fee2e2',borderRadius:8},errorText:{fontSize:13,color:'#ef4444'},actions:{flexDirection:'row',justifyContent:'flex-end',marginTop:16,gap:12},button:{paddingHorizontal:16,paddingVertical:8,borderRadius:8,minWidth:100,alignItems:'center'},cancelButton:{backgroundColor:'#f3f4f6'},cancelButtonText:{color:'#6b7280',fontWeight:'500'},loadingIndicator:{flexDirection:'row',alignItems:'center',gap:8},loadingText:{fontSize:14,color:'#3b82f6',fontWeight:'500'},downloadButton:{backgroundColor:'#10b981'},downloadButtonText:{color:'#ffffff',fontWeight:'600'},retryButton:{backgroundColor:'#3b82f6'},retryButtonText:{color:'#ffffff',fontWeight:'600'}});
