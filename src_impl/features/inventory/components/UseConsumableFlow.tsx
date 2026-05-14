import React,{useState,useCallback}from'react';import{Modal,Pressable,ViewStyle}from'react-native';import Animated,{useSharedValue,useAnimatedStyle,withSpring,withSequence,withTiming}from'react-native-reanimated';import{useTheme}from'../../../theme';import{Box,Text,Card}from'../../../components/primitives';import{Icon}from'../../../icons';import{useUIStore}from'../../../store/index';import type{InventoryItem}from'../types';type ConsumableType='XP_BOOST'|'FOCUS_POTION'|'STREAK_SHIELD'|'COIN_BOOST'|'GEM_BOOST'|'VOID_FRAGMENT'|'FOCUS_CRYSTAL'|'CHAIN_BREAKER';interface ConsumableEffect{type:ConsumableType;label:string;description:string;icon:string;color:string;duration:number;effectDescription:string;}const CONSUMABLE_EFFECTS:Record<string,ConsumableEffect>={XP_BOOST:{type:'XP_BOOST',label:'XP Boost',description:'+25% XP for 30 minutes',icon:'zap',color:'#F59E0B',duration:30,effectDescription:'All XP gains increased by 25%'},FOCUS_POTION:{type:'FOCUS_POTION',label:'Focus Potion',description:'+10% session quality for next session',icon:'target',color:'#3B82F6',duration:60,effectDescription:'Next session gets +10% quality bonus'},STREAK_SHIELD:{type:'STREAK_SHIELD',label:'Streak Shield',description:'Protects streak for 24 hours',icon:'shield',color:'#10B981',duration:1440,effectDescription:'Streak protected from breaking'},COIN_BOOST:{type:'COIN_BOOST',label:'Coin Boost',description:'+50% coins for 1 hour',icon:'coins',color:'#F59E0B',duration:60,effectDescription:'All coin rewards increased by 50%'},GEM_BOOST:{type:'GEM_BOOST',label:'Gem Boost',description:'Double gem drops for 2 hours',icon:'gem',color:'#8B5CF6',duration:120,effectDescription:'Gem drop rate doubled'},VOID_FRAGMENT:{type:'VOID_FRAGMENT',label:'Void Fragment',description:'Deals 50 extra boss damage next session',icon:'skull',color:'#6366F1',duration:0,effectDescription:'+50 guaranteed boss damage on next encounter'},FOCUS_CRYSTAL:{type:'FOCUS_CRYSTAL',label:'Focus Crystal',description:'Reduces purity threshold for this session',icon:'diamond',color:'#10B981',duration:0,effectDescription:'Purity threshold reduced by 10 points (easier passing)'},CHAIN_BREAKER:{type:'CHAIN_BREAKER',label:'Chain Breaker',description:'Restores broken SPRINT chain',icon:'link',color:'#6366F1',duration:0,effectDescription:'Instantly restore your broken SPRINT chain progress'}};interface UseConsumableFlowProps{item:InventoryItem;itemDefinition?:{id:string;name:string;icon:string;description:string;effectType:ConsumableType;};visible:boolean;onClose:()=>void;onConfirm:()=>void;}export const UseConsumableFlow:React.FC<UseConsumableFlowProps>=({item,itemDefinition,visible,onClose,onConfirm})=>{const{theme}=useTheme();const{showToast}=useUIStore();const[isUsing,setIsUsing]=useState(false);const scale=useSharedValue(1);const opacity=useSharedValue(0);const containerStyle=useAnimatedStyle(()=>({opacity:opacity.value}));const cardStyle=useAnimatedStyle(()=>({transform:[{scale:scale.value}]}));React.useEffect(()=>{if(visible){opacity.value=withTiming(1,{duration:200});scale.value=withSpring(1,{damping:15});}else{opacity.value=0;scale.value=0.8;}},[visible,opacity,scale]);const effect=itemDefinition?.effectType?CONSUMABLE_EFFECTS[itemDefinition.effectType]:null;const handleConfirm=useCallback(async()=>{setIsUsing(true);scale.value=withSequence(withSpring(0.95,{damping:10}),withSpring(1.05,{damping:10}),withSpring(0,{damping:15}));await new Promise(resolve=>setTimeout(resolve,600));setIsUsing(false);onConfirm();onClose();showToast({message:`${effect?.label||'Item'} activated!`,type:'success',duration:3000});},[effect,onConfirm,onClose,scale,showToast]);if(!effect){return null;}return<Modal visible={visible}transparent animationType="none"onRequestClose={onClose}>
      <Animated.View style={[{flex:1,backgroundColor:'rgba(0, 0, 0, 0.7)',justifyContent:'center',alignItems:'center',padding:20},containerStyle]}>
        <Animated.View style={cardStyle}>
          <Card size="lg"style={{width:320,maxWidth:'100%',alignItems:'center',padding:24}}>
            {}
            <Box width={80}height={80}borderRadius={40}justifyContent="center"alignItems="center"mb={16}style={{backgroundColor:effect.color+'20',borderWidth:3,borderColor:effect.color}}>
              <Icon name={effect.icon}size={36}color={effect.color}/>
            </Box>

            {}
            <Text variant="h3"style={{marginBottom:8,textAlign:'center'}}>
              Use {itemDefinition?.name||effect.label}?
            </Text>

            {}
            <Text variant="body"color="text.secondary"style={{marginBottom:20,textAlign:'center'}}>
              {effect.description}
            </Text>

            {}
            <Box width="100%"p={16}borderRadius={12}mb={20}style={{backgroundColor:theme.colors.background.secondary,borderLeftWidth:4,borderLeftColor:effect.color}}>
              <Box flexDirection="row"alignItems="center"mb={8}>
                <Icon name="sparkles"size={16}color={effect.color}/>
                <Text variant="caption"style={{marginLeft:8,fontWeight:'600',color:effect.color}}>
                  EFFECT
                </Text>
              </Box>
              <Text variant="body"style={{marginBottom:4}}>
                {effect.effectDescription}
              </Text>
              <Text variant="caption"color="text.secondary">
                Duration: {effect.duration>=60?`${Math.floor(effect.duration/60)} hour${effect.duration>=120?'s':''}`:`${effect.duration} minutes`}
              </Text>
            </Box>

            {}
            {item.quantity<=1&&<Box width="100%"p={12}borderRadius={8}mb={16}style={{backgroundColor:theme.colors.warning[50]||'#FFFBEB',borderWidth:1,borderColor:theme.colors.warning.DEFAULT+'30'}}>
                <Box flexDirection="row"alignItems="center">
                  <Icon name="alert-triangle"size={16}color={theme.colors.warning.DEFAULT}/>
                  <Text variant="caption"style={{marginLeft:8,color:theme.colors.warning.DEFAULT,fontWeight:'500'}}>
                    This is your last one!
                  </Text>
                </Box>
              </Box>}

            {}
            <Box flexDirection="row"width="100%">
              <Pressable onPress={onClose}disabled={isUsing}style={{flex:1,backgroundColor:theme.colors.background.secondary,paddingVertical:14,borderRadius:10,alignItems:'center',marginRight:8,opacity:isUsing?0.5:1}}accessibilityLabel="Cancel button"accessibilityRole="button"accessibilityHint="Activates this control">
                <Text style={{color:theme.colors.text.primary,fontWeight:'600',fontSize:16}}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable onPress={handleConfirm}disabled={isUsing}style={{flex:1,backgroundColor:effect.color,paddingVertical:14,borderRadius:10,alignItems:'center',marginLeft:8,opacity:isUsing?0.7:1}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                <Box flexDirection="row"alignItems="center">
                  {isUsing?<Animated.View style={{width:20,height:20,borderRadius:10,borderWidth:2,borderColor:'#FFF',borderTopColor:'transparent'}}/>:<Icon name="check"size={18}color="#FFF"/>}
                  <Text style={{color:'#FFF',fontWeight:'600',fontSize:16,marginLeft:8}}>
                    {isUsing?'Using...':'Use Now'}
                  </Text>
                </Box>
              </Pressable>
            </Box>
          </Card>
        </Animated.View>
      </Animated.View>
    </Modal>;};export default UseConsumableFlow;
