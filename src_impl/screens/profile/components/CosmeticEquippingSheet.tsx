import React,{useState,useCallback}from'react';import{Modal,Pressable,ScrollView,ViewStyle}from'react-native';import Animated,{useSharedValue,useAnimatedStyle,withSpring,withTiming}from'react-native-reanimated';import{useTheme}from'../../../theme';import{Box,Text,Card}from'../../../components/primitives';import{Icon}from'../../../icons';import{useUIStore}from'../../../store/index';export type CosmeticType='avatar-frame'|'badge'|'background'|'title';export interface CosmeticItem{id:string;name:string;description:string;type:CosmeticType;icon:string;emoji:string;rarity:'common'|'uncommon'|'rare'|'epic'|'legendary';isEquipped:boolean;isOwned:boolean;previewColor?:string;}interface CosmeticEquippingSheetProps{type:CosmeticType|null;items:CosmeticItem[];visible:boolean;onClose:()=>void;onEquip:(itemId:string)=>void;onPreview?:(item:CosmeticItem)=>void;currentEquippedId?:string|null;style?:ViewStyle;}const TYPE_CONFIG:Record<CosmeticType,{label:string;icon:string;}>={'avatar-frame':{label:'Avatar Frames',icon:'circle'},'badge':{label:'Badges',icon:'award'},'background':{label:'Backgrounds',icon:'image'},'title':{label:'Titles',icon:'type'}};const RARITY_COLORS:Record<string,string>={common:'#94A3B8',uncommon:'#22C55E',rare:'#3B82F6',epic:'#A855F7',legendary:'#F59E0B'};const RARITY_ORDER=['legendary','epic','rare','uncommon','common'];const CosmeticCard:React.FC<{item:CosmeticItem;isSelected:boolean;isEquipped:boolean;onPress:()=>void;}>=({item,isSelected,isEquipped,onPress})=>{const{theme}=useTheme();const rarityColor=RARITY_COLORS[item.rarity];const scale=useSharedValue(1);const animatedStyle=useAnimatedStyle(()=>({transform:[{scale:scale.value}]}));const handlePressIn=()=>{scale.value=withTiming(0.96,{duration:100});};const handlePressOut=()=>{scale.value=withSpring(1,{damping:15});};return<Animated.View style={[{flex:1,minWidth:'30%',maxWidth:'31%'},animatedStyle]}>
      <Pressable onPress={onPress}onPressIn={handlePressIn}onPressOut={handlePressOut}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
        <Card size="sm"style={{aspectRatio:0.85,padding:12,alignItems:'center',justifyContent:'center',borderWidth:isSelected?3:isEquipped?2:1,borderColor:isSelected?theme.colors.primary[500]:isEquipped?rarityColor:theme.colors.border.light,backgroundColor:isSelected?theme.colors.primary[50]:isEquipped?rarityColor+'08':theme.colors.background.secondary}}>
          {}
          {isEquipped&&<Box position="absolute"top={-8}right={-8}width={24}height={24}borderRadius={12}justifyContent="center"alignItems="center"style={{backgroundColor:rarityColor,zIndex:10}}>
              <Icon name="check"size={14}color="#FFF"/>
            </Box>}

          {}
          <Box position="absolute"top={8}left={8}width={8}height={8}borderRadius={4}style={{backgroundColor:rarityColor}}/>

          {}
          <Box width={56}height={56}borderRadius={28}justifyContent="center"alignItems="center"mb={8}style={{backgroundColor:item.previewColor||rarityColor+'15',borderWidth:2,borderColor:rarityColor+'30'}}>
            <Text style={{fontSize:28}}>{item.emoji}</Text>
          </Box>

          {}
          <Text variant="caption"style={{fontWeight:isEquipped?'700':'600',textAlign:'center',color:isEquipped?rarityColor:theme.colors.text.primary,fontSize:11}}numberOfLines={1}>
            {item.name}
          </Text>

          {}
          <Text style={{fontSize:9,fontWeight:'600',textTransform:'uppercase',letterSpacing:0.5,color:rarityColor,marginTop:4}}>
            {item.rarity}
          </Text>
        </Card>
      </Pressable>
    </Animated.View>;};export const CosmeticEquippingSheet:React.FC<CosmeticEquippingSheetProps>=({type,items,visible,onClose,onEquip,onPreview,currentEquippedId,style})=>{const{theme}=useTheme();const{showToast}=useUIStore();const[selectedId,setSelectedId]=useState<string|null>(null);const[isEquipping,setIsEquipping]=useState(false);const slideUp=useSharedValue(0);React.useEffect(()=>{if(visible){slideUp.value=withSpring(1,{damping:15});setSelectedId(currentEquippedId??null);}else{slideUp.value=0;setSelectedId(null);}},[visible,slideUp,currentEquippedId]);const modalStyle=useAnimatedStyle(()=>({transform:[{translateY:(1-slideUp.value)*400}]}));const handleItemPress=useCallback((item:CosmeticItem)=>{setSelectedId(item.id);onPreview?.(item);},[onPreview]);const handleEquip=useCallback(async()=>{if(!selectedId){return;}setIsEquipping(true);await new Promise(resolve=>setTimeout(resolve,300));onEquip(selectedId);setIsEquipping(false);const item=items.find(i=>i.id===selectedId);showToast({message:`Equipped ${item?.name||'item'}!`,type:'success',duration:2000});onClose();},[selectedId,onEquip,onClose,items,showToast]);const sortedItems=[...items].sort((a,b)=>{if(a.isOwned&&!b.isOwned){return-1;}if(!a.isOwned&&b.isOwned){return 1;}const rarityDiff=RARITY_ORDER.indexOf(a.rarity)-RARITY_ORDER.indexOf(b.rarity);if(rarityDiff!==0){return rarityDiff;}return a.name.localeCompare(b.name);});const ownedCount=items.filter(i=>i.isOwned).length;const config=type?TYPE_CONFIG[type]:null;if(!config){return null;}return<Modal visible={visible}transparent animationType="none"onRequestClose={onClose}>
      <Box flex={1}style={{backgroundColor:'rgba(0, 0, 0, 0.7)',justifyContent:'flex-end'}}>
        <Pressable style={{flex:1}}onPress={onClose}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control"/>

        <Animated.View style={[modalStyle,style]}>
          <Card size="lg"style={{borderBottomLeftRadius:0,borderBottomRightRadius:0,maxHeight:'85%'}}>
            {}
            <Box alignItems="center"mb={16}>
              <Box width={40}height={4}borderRadius={2}style={{backgroundColor:theme.colors.border.DEFAULT}}/>
            </Box>

            {}
            <Box flexDirection="row"alignItems="center"mb={16}>
              <Box width={44}height={44}borderRadius={12}justifyContent="center"alignItems="center"style={{backgroundColor:theme.colors.primary[50]}}>
                <Icon name={config.icon}size={22}color={theme.colors.primary[500]}/>
              </Box>
              <Box ml={12}flex={1}>
                <Text variant="h3">{config.label}</Text>
                <Text variant="caption"color="text.secondary">
                  {ownedCount} owned
                </Text>
              </Box>
              <Pressable onPress={onClose}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                <Box width={36}height={36}borderRadius={18}justifyContent="center"alignItems="center"style={{backgroundColor:theme.colors.background.secondary}}>
                  <Icon name="x"size={20}color={theme.colors.text.tertiary}/>
                </Box>
              </Pressable>
            </Box>

            {}
            <ScrollView showsVerticalScrollIndicator={false}>
              <Box flexDirection="row"flexWrap="wrap"style={{gap:10}}>
                {sortedItems.map(item=><CosmeticCard key={item.id}item={item}isSelected={selectedId===item.id}isEquipped={item.isEquipped}onPress={()=>handleItemPress(item)}/>)}
              </Box>

              {}
              <Box height={100}/>
            </ScrollView>

            {}
            <Box position="absolute"bottom={0}left={0}right={0}p={16}style={{backgroundColor:theme.colors.background.primary,borderTopWidth:1,borderTopColor:theme.colors.border.light}}>
              <Pressable onPress={handleEquip}disabled={!selectedId||selectedId===currentEquippedId||isEquipping}style={{backgroundColor:selectedId&&selectedId!==currentEquippedId?theme.colors.primary[500]:theme.colors.background.tertiary,paddingVertical:16,borderRadius:12,alignItems:'center',flexDirection:'row',justifyContent:'center',opacity:!selectedId||selectedId===currentEquippedId||isEquipping?0.5:1}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                {isEquipping?<Animated.View style={{width:20,height:20,borderRadius:10,borderWidth:2,borderColor:'#FFF',borderTopColor:'transparent'}}/>:<Icon name="check"size={20}color="#FFF"/>}
                <Text style={{color:'#FFF',fontWeight:'700',fontSize:16,marginLeft:8}}>
                  {isEquipping?'Equipping...':selectedId===currentEquippedId?'Already Equipped':'Equip Item'}
                </Text>
              </Pressable>
            </Box>
          </Card>
        </Animated.View>
      </Box>
    </Modal>;};export default CosmeticEquippingSheet;
