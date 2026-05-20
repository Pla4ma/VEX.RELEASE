import React from'react'; import{View,ScrollView,ActivityIndicator}from'react-native'; import{Text}from'../../../components/primitives/Text'; import{useLoadoutOptions}from'../loadout-service'; import type{LoadoutItem,ActiveBuff}from'../schemas';
import { launchColors } from '@theme/tokens/launch-colors';
 interface SessionLoadoutSelectorProps{userId:string;mode:string;duration:number;}function LoadoutItemCard({item,isSelected}:{item:LoadoutItem;isSelected:boolean;}):JSX.Element{const rarityColors:Record<string,string> = {COMMON:launchColors.hex_9ca3af,UNCOMMON:launchColors.hex_10b981,RARE:launchColors.hex_3b82f6,EPIC:launchColors.hex_8b5cf6,LEGENDARY:launchColors.hex_f59e0b}; return<View style={{opacity:item.compatible ? 1 : 0.5,padding:12,borderRadius:8,borderWidth:1,borderColor:isSelected ? rarityColors[item.rarity] : launchColors.hex_e5e7eb,backgroundColor:isSelected ? `${rarityColors[item.rarity]}20` : launchColors.hex_ffffff,marginBottom:8}}>
      <View style={{flexDirection:'row',justifyContent:'space-between'}}>
        <Text style={{fontWeight:'600',color:rarityColors[item.rarity]}}>{item.name}</Text>
        <Text style={{color:launchColors.hex_6b7280}}>x{item.quantity}</Text>
      </View>

      <Text style={{fontSize:12,color:launchColors.hex_6b7280,marginTop:4}}>{item.description}</Text>

      {!item.compatible && item.incompatibilityReason && <Text style={{fontSize:11,color:launchColors.hex_ef4444,marginTop:4}}>{item.incompatibilityReason}</Text>}

      {item.compatible && <View style={{flexDirection:'row',marginTop:8,gap:8}}>
          {item.projectedImpact.xpMultiplier > 1 && <Text style={{fontSize:11,color:launchColors.hex_10b981}}>+{Math.round((item.projectedImpact.xpMultiplier - 1) * 100)}% XP</Text>}
          {item.projectedImpact.coinMultiplier > 1 && <Text style={{fontSize:11,color:launchColors.hex_f59e0b}}>+{Math.round((item.projectedImpact.coinMultiplier - 1) * 100)}% Coins</Text>}
          {item.projectedImpact.streakProtection && <Text style={{fontSize:11,color:launchColors.hex_3b82f6}}>Streak Shield</Text>}
          {item.projectedImpact.bossDamageBonus > 0 && <Text style={{fontSize:11,color:launchColors.hex_ef4444}}>+{item.projectedImpact.bossDamageBonus} Boss Dmg</Text>}
        </View>}
    </View>;}function ActiveBuffIndicator({buff}:{buff:ActiveBuff;}):JSX.Element{return<View style={{flexDirection:'row',alignItems:'center',padding:8,backgroundColor:launchColors.hex_fef3c7,borderRadius:16,marginRight:8}}>
      <Text style={{fontSize:12,color:launchColors.hex_92400e}}>{buff.name}</Text>
      {buff.effects.xpMultiplier > 1 && <Text style={{fontSize:10,color:launchColors.hex_92400e,marginLeft:4}}>+{Math.round((buff.effects.xpMultiplier - 1) * 100)}% XP</Text>}
    </View>;}export function SessionLoadoutSelector({userId,mode,duration}:SessionLoadoutSelectorProps):JSX.Element{const{data:loadout,isLoading,error} = useLoadoutOptions(userId,mode,duration); if(isLoading){return<View style={{padding:16,alignItems:'center'}}>
        <ActivityIndicator/>
        <Text style={{marginTop:8,fontSize:12,color:launchColors.hex_6b7280}}>Loading loadout options...</Text>
      </View>;}if(error){return<View style={{padding:16}}>
        <Text style={{color:launchColors.hex_ef4444}}>Failed to load inventory. Some options may be unavailable.</Text>
      </View>;}if(!loadout){return<View style={{padding:16}}>
        <Text style={{color:launchColors.hex_6b7280}}>No loadout data available.</Text>
      </View>;}const compatibleItems = loadout.available.filter(item=>item.compatible); const incompatibleItems = loadout.available.filter(item=>!item.compatible); return<View style={{padding:16}}>
      {}
      {loadout.activeBuffs.length > 0 && <View style={{marginBottom:16}}>
          <Text style={{fontWeight:'600',marginBottom:8}}>Active Buffs ({loadout.summary.activeBuffs})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {loadout.activeBuffs.map(buff=><ActiveBuffIndicator key={buff.id}buff={buff}/>)}
          </ScrollView>
        </View>}

      {}
      <View style={{flexDirection:'row',backgroundColor:launchColors.hex_f3f4f6,padding:12,borderRadius:8,marginBottom:16}}>
        <View style={{flex:1,alignItems:'center'}}>
          <Text style={{fontSize:18,fontWeight:'700',color:launchColors.hex_10b981}}>{loadout.summary.projectedXpMultiplier}x</Text>
          <Text style={{fontSize:10,color:launchColors.hex_6b7280}}>XP Multiplier</Text>
        </View>
        <View style={{flex:1,alignItems:'center'}}>
          <Text style={{fontSize:18,fontWeight:'700',color:launchColors.hex_f59e0b}}>{loadout.summary.projectedCoinMultiplier}x</Text>
          <Text style={{fontSize:10,color:launchColors.hex_6b7280}}>Coin Multiplier</Text>
        </View>
        {loadout.summary.hasStreakProtection && <View style={{flex:1,alignItems:'center'}}>
            <Text style={{fontSize:18,fontWeight:'700',color:launchColors.hex_3b82f6}}>Shield</Text>
            <Text style={{fontSize:10,color:launchColors.hex_6b7280}}>Protected</Text>
          </View>}
      </View>

      {}
      {compatibleItems.length > 0 && <View style={{marginBottom:16}}>
          <Text style={{fontWeight:'600',marginBottom:8}}>Available Items ({compatibleItems.length})</Text>
          {compatibleItems.map(item=><LoadoutItemCard key={item.id}item={item}isSelected={false}/>)}
        </View>}

      {}
      {incompatibleItems.length > 0 && <View style={{marginBottom:16,opacity:0.6}}>
          <Text style={{fontWeight:'600',marginBottom:8,color:launchColors.hex_9ca3af}}>Incompatible ({incompatibleItems.length})</Text>
          {incompatibleItems.slice(0,3).map(item=><LoadoutItemCard key={item.id}item={item}isSelected={false}/>)}
          {incompatibleItems.length > 3 && <Text style={{fontSize:12,color:launchColors.hex_9ca3af,textAlign:'center'}}>+{incompatibleItems.length - 3} more items</Text>}
        </View>}

      {}
      {loadout.offlineRestrictions.length > 0 && <View style={{backgroundColor:launchColors.hex_fef2f2,padding:12,borderRadius:8,borderLeftWidth:4,borderLeftColor:launchColors.hex_ef4444}}>
          <Text style={{fontWeight:'600',fontSize:12,color:launchColors.hex_991b1b,marginBottom:4}}>Offline Restrictions</Text>
          {loadout.offlineRestrictions.map((restriction,index)=><Text key={index}style={{fontSize:11,color:launchColors.hex_7f1d1d}}>
              • {restriction}
            </Text>)}
        </View>}

      {}
      {loadout.available.length === 0 && <View style={{alignItems:'center',padding:24}}>
          <Text style={{color:launchColors.hex_6b7280,textAlign:'center'}}>No items in your inventory. Visit the shop to get boosts and consumables.</Text>
        </View>}
    </View>;}export default SessionLoadoutSelector;
