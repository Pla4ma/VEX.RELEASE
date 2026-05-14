import React from'react';import{View,Text,Pressable}from'react-native';import{InsightSchema}from'../schemas';import type{z}from'zod';import{createSheet}from'@/shared/ui/create-sheet';type Insight=z.infer<typeof InsightSchema>;interface InsightCardProps{insight:Insight;onPress?:()=>void;onAction?:()=>void;onDismiss?:()=>void;}const SEVERITY_CONFIG:Record<string,{color:string;bgColor:string;icon:string;}>={info:{color:'#3b82f6',bgColor:'#dbeafe',icon:'ℹ️'},positive:{color:'#10b981',bgColor:'#d1fae5',icon:'✅'},warning:{color:'#f59e0b',bgColor:'#fef3c7',icon:'⚠️'},critical:{color:'#ef4444',bgColor:'#fee2e2',icon:'🚨'},celebration:{color:'#8b5cf6',bgColor:'#ede9fe',icon:'🎉'}};export function InsightCard({insight,onPress,onAction,onDismiss}:InsightCardProps){const severity=SEVERITY_CONFIG[insight.severity];return<Pressable style={({pressed})=>[styles.container,{backgroundColor:severity.bgColor,borderColor:severity.color},insight.isRead&&styles.readContainer,pressed&&{opacity:0.8}]}onPress={onPress}accessibilityRole="button"accessibilityLabel={`Insight: ${insight.title}`}accessibilityHint="Activates this control">
      <View style={styles.header}>
        <Text style={styles.icon}>{severity.icon}</Text>
        <Text style={[styles.title,{color:severity.color}]}>{insight.title}</Text>
        {insight.isActioned&&<View style={[styles.badge,{backgroundColor:severity.color}]}>
            <Text style={styles.badgeText}>Done</Text>
          </View>}
        {!insight.isRead&&!insight.isActioned&&<View style={[styles.unreadDot,{backgroundColor:severity.color}]}/>}
      </View>

      <Text style={styles.description}>{insight.description}</Text>

      {insight.metric&&<View style={styles.tagContainer}>
          <View style={[styles.tag,{backgroundColor:severity.color+'30'}]}>
            <Text style={[styles.tagText,{color:severity.color}]}>{formatMetricName(insight.metric)}</Text>
          </View>
          <Text style={styles.date}>{formatDate(insight.detectedAt)}</Text>
        </View>}

      {insight.actionType&&!insight.isActioned&&<View style={styles.actions}>
          <Pressable style={({pressed})=>[styles.actionButton,{backgroundColor:severity.color},pressed&&{opacity:0.8}]}onPress={onAction}accessibilityRole="button"accessibilityLabel="Action button"accessibilityHint="Activates this control">
            <Text style={styles.actionButtonText}>{formatActionLabel(insight.actionType)}</Text>
          </Pressable>

          {onDismiss&&<Pressable style={({pressed})=>[styles.dismissButton,pressed&&{opacity:0.8}]}onPress={onDismiss}accessibilityRole="button"accessibilityLabel="Dismiss button"accessibilityHint="Activates this control">
              <Text style={[styles.dismissText,{color:severity.color}]}>Dismiss</Text>
            </Pressable>}
        </View>}
    </Pressable>;}function formatMetricName(metric:string):string{return metric.split('_').map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(' ');}function formatDate(timestamp:number):string{const date=new Date(timestamp);const now=new Date();const diff=now.getTime()-date.getTime();const hours=Math.floor(diff/(1000*60*60));const days=Math.floor(hours/24);if(hours<1){return'Just now';}if(hours<24){return`${hours}h ago`;}if(days<7){return`${days}d ago`;}return date.toLocaleDateString();}function formatActionLabel(actionType:string):string{const labels:Record<string,string>={start_session:'Start Session',view_progress:'View Progress',check_challenges:'Check Challenges',invite_friends:'Invite Friends',upgrade_plan:'Upgrade Plan',customize_settings:'Settings'};return labels[actionType]||actionType;}const styles=createSheet({container:{borderRadius:12,padding:16,marginVertical:6,marginHorizontal:12,borderLeftWidth:4},readContainer:{opacity:0.8},header:{flexDirection:'row',alignItems:'center',marginBottom:8},icon:{fontSize:20,marginRight:8},title:{fontSize:16,fontWeight:'600',flex:1},badge:{paddingHorizontal:8,paddingVertical:2,borderRadius:12,marginLeft:8},badgeText:{color:'#ffffff',fontSize:10,fontWeight:'600'},unreadDot:{width:8,height:8,borderRadius:4,marginLeft:8},description:{fontSize:14,color:'#374151',lineHeight:20,marginBottom:12},tagContainer:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},tag:{paddingHorizontal:8,paddingVertical:4,borderRadius:8},tagText:{fontSize:12,fontWeight:'500'},date:{fontSize:12,color:'#9ca3af'},actions:{flexDirection:'row',marginTop:12,gap:12},actionButton:{paddingHorizontal:16,paddingVertical:8,borderRadius:20,flex:1,alignItems:'center'},actionButtonText:{color:'#ffffff',fontWeight:'600',fontSize:14},dismissButton:{paddingHorizontal:16,paddingVertical:8,alignItems:'center'},dismissText:{fontWeight:'500',fontSize:14}});
