import React,{useState,useEffect,useMemo}from'react'; import{Pressable,ScrollView}from'react-native'; import Animated,{useSharedValue,useAnimatedStyle,withRepeat,withTiming,Easing}from'react-native-reanimated'; import{useTheme}from'../../../theme'; import{Box,Text,Card}from'../../../components/primitives'; import{Icon}from'../../../icons';
import { launchColors } from '@theme/tokens/launch-colors';
 export interface FeaturedItem{id:string;name:string;description:string;icon:string;emoji:string;originalPrice:number;discountedPrice:number;currency:'COINS'|'GEMS';rarity:'COMMON'|'UNCOMMON'|'RARE'|'EPIC'|'LEGENDARY';}interface FeaturedShopSectionProps{items:FeaturedItem[];onItemPress:(item:FeaturedItem)=>void;}const getNextResetTime = ():number=>{const now = new Date(); const nextMonday = new Date(now); nextMonday.setUTCHours(0,0,0,0); const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7; nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday); return nextMonday.getTime();}; const formatTimeRemaining = (targetTime:number):string=>{const now = Date.now(); const remaining = Math.max(0,targetTime - now); const days = Math.floor(remaining / (1000 * 60 * 60 * 24)); const hours = Math.floor(remaining % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)); const minutes = Math.floor(remaining % (1000 * 60 * 60) / (1000 * 60)); if(days > 0){return`${days}d ${hours}h`;}if(hours > 0){return`${hours}h ${minutes}m`;}return`${minutes}m`;}; const RARITY_COLORS:Record<string,string> = {COMMON:launchColors.hex_94a3b8,UNCOMMON:launchColors.hex_22c55e,RARE:launchColors.hex_3b82f6,EPIC:launchColors.hex_a855f7,LEGENDARY:launchColors.hex_f59e0b}; const FeaturedItemCard:React.FC<{item:FeaturedItem;onPress:()=>void;isLastChance:boolean;}> = ({item,onPress,isLastChance})=>{const{theme} = useTheme(); const scale = useSharedValue(1); const pulse = useSharedValue(1); const animatedStyle = useAnimatedStyle(()=>({transform:[{scale:scale.value}]})); const glowStyle = useAnimatedStyle(()=>({shadowOpacity:pulse.value * 0.5})); React.useEffect(()=>{if(isLastChance){pulse.value = withRepeat(withTiming(0.8,{duration:1000,easing:Easing.inOut(Easing.ease)}),-1,true);}},[isLastChance,pulse]); const handlePressIn = ()=>{scale.value = withTiming(0.96,{duration:100});}; const handlePressOut = ()=>{scale.value = withTiming(1,{duration:100});}; const rarityColor = RARITY_COLORS[item.rarity] || theme.colors.primary[500]; const discountPercent = Math.round((item.originalPrice - item.discountedPrice) / item.originalPrice * 100); return<Animated.View style={[{width:160,marginRight:12,shadowColor:isLastChance ? launchColors.hex_ef4444 : rarityColor,shadowOffset:{width:0,height:4},shadowRadius:12,elevation:4},glowStyle]}>
      <Pressable onPress={onPress}onPressIn={handlePressIn}onPressOut={handlePressOut}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
        <Animated.View style={animatedStyle}>
          <Card size="md"style={{padding:12,borderWidth:2,borderColor:isLastChance ? launchColors.hex_ef4444 : rarityColor + '50'}}>
            {}
            <Box position="absolute"top={-8}right={-8}px={8}py={4}borderRadius={10}style={{backgroundColor:launchColors.hex_ef4444,zIndex:10}}>
              <Text style={{color:launchColors.hex_fff,fontWeight:'800',fontSize:12}}>
                -{discountPercent}%
              </Text>
            </Box>

            {}
            <Box width={80}height={80}borderRadius={16}justifyContent="center"alignItems="center"alignSelf="center"mb={12}style={{backgroundColor:rarityColor + '15',borderWidth:2,borderColor:rarityColor + '30'}}>
              <Text style={{fontSize:40}}>{item.emoji}</Text>
            </Box>

            {}
            <Text variant="body"style={{fontWeight:'600',textAlign:'center',marginBottom:4}}numberOfLines={1}>
              {item.name}
            </Text>

            {}
            <Box flexDirection="row"justifyContent="center"alignItems="center">
              <Text variant="caption"style={{textDecorationLine:'line-through',color:theme.colors.text.tertiary,marginRight:8}}>
                {item.originalPrice}
              </Text>
              <Box flexDirection="row"alignItems="center">
                <Icon name={item.currency === 'GEMS' ? 'gem' : 'coins'}size={14}color={item.currency === 'GEMS' ? launchColors.hex_8b5cf6 : launchColors.hex_f59e0b}/>
                <Text style={{fontWeight:'700',color:item.currency === 'GEMS' ? launchColors.hex_8b5cf6 : launchColors.hex_f59e0b,marginLeft:4}}>
                  {item.discountedPrice}
                </Text>
              </Box>
            </Box>

            {}
            {isLastChance && <Box mt={8}px={8}py={4}borderRadius={8}alignSelf="center"style={{backgroundColor:launchColors.hex_ef4444 + '20',borderWidth:1,borderColor:launchColors.hex_ef4444}}>
                <Box flexDirection="row"alignItems="center">
                  <Icon name="alert-circle"size={12}color={launchColors.hex_ef4444}/>
                  <Text style={{color:launchColors.hex_ef4444,fontWeight:'600',fontSize:11,marginLeft:4}}>
                    LAST CHANCE!
                  </Text>
                </Box>
              </Box>}
          </Card>
        </Animated.View>
      </Pressable>
    </Animated.View>;}; export const FeaturedShopSection:React.FC<FeaturedShopSectionProps> = ({items,onItemPress})=>{const{theme} = useTheme(); const[timeRemaining,setTimeRemaining] = useState(''); const[isLastChance,setIsLastChance] = useState(false); const resetTime = useMemo(()=>getNextResetTime(),[]); useEffect(()=>{const updateTimer = ()=>{const remaining = resetTime - Date.now(); setTimeRemaining(formatTimeRemaining(resetTime)); setIsLastChance(remaining < 24 * 60 * 60 * 1000);}; updateTimer(); const interval = setInterval(updateTimer,60000); return()=>clearInterval(interval);},[resetTime]); if(items.length === 0){return null;}return<Box mb={24}>
      {}
      <Box flexDirection="row"justifyContent="space-between"alignItems="center"px={16}mb={12}>
        <Box flexDirection="row"alignItems="center">
          <Box width={36}height={36}borderRadius={10}justifyContent="center"alignItems="center"mr={10}style={{backgroundColor:launchColors.hex_f59e0b + '20'}}>
            <Icon name="star"size={18}color={launchColors.hex_f59e0b}/>
          </Box>
          <Box>
            <Text variant="h4"style={{marginBottom:2}}>
              Featured Items
            </Text>
            <Text variant="caption"color="text.secondary">
              Weekly rotation - 20% off
            </Text>
          </Box>
        </Box>

        {}
        <Box px={12}py={6}borderRadius={8}style={{backgroundColor:isLastChance ? launchColors.hex_ef4444 + '15' : theme.colors.background.secondary,borderWidth:1,borderColor:isLastChance ? launchColors.hex_ef4444 + '30' : theme.colors.border.light}}>
          <Box flexDirection="row"alignItems="center">
            <Icon name="clock"size={12}color={isLastChance ? launchColors.hex_ef4444 : theme.colors.text.tertiary}/>
            <Text variant="caption"style={{marginLeft:4,fontWeight:'600',color:isLastChance ? launchColors.hex_ef4444 : theme.colors.text.secondary}}>
              Resets in {timeRemaining}
            </Text>
          </Box>
        </Box>
      </Box>

      {}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}contentContainerStyle={{paddingHorizontal:16}}>
        {items.map(item=><FeaturedItemCard key={item.id}item={item}onPress={()=>onItemPress(item)}isLastChance={isLastChance}/>)}
      </ScrollView>
    </Box>;}; export default FeaturedShopSection;
