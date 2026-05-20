import React,{useEffect,useState}from'react'; import{View,Text,Pressable,Modal,Dimensions}from'react-native'; import Animated,{useAnimatedStyle,useSharedValue,withRepeat,withSequence,withSpring,withTiming}from'react-native-reanimated'; import{LinearGradient}from'expo-linear-gradient'; import{createSheet}from'@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
 interface RewardItem{id:string;type:'XP'|'COINS'|'GEMS'|'ITEM'|'SHIELD'|'TITLE'|'COSMETIC';amount:number;itemName?:string;itemIcon?:string;rarity:'COMMON'|'RARE'|'EPIC'|'LEGENDARY';}interface RewardChestProps{isVisible:boolean;rewards:RewardItem[];onClaim:()=>void;onClose:()=>void;chestType?:'WOOD'|'SILVER'|'GOLD'|'LEGENDARY';reason?:string;}const{width,height} = Dimensions.get('window'); export const RewardChest:React.FC<RewardChestProps> = ({isVisible,rewards,onClaim,onClose,chestType = 'WOOD',reason = 'Session Complete!'})=>{const[isOpening,setIsOpening] = useState(false); const[isOpen,setIsOpen] = useState(false); const chestAnim = useSharedValue(0); const glowAnim = useSharedValue(0); useEffect(()=>{if(isVisible){setIsOpening(false); setIsOpen(false); chestAnim.value = 0; glowAnim.value = 0; glowAnim.value = withRepeat(withSequence(withTiming(1,{duration:1000}),withTiming(0,{duration:1000})),-1,true);}},[isVisible,glowAnim,chestAnim]); const handleOpen = ()=>{if(isOpening || isOpen){return;}setIsOpening(true); chestAnim.value = withSequence(withTiming(1,{duration:100}),withTiming(-1,{duration:100}),withTiming(1,{duration:100}),withTiming(0,{duration:100})); setTimeout(()=>{setIsOpen(true); setIsOpening(false);},420);}; const getChestStyle = ()=>{switch(chestType){case'LEGENDARY':return{colors:[launchColors.hex_ffd700,launchColors.hex_ff6b35,launchColors.hex_ffd700],emoji:'👑',borderColor:launchColors.hex_ffd700}; case'GOLD':return{colors:[launchColors.hex_ffd700,launchColors.hex_ffa000],emoji:'🏆',borderColor:launchColors.hex_ffd700}; case'SILVER':return{colors:[launchColors.hex_c0c0c0,launchColors.hex_808080],emoji:'🥈',borderColor:launchColors.hex_c0c0c0}; default:return{colors:[launchColors.hex_8b4513,launchColors.hex_654321],emoji:'📦',borderColor:launchColors.hex_8b4513};}}; const getRarityStyle = (rarity:string)=>{switch(rarity){case'LEGENDARY':return{color:launchColors.hex_ffd700,glow:launchColors.hex_ff6b35,border:launchColors.hex_ffd700}; case'EPIC':return{color:launchColors.hex_9c27b0,glow:launchColors.hex_e91e63,border:launchColors.hex_9c27b0}; case'RARE':return{color:launchColors.hex_2196f3,glow:launchColors.hex_03a9f4,border:launchColors.hex_2196f3}; default:return{color:launchColors.hex_9e9e9e,glow:launchColors.hex_bdbdbd,border:launchColors.hex_9e9e9e};}}; const getRewardIcon = (type:string)=>{switch(type){case'XP':return'⭐'; case'COINS':return'🪙'; case'GEMS':return'💎'; case'SHIELD':return'🛡️'; case'TITLE':return'🏷️'; case'COSMETIC':return'👕'; default:return'🎁';}}; const chestStyle = getChestStyle(); const chestAnimatedStyle = useAnimatedStyle(()=>({transform:[{rotate:`${chestAnim.value * 10}deg`},{scale:withSpring(isOpen ? 1.1 : 1)}]})); const glowAnimatedStyle = useAnimatedStyle(()=>({opacity:glowAnim.value})); return<Modal visible={isVisible}transparent animationType="fade"onRequestClose={onClose}>
      <View style={styles.overlay}>
        <LinearGradient colors={[launchColors.rgb_0_0_0_0_9,launchColors.rgb_26_26_46_0_95]}style={styles.background}>
          {}
          <Text style={styles.reasonText}>{reason}</Text>

          {}
          <Animated.View style={[styles.chestContainer,chestAnimatedStyle]}>
            {}
            <Animated.View style={[styles.glowRing,{shadowColor:chestStyle.borderColor},glowAnimatedStyle]}/>

            {}
            <Pressable onPress={handleOpen}disabled={isOpen || isOpening}style={({pressed})=>[styles.chest,pressed && {opacity:0.8},{borderColor:chestStyle.borderColor}]}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
              <LinearGradient colors={chestStyle.colors as[string,string]}style={[styles.chest,isOpen && styles.chestOpen]}>
                <Text style={styles.chestEmoji}>{isOpen ? '✨' : chestStyle.emoji}</Text>

                {!isOpen && <View style={styles.tapHint}>
                    <Text style={styles.tapText}>TAP TO OPEN</Text>
                  </View>}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {}
          {isOpen && <View style={styles.rewardsContainer}>
              <Text style={styles.rewardsTitle}>🎉 REWARDS 🎉</Text>

              <View style={styles.rewardsGrid}>
                {rewards.map((reward,index)=>{const rarity = getRarityStyle(reward.rarity); return<View key={reward.id}style={[styles.rewardCard,{borderColor:rarity.border,shadowColor:rarity.glow}]}>
                      <LinearGradient colors={[`${rarity.color}20`,`${rarity.color}10`]}style={styles.rewardGradient}>
                        <Text style={[styles.rewardIcon,{color:rarity.color}]}>{getRewardIcon(reward.type)}</Text>
                        <Text style={[styles.rewardAmount,{color:rarity.color}]}>+{reward.amount.toLocaleString()}</Text>
                        <Text style={styles.rewardType}>{reward.type}</Text>
                        {reward.rarity !== 'COMMON' && <View style={[styles.rarityBadge,{backgroundColor:rarity.color}]}>
                            <Text style={styles.rarityText}>{reward.rarity}</Text>
                          </View>}
                      </LinearGradient>
                    </View>;})}
              </View>

              {}
              <Pressable style={({pressed})=>[styles.claimButton,pressed && {opacity:0.8}]}onPress={onClaim}accessibilityLabel="CLAIM ALL button"accessibilityRole="button"accessibilityHint="Activates this control">
                <LinearGradient colors={[launchColors.hex_4caf50,launchColors.hex_2e7d32]}style={styles.claimGradient}>
                  <Text style={styles.claimText}>CLAIM ALL</Text>
                </LinearGradient>
              </Pressable>
            </View>}
        </LinearGradient>
      </View>
    </Modal>;}; const styles = createSheet({overlay:{flex:1,justifyContent:'center',alignItems:'center'},background:{position:'absolute'as const,top:0,left:0,right:0,bottom:0,justifyContent:'center',alignItems:'center',padding:24},reasonText:{fontSize:18,fontWeight:'600',color:launchColors.hex_fff,marginBottom:40,textAlign:'center'},chestContainer:{alignItems:'center',justifyContent:'center',position:'relative'},glowRing:{position:'absolute',width:200,height:200,borderRadius:100,backgroundColor:'transparent',shadowOffset:{width:0,height:0},shadowOpacity:0.6,shadowRadius:40,elevation:20},chest:{width:150,height:150,borderRadius:20,justifyContent:'center',alignItems:'center',borderWidth:4,shadowColor:launchColors.hex_000,shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:10,elevation:10},chestOpen:{transform:[{scale:1.1}]},chestEmoji:{fontSize:60},tapHint:{position:'absolute',bottom:-30,backgroundColor:launchColors.rgb_255_255_255_0_2,paddingHorizontal:16,paddingVertical:6,borderRadius:12},tapText:{color:launchColors.hex_fff,fontSize:12,fontWeight:'bold'},rewardsContainer:{width:'100%',alignItems:'center',marginTop:40},rewardsTitle:{fontSize:24,fontWeight:'bold',color:launchColors.hex_ffd700,marginBottom:20,textShadowColor:launchColors.hex_ffd700,textShadowOffset:{width:0,height:0},textShadowRadius:20},rewardsGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:12,marginBottom:30},rewardCard:{width:100,height:120,borderRadius:16,borderWidth:2,overflow:'hidden',shadowOffset:{width:0,height:0},shadowOpacity:0.8,shadowRadius:15,elevation:10},rewardGradient:{flex:1,justifyContent:'center',alignItems:'center',padding:8},rewardIcon:{fontSize:32,marginBottom:4},rewardAmount:{fontSize:20,fontWeight:'bold'},rewardType:{fontSize:10,color:launchColors.rgb_255_255_255_0_7,marginTop:2},rarityBadge:{position:'absolute',top:4,right:4,paddingHorizontal:6,paddingVertical:2,borderRadius:4},rarityText:{color:launchColors.hex_fff,fontSize:8,fontWeight:'bold'},claimButton:{width:200,borderRadius:12,overflow:'hidden'},claimGradient:{paddingVertical:16,alignItems:'center'},claimText:{color:launchColors.hex_fff,fontSize:16,fontWeight:'bold'}});
