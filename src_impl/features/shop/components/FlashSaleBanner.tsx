import React,{useState,useEffect}from'react'; import{Pressable}from'react-native'; import Animated,{useSharedValue,useAnimatedStyle,withRepeat,withTiming,withSequence,Easing,interpolate}from'react-native-reanimated'; import{useTheme}from'../../../theme'; import{Box,Text}from'../../../components/primitives'; import{Icon}from'../../../icons'; import type{FlashSale}from'../FlashSaleSystem'; import{formatFlashSaleCountdown,getFlashSaleTimeRemaining}from'../FlashSaleSystem';
import { launchColors } from '@theme/tokens/launch-colors';
 interface FlashSaleBannerProps{flashSale:FlashSale|null;onPress:()=>void;}export const FlashSaleBanner:React.FC<FlashSaleBannerProps> = ({flashSale,onPress})=>{const{theme} = useTheme(); const[timeRemaining,setTimeRemaining] = useState(''); const pulse = useSharedValue(1); const shimmer = useSharedValue(0); React.useEffect(()=>{if(flashSale){pulse.value = withRepeat(withSequence(withTiming(1.02,{duration:500,easing:Easing.inOut(Easing.ease)}),withTiming(1,{duration:500,easing:Easing.inOut(Easing.ease)})),-1,true); shimmer.value = withRepeat(withTiming(1,{duration:2000,easing:Easing.linear}),-1,false); const interval = setInterval(()=>{const remaining = getFlashSaleTimeRemaining(flashSale); setTimeRemaining(formatFlashSaleCountdown(remaining));},1000); const initialRemaining = getFlashSaleTimeRemaining(flashSale); setTimeRemaining(formatFlashSaleCountdown(initialRemaining)); return()=>clearInterval(interval);}return undefined;},[flashSale,pulse,shimmer]); const animatedStyle = useAnimatedStyle(()=>({transform:[{scale:pulse.value}]})); const shimmerStyle = useAnimatedStyle(()=>({opacity:interpolate(shimmer.value,[0,0.5,1],[0.3,0.6,0.3])})); if(!flashSale){return null;}return<Animated.View style={animatedStyle}>
      <Pressable onPress={onPress}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
        <Box mx={16}mb={20}borderRadius={16}overflow="hidden"style={{backgroundColor:launchColors.hex_1a1a2e,borderWidth:2,borderColor:launchColors.hex_ef4444,shadowColor:launchColors.hex_ef4444,shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:12,elevation:6}}>
          {}
          <Box p={12}style={{backgroundColor:launchColors.hex_ef4444}}>
            <Box flexDirection="row"justifyContent="space-between"alignItems="center">
              <Box flexDirection="row"alignItems="center">
                <Animated.View style={[{width:8,height:8,borderRadius:4,backgroundColor:launchColors.hex_fff,marginRight:8},shimmerStyle]}/>
                <Text style={{color:launchColors.hex_fff,fontWeight:'800',fontSize:16,letterSpacing:1}}>
                  ⚡ FLASH SALE
                </Text>
              </Box>

              {}
              <Box px={10}py={4}borderRadius={8}style={{backgroundColor:launchColors.rgb_0_0_0_0_3}}>
                <Box flexDirection="row"alignItems="center">
                  <Icon name="clock"size={12}color={launchColors.hex_fff}/>
                  <Text style={{color:launchColors.hex_fff,fontWeight:'700',fontSize:14,marginLeft:4,fontVariant:['tabular-nums']}}>
                    {timeRemaining}
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>

          {}
          <Box p={16}flexDirection="row"alignItems="center">
            {}
            <Box width={64}height={64}borderRadius={16}justifyContent="center"alignItems="center"style={{backgroundColor:theme.colors.background.secondary,borderWidth:2,borderColor:theme.colors.border.light}}>
              <Text style={{fontSize:32}}>{flashSale.itemIcon}</Text>
            </Box>

            {}
            <Box flex={1}ml={16}>
              <Text variant="body"style={{fontSize:18,fontWeight:'700',marginBottom:4,color:theme.colors.text.primary}}>
                {flashSale.itemName}
              </Text>

              <Text variant="caption"color="text.secondary"numberOfLines={1}style={{marginBottom:8}}>
                {flashSale.itemDescription}
              </Text>

              {}
              <Box flexDirection="row"alignItems="center">
                <Text variant="caption"style={{textDecorationLine:'line-through',color:theme.colors.text.tertiary,marginRight:10}}>
                  {flashSale.originalPrice}
                </Text>

                <Box px={10}py={4}borderRadius={8}style={{backgroundColor:flashSale.currency === 'GEMS' ? launchColors.hex_8b5cf6 + '20' : launchColors.hex_f59e0b + '20'}}>
                  <Box flexDirection="row"alignItems="center">
                    <Icon name={flashSale.currency === 'GEMS' ? 'gem' : 'coins'}size={14}color={flashSale.currency === 'GEMS' ? launchColors.hex_8b5cf6 : launchColors.hex_f59e0b}/>
                    <Text style={{fontWeight:'800',fontSize:16,color:flashSale.currency === 'GEMS' ? launchColors.hex_8b5cf6 : launchColors.hex_f59e0b,marginLeft:4}}>
                      {flashSale.discountedPrice}
                    </Text>
                  </Box>
                </Box>

                {}
                <Box ml={10}px={8}py={3}borderRadius={6}style={{backgroundColor:launchColors.hex_ef4444}}>
                  <Text style={{color:launchColors.hex_fff,fontWeight:'700',fontSize:11}}>
                    -{flashSale.discountPercent}%
                  </Text>
                </Box>
              </Box>
            </Box>

            {}
            <Box ml={12}>
              <Icon name="arrow-right"size={24}color={launchColors.hex_ef4444}/>
            </Box>
          </Box>

          {}
          <Box p={10}style={{backgroundColor:launchColors.hex_ef4444 + '10',borderTopWidth:1,borderTopColor:launchColors.hex_ef4444 + '20'}}>
            <Box flexDirection="row"justifyContent="center"alignItems="center">
              <Icon name="alert-circle"size={14}color={launchColors.hex_ef4444}/>
              <Text variant="caption"style={{color:launchColors.hex_ef4444,fontWeight:'600',marginLeft:6}}>
                Limited time - Buy now before it's gone!
              </Text>
            </Box>
          </Box>
        </Box>
      </Pressable>
    </Animated.View>;}; export default FlashSaleBanner;
