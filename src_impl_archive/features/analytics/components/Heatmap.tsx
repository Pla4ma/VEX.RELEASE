import React from'react'; import{View,Text,Pressable,ScrollView}from'react-native'; import{createSheet}from'@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
 interface HeatmapData{day:string;hour:number;value:number;}interface HeatmapProps{data:HeatmapData[];title?:string;subtitle?:string;onCellPress?:(day:string,hour:number,value:number)=>void;colorScheme?:'blue'|'green'|'purple';}const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; const HOURS = Array.from({length:24},(_,i)=>i); const COLOR_SCHEMES = {blue:[launchColors.hex_eff6ff,launchColors.hex_dbeafe,launchColors.hex_93c5fd,launchColors.hex_3b82f6,launchColors.hex_1e40af],green:[launchColors.hex_f0fdf4,launchColors.hex_dcfce7,launchColors.hex_86efac,launchColors.hex_22c55e,launchColors.hex_166534],purple:[launchColors.hex_faf5ff,launchColors.hex_f3e8ff,launchColors.hex_d8b4fe,launchColors.hex_a855f7,launchColors.hex_6b21a8]}; export function Heatmap({data,title,subtitle,onCellPress,colorScheme = 'blue'}:HeatmapProps){const colors = COLOR_SCHEMES[colorScheme]; const getCellValue = (day:string,hour:number):number=>{const cell = data.find(d=>d.day === day && d.hour === hour); return cell?.value ?? 0;}; const getCellColor = (value:number):string=>{return colors[Math.min(value,4)] ?? colors[0]!;}; const formatHour = (hour:number):string=>{if(hour === 0){return'12am';}if(hour === 12){return'12pm';}if(hour < 12){return`${hour}am`;}return`${hour - 12}pm`;}; const visibleHours = HOURS.filter(h=>h % 3 === 0); return<View style={styles.container}>
      {(title || subtitle) && <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.heatmap}>
          {}
          <View style={styles.row}>
            <View style={styles.dayLabel}/>
            {visibleHours.map(hour=><Text key={`header-${hour}`}style={styles.hourLabel}>
                {formatHour(hour)}
              </Text>)}
          </View>

          {}
          {DAYS.map(day=><View key={day}style={styles.row}>
              <Text style={styles.dayLabel}>{day}</Text>
              {HOURS.map(hour=>{const value = getCellValue(day,hour); const isVisible = visibleHours.includes(hour); return<Pressable key={`${day}-${hour}`}style={({pressed})=>[styles.cell,{backgroundColor:getCellColor(value)},!isVisible && styles.hiddenCell,value > 0 && styles.activeCell,pressed && {opacity:0.7}]}onPress={()=>onCellPress?.(day,hour,value)}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                    {value > 0 && <View style={[styles.intensityIndicator,{opacity:value * 0.25}]}/>}
                  </Pressable>;})}
            </View>)}
        </View>
      </ScrollView>

      {}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {colors.map((color,index)=><View key={index}style={[styles.legendCell,{backgroundColor:color}]}/>)}
        <Text style={styles.legendText}>More</Text>
      </View>

      {}
      <View style={styles.stats}>
        <Stat label="Peak Day"value={calculatePeakDay(data)}/>
        <Stat label="Peak Hour"value={calculatePeakHour(data)}/>
        <Stat label="Total"value={calculateTotal(data).toString()}/>
      </View>
    </View>;}function Stat({label,value}:{label:string;value:string;}){return<View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>;}function calculatePeakDay(data:HeatmapData[]):string{const dayTotals = DAYS.map(day=>({day,total:data.filter(d=>d.day === day).reduce((sum,d)=>sum + d.value,0)})); const peak = dayTotals.sort((a,b)=>b.total - a.total)[0]; return peak?.day ?? '-';}function calculatePeakHour(data:HeatmapData[]):string{const hourTotals = HOURS.map(hour=>({hour,total:data.filter(d=>d.hour === hour).reduce((sum,d)=>sum + d.value,0)})); const peak = hourTotals.sort((a,b)=>b.total - a.total)[0]; if(!peak){return'-';}if(peak.hour === 0){return'12am';}if(peak.hour === 12){return'12pm';}if(peak.hour < 12){return`${peak.hour}am`;}return`${peak.hour - 12}pm`;}function calculateTotal(data:HeatmapData[]):number{return data.reduce((sum,d)=>sum + d.value,0);}const styles = createSheet({container:{backgroundColor:launchColors.hex_ffffff,borderRadius:16,padding:16,marginHorizontal:12,marginVertical:8},header:{marginBottom:16},title:{fontSize:18,fontWeight:'700',color:launchColors.hex_111827},subtitle:{fontSize:14,color:launchColors.hex_6b7280,marginTop:4},heatmap:{gap:4},row:{flexDirection:'row',alignItems:'center',gap:4},dayLabel:{width:40,fontSize:12,color:launchColors.hex_6b7280,fontWeight:'500'},hourLabel:{width:32,fontSize:10,color:launchColors.hex_9ca3af,textAlign:'center'},cell:{width:12,height:28,borderRadius:2,marginHorizontal:1},hiddenCell:{opacity:0.3},activeCell:{borderWidth:1,borderColor:launchColors.rgb_0_0_0_0_1},intensityIndicator:{flex:1,backgroundColor:launchColors.rgb_0_0_0_0_2},legend:{flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:16,gap:4},legendText:{fontSize:12,color:launchColors.hex_9ca3af,marginHorizontal:8},legendCell:{width:16,height:16,borderRadius:4},stats:{flexDirection:'row',justifyContent:'space-around',marginTop:16,paddingTop:16,borderTopWidth:1,borderTopColor:launchColors.hex_f3f4f6},statItem:{alignItems:'center'},statValue:{fontSize:16,fontWeight:'700',color:launchColors.hex_111827},statLabel:{fontSize:12,color:launchColors.hex_9ca3af,marginTop:4}});
