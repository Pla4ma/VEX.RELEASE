import React,{useState,useCallback,useMemo}from'react'; import{Pressable,ViewStyle,PanResponder,Animated as RNAnimated}from'react-native'; import Animated,{useSharedValue,useAnimatedStyle,withSpring,withTiming}from'react-native-reanimated'; import{useTheme}from'../../../theme'; import{Box,Text,Card}from'../../../components/primitives'; import{Icon}from'../../../icons';
import { launchColors } from '@theme/tokens/launch-colors';
 export interface FeaturedAchievement{id:string;name:string;description:string;icon:string;emoji:string;unlockedAt:number;rarity:'common'|'rare'|'epic'|'legendary';}interface AchievementShowcaseProps{achievements:FeaturedAchievement[];onReorder?:(newOrder:FeaturedAchievement[])=>void;onSelectSlot?:(slotIndex:number)=>void;style?:ViewStyle;isEditable?:boolean;}const RARITY_COLORS = {common:launchColors.hex_94a3b8,rare:launchColors.hex_3b82f6,epic:launchColors.hex_a855f7,legendary:launchColors.hex_f59e0b}; const LockedSlot:React.FC<{slotIndex:number;onPress?:()=>void;isEditable?:boolean;}> = ({slotIndex,onPress,isEditable})=>{const{theme} = useTheme(); return<Pressable onPress={onPress}disabled={!isEditable}accessibilityLabel="? button"accessibilityRole="button"accessibilityHint="Activates this control">
      <Box flex={1}borderRadius={16}justifyContent="center"alignItems="center"style={{aspectRatio:1,backgroundColor:theme.colors.background.secondary,borderWidth:2,borderStyle:'dashed',borderColor:theme.colors.border.light,opacity:isEditable ? 0.7 : 0.5}}>
        <Text style={{fontSize:32,opacity:0.3}}>?</Text>
        {isEditable && <Text variant="caption"color="text.tertiary"style={{marginTop:8,fontSize:10}}>
            Tap to add
          </Text>}
      </Box>
    </Pressable>;}; const AchievementSlot:React.FC<{achievement:FeaturedAchievement;slotIndex:number;isDragging?:boolean;onPress?:()=>void;isEditable?:boolean;}> = ({achievement,isDragging,onPress,isEditable})=>{const{theme} = useTheme(); const scale = useSharedValue(1); const animatedStyle = useAnimatedStyle(()=>({transform:[{scale:scale.value}],zIndex:isDragging ? 100 : 1})); const handlePressIn = ()=>{if(!isEditable){return;}scale.value = withTiming(0.95,{duration:100});}; const handlePressOut = ()=>{scale.value = withSpring(1,{damping:15});}; const rarityColor = RARITY_COLORS[achievement.rarity]; return<Animated.View style={[{flex:1,aspectRatio:1},animatedStyle]}>
      <Pressable onPress={onPress}onPressIn={handlePressIn}onPressOut={handlePressOut}disabled={!isEditable}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
        <Card size="md"style={{flex:1,justifyContent:'center',alignItems:'center',borderWidth:2,borderColor:rarityColor + '50',backgroundColor:rarityColor + '08'}}>
          {}
          <Box position="absolute"width={60}height={60}borderRadius={30}style={{backgroundColor:rarityColor + '15'}}/>

          {}
          <Text style={{fontSize:40,marginBottom:8}}>{achievement.emoji}</Text>

          {}
          <Text variant="caption"style={{fontWeight:'700',textAlign:'center',color:rarityColor,fontSize:11}}numberOfLines={1}>
            {achievement.name}
          </Text>

          {isEditable && <Box position="absolute"top={4}right={4}width={20}height={20}borderRadius={10}justifyContent="center"alignItems="center"style={{backgroundColor:theme.colors.background.tertiary}}>
              <Icon name="move"size={10}color={theme.colors.text.tertiary}/>
            </Box>}
        </Card>
      </Pressable>
    </Animated.View>;}; export const AchievementShowcase:React.FC<AchievementShowcaseProps> = ({achievements,onReorder,onSelectSlot,style,isEditable = false})=>{const{theme} = useTheme(); const[isEditMode,setIsEditMode] = useState(false); const[draggedIndex,setDraggedIndex] = useState<number|null>(null); const slots = useMemo(()=>{const nextSlots:Array<FeaturedAchievement|null> = [...achievements]; while(nextSlots.length < 3){nextSlots.push(null);}return nextSlots;},[achievements]); const handleEditToggle = ()=>{setIsEditMode(!isEditMode); if(isEditMode){onReorder?.(slots.filter((s):s is FeaturedAchievement=>s !== null));}}; const handleSlotPress = (index:number)=>{if(!slots[index]){onSelectSlot?.(index);}}; const handleSwap = useCallback((fromIndex:number,toIndex:number)=>{if(fromIndex === toIndex){return;}const newSlots = [...slots]; const temp = newSlots[fromIndex]; newSlots[fromIndex] = newSlots[toIndex]!; newSlots[toIndex] = temp!; onReorder?.(newSlots.filter((s):s is FeaturedAchievement=>s !== null));},[slots,onReorder]); const unlockedCount = achievements.length; const totalSlots = 3; return<Box style={style}>
      {}
      <Box flexDirection="row"justifyContent="space-between"alignItems="center"mb={16}>
        <Box>
          <Text variant="h4"style={{marginBottom:4}}>
            Featured Achievements
          </Text>
          <Text variant="caption"color="text.secondary">
            {unlockedCount} of {totalSlots} unlocked
          </Text>
        </Box>

        {unlockedCount >= 2 && <Pressable onPress={handleEditToggle}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Box px={12}py={8}borderRadius={8}style={{backgroundColor:isEditMode ? theme.colors.success[50] || launchColors.hex_ecfdf5 : theme.colors.background.secondary,borderWidth:1,borderColor:isEditMode ? theme.colors.success.DEFAULT : theme.colors.border.light}}>
              <Box flexDirection="row"alignItems="center">
                <Icon name={isEditMode ? 'check' : 'edit-2'}size={14}color={isEditMode ? theme.colors.success.DEFAULT : theme.colors.text.tertiary}/>
                <Text variant="caption"style={{marginLeft:6,fontWeight:'600',color:isEditMode ? theme.colors.success.DEFAULT : theme.colors.text.secondary}}>
                  {isEditMode ? 'Done' : 'Edit'}
                </Text>
              </Box>
            </Box>
          </Pressable>}
      </Box>

      {}
      <Box flexDirection="row"style={{gap:12}}>
        {slots.slice(0,3).map((slot,index)=>slot ? <AchievementSlot key={slot.id}achievement={slot}slotIndex={index}isDragging={draggedIndex === index}onPress={()=>handleSlotPress(index)}isEditable={isEditMode}/> : <LockedSlot key={`locked-${index}`}slotIndex={index}onPress={()=>handleSlotPress(index)}isEditable={isEditable || isEditMode}/>)}
      </Box>

      {}
      {isEditMode && <Box mt={16}p={12}borderRadius={10}style={{backgroundColor:theme.colors.primary[50],borderWidth:1,borderColor:theme.colors.primary[500] + '30'}}>
          <Box flexDirection="row"alignItems="center">
            <Icon name="info"size={16}color={theme.colors.primary[500]}/>
            <Text variant="caption"style={{marginLeft:8,color:theme.colors.primary[600],fontWeight:'500'}}>
              Tap and drag to rearrange featured achievements
            </Text>
          </Box>
        </Box>}
    </Box>;}; export default AchievementShowcase;
