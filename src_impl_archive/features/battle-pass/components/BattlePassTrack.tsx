import React from'react'; import{View,Text,Pressable,ScrollView}from'react-native'; import{useTheme}from'@/theme'; import{Card,Badge,Button}from'../../../components'; import type{BattlePassTier,UserBattlePass}from'../types'; import{createSheet}from'@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
 interface BattlePassTrackProps{tiers:BattlePassTier[];userProgress:UserBattlePass|null;onClaimTier?:(tierNumber:number)=>void;onPurchasePremium?:()=>void;loading?:boolean;error?:Error|null;onRetry?:()=>void;}export function BattlePassTrack({tiers,userProgress,onClaimTier,onPurchasePremium,loading,error,onRetry}:BattlePassTrackProps):JSX.Element{if(loading){return<Card style={containerStyle}>
        <View style={skeletonTrackStyle}/>
      </Card>;}if(error){return<Card style={[containerStyle,errorContainerStyle]}>
        <Text style={errorTextStyle}>Failed to load battle pass</Text>
        {onRetry && <Button variant="secondary"onPress={onRetry}accessibilityLabel="Retry button"accessibilityRole="button"accessibilityHint="Activates this control">
            Retry
          </Button>}
      </Card>;}if(!tiers.length || !userProgress){return<Card style={containerStyle}>
        <Text style={emptyTextStyle}>No battle pass data available</Text>
      </Card>;}const currentTierNum = userProgress.currentTier; const hasPremium = userProgress.isPremium; return<ScrollView style={scrollContainerStyle}>
      <Card style={containerStyle}>
        {}
        <View style={headerStyle}>
          <View style={progressInfoStyle}>
            <Text style={tierTextStyle}>Tier {currentTierNum}</Text>
            <Text style={xpTextStyle}>{userProgress.tierXp} / 1000 XP</Text>
          </View>
          {!hasPremium && <Pressable onPress={onPurchasePremium}accessibilityLabel="Upgrade button"accessibilityRole="button"accessibilityHint="Activates this control">
              <Badge variant="warning">Upgrade</Badge>
            </Pressable>}
          {hasPremium && <Badge variant="success">Premium Active</Badge>}
        </View>

        {}
        <View style={xpBarContainerStyle}>
          <View style={xpBarTrackStyle}>
            <View style={[xpBarFillStyle,{width:`${userProgress.tierXp / 1000 * 100}%`}]}/>
          </View>
        </View>

        {}
        <View style={tierListStyle}>
          {tiers.slice(0,10).map(tier=>{const isCurrent = tier.tierNumber === currentTierNum; const isCompleted = tier.tierNumber < currentTierNum; const isUnlocked = tier.tierNumber <= currentTierNum; const freeClaimed = userProgress.claimedFreeTiers.includes(tier.tierNumber); const premiumClaimed = userProgress.claimedPremiumTiers.includes(tier.tierNumber); return<View key={tier.id}style={[tierRowStyle,isCurrent && tierRowCurrentStyle]}>
                {}
                <View style={tierNumberContainerStyle}>
                  <Text style={tierNumberStyle}>{tier.tierNumber}</Text>
                </View>

                {}
                <View style={rewardContainerStyle}>
                  <View style={[rewardBoxStyle,isCompleted && !freeClaimed && rewardBoxClaimableStyle,freeClaimed && rewardBoxClaimedStyle]}>
                    <Text style={rewardTypeStyle}>Free</Text>
                    <Text style={rewardValueStyle}numberOfLines={1}>
                      {tier.freeRewardType}
                    </Text>
                    {isCompleted && !freeClaimed && <Pressable onPress={()=>onClaimTier?.(tier.tierNumber)}style={claimButtonStyle}accessibilityLabel="Claim button"accessibilityRole="button"accessibilityHint="Activates this control">
                        <Badge variant="success"size="sm">
                          Claim
                        </Badge>
                      </Pressable>}
                    {freeClaimed && <Badge variant="secondary"size="sm">
                        Claimed
                      </Badge>}
                  </View>
                </View>

                {}
                <View style={rewardContainerStyle}>
                  <View style={[rewardBoxStyle,premiumBoxStyle,!hasPremium && premiumBoxLockedStyle,hasPremium && isUnlocked && !premiumClaimed && rewardBoxClaimableStyle,premiumClaimed && rewardBoxClaimedStyle]}>
                    <Text style={rewardTypeStyle}>Premium</Text>
                    <Text style={rewardValueStyle}numberOfLines={1}>
                      {tier.premiumRewardType}
                    </Text>
                    {!hasPremium && <Badge variant="secondary"size="sm">
                        🔒
                      </Badge>}
                    {hasPremium && isUnlocked && !premiumClaimed && <Pressable onPress={()=>onClaimTier?.(tier.tierNumber)}style={claimButtonStyle}accessibilityLabel="Claim button"accessibilityRole="button"accessibilityHint="Activates this control">
                        <Badge variant="success"size="sm">
                          Claim
                        </Badge>
                      </Pressable>}
                    {premiumClaimed && <Badge variant="secondary"size="sm">
                        Claimed
                      </Badge>}
                  </View>
                </View>
              </View>;})}
        </View>
      </Card>
    </ScrollView>;}const scrollContainerStyle = {flex:1}; const containerStyle = {padding:16,margin:16}; const skeletonTrackStyle = {height:400,backgroundColor:launchColors.hex_e0e0e0,borderRadius:8}; const errorContainerStyle = {alignItems:'center'as const,paddingVertical:24}; const errorTextStyle = {marginBottom:12,color:launchColors.hex_dc2626}; const emptyTextStyle = {textAlign:'center'as const,color:launchColors.hex_6b7280}; const headerStyle = {flexDirection:'row'as const,justifyContent:'space-between'as const,alignItems:'center'as const,marginBottom:16}; const progressInfoStyle = {flex:1}; const tierTextStyle = {fontSize:20,fontWeight:'700'as const}; const xpTextStyle = {fontSize:14,color:launchColors.hex_6b7280,marginTop:2}; const xpBarContainerStyle = {marginBottom:24}; const xpBarTrackStyle = {height:8,backgroundColor:launchColors.hex_e5e7eb,borderRadius:4}; const xpBarFillStyle = {height:'100%'as const,backgroundColor:launchColors.hex_4f46e5,borderRadius:4}; const tierListStyle = {gap:12}; const tierRowStyle = {flexDirection:'row'as const,alignItems:'center'as const,paddingVertical:8,borderBottomWidth:1,borderBottomColor:launchColors.hex_f3f4f6}; const tierRowCurrentStyle = {backgroundColor:launchColors.hex_fef3c7,borderRadius:8,paddingHorizontal:8}; const tierNumberContainerStyle = {width:40,alignItems:'center'as const}; const tierNumberStyle = {fontSize:16,fontWeight:'700'as const,color:launchColors.hex_374151}; const rewardContainerStyle = {flex:1,paddingHorizontal:4}; const rewardBoxStyle = {padding:12,backgroundColor:launchColors.hex_f3f4f6,borderRadius:8,alignItems:'center'as const}; const premiumBoxStyle = {backgroundColor:launchColors.hex_fdf4ff,borderWidth:1,borderColor:launchColors.hex_e9d5ff}; const premiumBoxLockedStyle = {opacity:0.5}; const rewardBoxClaimableStyle = {backgroundColor:launchColors.hex_d1fae5,borderColor:launchColors.hex_10b981,borderWidth:2}; const rewardBoxClaimedStyle = {backgroundColor:launchColors.hex_e5e7eb,opacity:0.7}; const rewardTypeStyle = {fontSize:10,fontWeight:'600'as const,textTransform:'uppercase'as const,color:launchColors.hex_6b7280,marginBottom:4}; const rewardValueStyle = {fontSize:14,fontWeight:'500'as const,color:launchColors.hex_374151,marginBottom:8}; const claimButtonStyle = {marginTop:4};
