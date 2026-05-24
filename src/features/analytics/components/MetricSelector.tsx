import React,{useState}from'react'; import{View,Text,Modal,ScrollView,Pressable}from'react-native'; import{AnalyticsMetricSchema}from'../schemas'; import type{z}from'zod'; import{createSheet}from'@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
 type AnalyticsMetric=z.infer<typeof AnalyticsMetricSchema>;interface MetricSelectorProps{selected:AnalyticsMetric[];onChange:(metrics:AnalyticsMetric[])=>void;maxSelection?:number;disabled?:boolean;}const AVAILABLE_METRICS:{value:AnalyticsMetric;label:string;category:string;}[] = [{value:'sessions_completed',label:'Sessions Completed',category:'Sessions'},{value:'sessions_abandoned',label:'Sessions Abandoned',category:'Sessions'},{value:'total_focus_time',label:'Total Focus Time',category:'Sessions'},{value:'average_session_duration',label:'Avg Session Duration',category:'Sessions'},{value:'streak_days',label:'Streak Days',category:'Progress'},{value:'longest_streak',label:'Longest Streak',category:'Progress'},{value:'xp_earned',label:'XP Earned',category:'Progress'},{value:'level_progression',label:'Level Progression',category:'Progress'},{value:'boss_damage_dealt',label:'Boss Damage',category:'Combat'},{value:'items_crafted',label:'Items Crafted',category:'Economy'},{value:'coins_spent',label:'Coins Spent',category:'Economy'},{value:'challenges_completed',label:'Challenges Completed',category:'Social'}]; export function MetricSelector({selected,onChange,maxSelection = 5,disabled}:MetricSelectorProps){const[modalVisible,setModalVisible] = useState(false); const groupedMetrics = AVAILABLE_METRICS.reduce((acc,metric)=>{if(!acc[metric.category]){acc[metric.category] = [];}acc[metric.category]!.push(metric); return acc;},{}as Record<string,typeof AVAILABLE_METRICS>); const toggleMetric = (metric:AnalyticsMetric)=>{if(selected.includes(metric)){onChange(selected.filter(m=>m !== metric));}else if(selected.length < maxSelection){onChange([...selected,metric]);}}; const isSelected = (metric:AnalyticsMetric)=>selected.includes(metric); const canSelectMore = selected.length < maxSelection; return<View style={styles.container}>
      <Text style={styles.label}>
        Metrics ({selected.length}/{maxSelection})
      </Text>

      <Pressable style={({pressed})=>[styles.selector,disabled && styles.selectorDisabled,pressed && {opacity:0.8}]}onPress={()=>!disabled && setModalVisible(true)}disabled={disabled}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
        <View style={styles.selectedContainer}>
          {selected.length === 0 ? <Text style={styles.placeholder}>Select metrics...</Text> : <Text style={styles.selectedChipText}>
              {selected.length} selected: {selected.map(metric=>AVAILABLE_METRICS.find(m=>m.value === metric)?.label || metric).join(', ')}
            </Text>}
        </View>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      <Modal visible={modalVisible}transparent animationType="slide"onRequestClose={()=>setModalVisible(false)}>
        <Pressable style={styles.overlay}onPress={()=>setModalVisible(false)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Metrics</Text>
              <Pressable onPress={()=>setModalVisible(false)}style={({pressed})=>[pressed && {opacity:0.8}]}accessibilityLabel="Done button"accessibilityRole="button"accessibilityHint="Activates this control">
                <Text style={styles.closeButton}>Done</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {Object.entries(groupedMetrics).map(([category,metrics])=><View key={category}style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  {metrics.map(metric=>{const selected_metric = isSelected(metric.value); const disabled_metric = !selected_metric && !canSelectMore; return<Pressable key={metric.value}style={({pressed})=>[styles.metricOption,selected_metric && styles.metricOptionSelected,disabled_metric && styles.metricOptionDisabled,pressed && {opacity:0.8}]}onPress={()=>toggleMetric(metric.value)}disabled={disabled_metric}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                        <View style={[styles.checkbox,selected_metric && styles.checkboxSelected]}>{selected_metric && <Text style={styles.checkmark}>✓</Text>}</View>
                        <Text style={[styles.metricLabel,selected_metric && styles.metricLabelSelected,disabled_metric && styles.metricLabelDisabled]}>{metric.label}</Text>
                      </Pressable>;})}
                </View>)}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>;}const styles = createSheet({container:{marginVertical:8},label:{fontSize:12,fontWeight:'500',color:launchColors.hex_6b7280,marginBottom:8,marginLeft:4},selector:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:12,borderRadius:8,backgroundColor:launchColors.hex_f9fafb,borderWidth:1,borderColor:launchColors.hex_e5e7eb},selectorDisabled:{opacity:0.5},selectedContainer:{flexDirection:'row',flexWrap:'wrap',flex:1,gap:6},selectedChip:{backgroundColor:launchColors.hex_e0e7ff,paddingHorizontal:8,paddingVertical:4,borderRadius:12},selectedChipText:{fontSize:12,color:launchColors.hex_4338ca,fontWeight:'500'},placeholder:{color:launchColors.hex_9ca3af,fontSize:14},chevron:{fontSize:12,color:launchColors.hex_6b7280,marginLeft:8},overlay:{flex:1,backgroundColor:launchColors.rgb_0_0_0_0_5,justifyContent:'flex-end'},modalContent:{backgroundColor:launchColors.hex_ffffff,borderTopLeftRadius:20,borderTopRightRadius:20,maxHeight:'80%'},modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:launchColors.hex_e5e7eb},modalTitle:{fontSize:18,fontWeight:'600',color:launchColors.hex_111827},closeButton:{fontSize:16,color:launchColors.hex_6366f1,fontWeight:'500'},modalScroll:{padding:16},categorySection:{marginBottom:20},categoryTitle:{fontSize:14,fontWeight:'600',color:launchColors.hex_374151,marginBottom:8,textTransform:'uppercase',letterSpacing:0.5},metricOption:{flexDirection:'row',alignItems:'center',paddingVertical:10,paddingHorizontal:8,borderRadius:6},metricOptionSelected:{backgroundColor:launchColors.hex_f3f4f6},metricOptionDisabled:{opacity:0.4},checkbox:{width:20,height:20,borderRadius:4,borderWidth:2,borderColor:launchColors.hex_d1d5db,marginRight:12,alignItems:'center',justifyContent:'center'},checkboxSelected:{backgroundColor:launchColors.hex_6366f1,borderColor:launchColors.hex_6366f1},checkmark:{color:launchColors.hex_ffffff,fontSize:12,fontWeight:'700'},metricLabel:{fontSize:14,color:launchColors.hex_374151},metricLabelSelected:{color:launchColors.hex_111827,fontWeight:'500'},metricLabelDisabled:{color:launchColors.hex_9ca3af}});
