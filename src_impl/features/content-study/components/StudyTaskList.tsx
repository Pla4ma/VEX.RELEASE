import React,{useCallback,useMemo}from'react';import{View,Pressable,ScrollView}from'react-native';import{Text}from'../../../components/primitives/Text';import{useTheme}from'../../../theme';import{Icon}from'../../../icons';import type{StudyTaskListProps,StudyTask}from'../types';import{TASK_PRIORITY_CONFIG}from'../constants';import{createSheet}from'@/shared/ui/create-sheet';export const StudyTaskList:React.FC<StudyTaskListProps>=({tasks,completedIds,activeId,onTaskComplete,onTaskSelect,showDependencies=true,readOnly=false,estimatedTotalTime,completedTime})=>{const{theme}=useTheme();const sortedTasks=useMemo(()=>{const priorityOrder={HIGH:0,MEDIUM:1,LOW:2};return[...tasks].sort((a,b)=>{const priorityDiff=priorityOrder[a.priority]-priorityOrder[b.priority];if(priorityDiff!==0){return priorityDiff;}return a.estimatedMinutes-b.estimatedMinutes;});},[tasks]);const isTaskUnlocked=useCallback((task:StudyTask):boolean=>{if(!task.dependsOn||task.dependsOn.length===0){return true;}return task.dependsOn.every(depId=>completedIds.has(depId));},[completedIds]);const formatDuration=(minutes:number):string=>{if(minutes<60){return`${minutes} min`;}const hours=Math.floor(minutes/60);const mins=minutes%60;return mins>0?`${hours}h ${mins}m`:`${hours}h`;};const completionPercentage=tasks.length>0?completedIds.size/tasks.length*100:0;return<View style={styles.container}>
      {}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Icon name="check-square"size="sm"color={theme.colors.primary[500]}/>
          <Text style={[styles.title,{color:theme.colors.text.primary}]}>
            Study Tasks ({completedIds.size}/{tasks.length})
          </Text>
        </View>
        <View style={styles.progressInfo}>
          <View style={[styles.progressBar,{backgroundColor:theme.colors.background.primary}]}>
            <View style={[styles.progressFill,{backgroundColor:theme.colors.success[500],width:`${completionPercentage}%`}]}/>
          </View>
          <Text style={[styles.timeText,{color:theme.colors.text.muted}]}>
            {formatDuration(completedTime)} / {formatDuration(estimatedTotalTime)}
          </Text>
        </View>
      </View>

      {}
      <ScrollView style={styles.taskList}showsVerticalScrollIndicator={false}>
        {sortedTasks.map((task,index)=>{const isCompleted=completedIds.has(task.id);const isActive=activeId===task.id;const isLocked=!isTaskUnlocked(task)&&!isCompleted;const priorityConfig=TASK_PRIORITY_CONFIG[task.priority];return<Pressable key={task.id}style={({pressed})=>[styles.taskCard,{backgroundColor:isCompleted?theme.colors.success[50]:isActive?theme.colors.primary[50]:theme.colors.background.secondary,borderColor:isActive?theme.colors.primary[500]:theme.colors.border.DEFAULT,opacity:isLocked?0.5:pressed?0.8:1}]}onPress={()=>!isLocked&&onTaskSelect(task.id)}disabled={isLocked||readOnly}accessibilityRole="button"accessibilityState={{selected:isActive,disabled:isLocked}}accessibilityLabel="Interactive control"accessibilityHint="Activates this control">
              {}
              <Pressable style={({pressed})=>[styles.checkbox,{borderColor:isCompleted?theme.colors.success[500]:theme.colors.border.DEFAULT,backgroundColor:isCompleted?theme.colors.success[500]:'transparent',opacity:pressed&&!isLocked&&!readOnly?0.8:1}]}onPress={()=>!readOnly&&onTaskComplete(task.id)}disabled={isLocked||readOnly}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                {isCompleted&&<Icon name="check"size="xs"color={theme.colors.background.primary}/>}
              </Pressable>

              {}
              <View style={styles.taskContent}>
                <Text style={[styles.taskText,{color:theme.colors.text.primary,textDecorationLine:isCompleted?'line-through':'none'}]}>
                  {task.content}
                </Text>

                <View style={styles.taskMeta}>
                  {}
                  <View style={[styles.priorityBadge,{backgroundColor:priorityConfig.color}]}>
                    <Text style={[styles.priorityText,{color:priorityConfig.textColor}]}>{priorityConfig.label}</Text>
                  </View>

                  {}
                  <View style={styles.durationBadge}>
                    <Icon name="clock"size="xs"color={theme.colors.text.muted}/>
                    <Text style={[styles.durationText,{color:theme.colors.text.muted}]}>{formatDuration(task.estimatedMinutes)}</Text>
                  </View>

                  {}
                  {showDependencies&&task.dependsOn&&task.dependsOn.length>0&&<View style={styles.dependencyBadge}>
                      <Icon name="link"size="xs"color={theme.colors.text.muted}/>
                      <Text style={[styles.dependencyText,{color:theme.colors.text.muted}]}>
                        {task.dependsOn.length} prerequisite{task.dependsOn.length>1?'s':''}
                      </Text>
                    </View>}
                </View>
              </View>

              {}
              {isLocked&&<Icon name="lock"size="sm"color={theme.colors.text.muted}/>}
            </Pressable>;})}
      </ScrollView>
    </View>;};const styles=createSheet({container:{gap:12},header:{gap:8},headerTitle:{flexDirection:'row',alignItems:'center',gap:8},title:{fontSize:16,fontWeight:'600'},progressInfo:{gap:8},progressBar:{height:6,borderRadius:3,overflow:'hidden'},progressFill:{height:'100%',borderRadius:3},timeText:{fontSize:13},taskList:{maxHeight:400},taskCard:{flexDirection:'row',alignItems:'flex-start',gap:12,padding:12,borderRadius:12,borderWidth:1,marginBottom:8},checkbox:{width:24,height:24,borderRadius:6,borderWidth:2,alignItems:'center',justifyContent:'center',marginTop:2},taskContent:{flex:1,gap:8},taskText:{fontSize:15,lineHeight:22},taskMeta:{flexDirection:'row',flexWrap:'wrap',gap:8},priorityBadge:{paddingHorizontal:8,paddingVertical:2,borderRadius:4},priorityText:{fontSize:11,fontWeight:'500'},durationBadge:{flexDirection:'row',alignItems:'center',gap:4},durationText:{fontSize:12},dependencyBadge:{flexDirection:'row',alignItems:'center',gap:4},dependencyText:{fontSize:12}});
