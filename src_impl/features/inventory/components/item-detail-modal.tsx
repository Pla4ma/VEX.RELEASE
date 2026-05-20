import React,{useCallback,useMemo}from'react'; import{View,Text,Modal,Pressable,ScrollView,TouchableWithoutFeedback,Dimensions}from'react-native'; import type{InventoryItem,ItemType,ItemRarity,EquipmentSlot}from'../schemas'; import{createSheet}from'@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
 interface ItemDetailModalProps{visible:boolean;item:InventoryItem|null;onClose:()=>void;onUse?:()=>void;onEquip?:()=>void;onUnequip?:()=>void;onDestroy?:()=>void;onCraft?:()=>void;onGift?:()=>void;isProcessing?:boolean}interface ItemDefinition{id:string;name:string;description:string;type:ItemType;rarity:ItemRarity;iconUrl:string|null;baseValue:number;effects?:Array<{type:string;value:number;duration:number}>;passiveEffects?:Array<{type:string;value:number}>;equipmentSlot?:EquipmentSlot;maxUses?:number;craftingRecipe?:{ingredients:Array<{itemDefinitionId:string;quantity:number}>}}const RARITY_CONFIG:Record<ItemRarity,{color:string;backgroundColor:string;label:string}> = {COMMON:{color:launchColors.hex_9ca3af,backgroundColor:launchColors.hex_f3f4f6,label:'Common'},UNCOMMON:{color:launchColors.hex_10b981,backgroundColor:launchColors.hex_d1fae5,label:'Uncommon'},RARE:{color:launchColors.hex_3b82f6,backgroundColor:launchColors.hex_dbeafe,label:'Rare'},EPIC:{color:launchColors.hex_8b5cf6,backgroundColor:launchColors.hex_ede9fe,label:'Epic'},LEGENDARY:{color:launchColors.hex_f59e0b,backgroundColor:launchColors.hex_fef3c7,label:'Legendary'}}; const TYPE_LABELS:Record<ItemType,string> = {CONSUMABLE:'Consumable',EQUIPMENT:'Equipment',COSMETIC:'Cosmetic',CRAFTING:'Crafting Material',COLLECTIBLE:'Collectible'}; const SLOT_LABELS:Record<EquipmentSlot,string> = {HEAD:'Head',BODY:'Body',HANDS:'Hands',FEET:'Feet',ACCESSORY_1:'Accessory 1',ACCESSORY_2:'Accessory 2',FOCUS_TOOL:'Focus Tool',PET:'Pet'}; export function ItemDetailModal({visible,item,onClose,onUse,onEquip,onUnequip,onDestroy,onCraft,onGift,isProcessing = false}:ItemDetailModalProps){const definition:ItemDefinition|null = useMemo(()=>{if(!item){return null;}return{id:item.itemDefinitionId,name:'Sample Item',description:'This is a sample item description that would come from the item definition.',type:'CONSUMABLE',rarity:'RARE',iconUrl:null,baseValue:100,effects:[{type:'HEAL',value:50,duration:0}],equipmentSlot:undefined};},[item]); const rarity = definition ? RARITY_CONFIG[definition.rarity] : null; const isEquipped = item?.status === 'EQUIPPED'; const isConsumable = definition?.type === 'CONSUMABLE'; const isEquipment = definition?.type === 'EQUIPMENT'; const isCrafting = definition?.type === 'CRAFTING'; const handleAction = useCallback((action:()=>void)=>{if(!isProcessing){action();}},[isProcessing]); if(!item || !definition){return null;}return<Modal visible={visible}transparent animationType="fade"onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e=>e.stopPropagation()}>
            <View style={styles.container}>
              {}
              <View style={[styles.header,{backgroundColor:rarity?.backgroundColor}]}>
                <Pressable onPress={onClose}style={({pressed})=>[styles.closeButton,pressed && {opacity:0.8}]}accessibilityLabel="Close modal"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>

                <View style={styles.iconContainer}>
                  <View style={[styles.iconPlaceholder,{borderColor:rarity?.color}]}>
                    <Text style={styles.iconText}>📦</Text>
                  </View>
                </View>

                <View style={styles.rarityBadge}>
                  <Text style={[styles.rarityText,{color:rarity?.color}]}>
                    {rarity?.label}
                  </Text>
                </View>
              </View>

              <ScrollView style={styles.content}showsVerticalScrollIndicator={false}>
                {}
                <Text style={styles.itemName}>{definition.name}</Text>

                {}
                <View style={styles.metaRow}>
                  <View style={[styles.typeBadge,{backgroundColor:rarity?.backgroundColor}]}>
                    <Text style={[styles.typeText,{color:rarity?.color}]}>
                      {TYPE_LABELS[definition.type]}
                    </Text>
                  </View>

                  <Text style={styles.quantityText}>
                    Quantity: <Text style={styles.quantityValue}>{item.quantity}</Text>
                  </Text>
                </View>

                {isEquipped && <View style={styles.equippedBadge}>
                    <Text style={styles.equippedText}>✓ Currently Equipped</Text>
                  </View>}

                {}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.description}>{definition.description}</Text>
                </View>

                {}
                {definition.effects && definition.effects.length > 0 && <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Effects</Text>
                    {definition.effects.map((effect,index)=><View key={index}style={styles.effectRow}>
                        <Text style={styles.effectType}>{effect.type}</Text>
                        <Text style={styles.effectValue}>+{effect.value}</Text>
                      </View>)}
                  </View>}

                {}
                {isEquipment && definition.passiveEffects && definition.passiveEffects.length > 0 && <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Passive Bonuses</Text>
                    {definition.passiveEffects.map((effect,index)=><View key={index}style={styles.effectRow}>
                        <Text style={styles.effectType}>{effect.type}</Text>
                        <Text style={styles.effectValue}>+{effect.value}</Text>
                      </View>)}
                  </View>}

                {}
                {isEquipment && definition.equipmentSlot && <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Equipment Slot</Text>
                    <Text style={styles.slotText}>{SLOT_LABELS[definition.equipmentSlot]}</Text>
                  </View>}

                {}
                {isConsumable && item.usesRemaining !== null && <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Uses Remaining</Text>
                    <Text style={styles.usesText}>
                      {item.usesRemaining} / {definition.maxUses ?? 1}
                    </Text>
                  </View>}

                {}
                {item.enhancementLevel > 0 && <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Enhancement</Text>
                    <Text style={styles.enhancementText}>+{item.enhancementLevel}</Text>
                  </View>}

                {}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Base Value</Text>
                  <Text style={styles.valueText}>{definition.baseValue} coins</Text>
                </View>

                {}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Acquired</Text>
                  <Text style={styles.acquiredText}>
                    {new Date(item.acquiredAt).toLocaleDateString()} from {item.acquiredFrom}
                  </Text>
                </View>

                {}
                <View style={styles.spacer}/>
              </ScrollView>

              {}
              <View style={styles.actions}>
                {isConsumable && onUse && <Pressable onPress={()=>handleAction(onUse)}disabled={isProcessing}style={({pressed})=>[styles.actionButton,styles.useButton,pressed && {opacity:0.8}]}accessibilityLabel="Use item"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                    <Text style={styles.actionButtonText}>
                      {isProcessing ? 'Using...' : 'USE'}
                    </Text>
                  </Pressable>}

                {isEquipment && (isEquipped ? onUnequip && <Pressable onPress={()=>handleAction(onUnequip)}disabled={isProcessing}style={({pressed})=>[styles.actionButton,styles.unequipButton,pressed && {opacity:0.8}]}accessibilityLabel="Unequip item"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                        <Text style={styles.actionButtonText}>
                          {isProcessing ? 'Unequipping...' : 'UNEQUIP'}
                        </Text>
                      </Pressable> : onEquip && <Pressable onPress={()=>handleAction(onEquip)}disabled={isProcessing}style={({pressed})=>[styles.actionButton,styles.equipButton,pressed && {opacity:0.8}]}accessibilityLabel="Equip item"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                        <Text style={styles.actionButtonText}>
                          {isProcessing ? 'Equipping...' : 'EQUIP'}
                        </Text>
                      </Pressable>)}

                {isCrafting && onCraft && <Pressable onPress={()=>handleAction(onCraft)}style={({pressed})=>[styles.actionButton,styles.craftButton,pressed && {opacity:0.8}]}accessibilityLabel="Craft with item"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                    <Text style={styles.actionButtonText}>CRAFT WITH</Text>
                  </Pressable>}

                {onGift && <Pressable onPress={()=>handleAction(onGift)}style={({pressed})=>[styles.actionButton,styles.giftButton,pressed && {opacity:0.8}]}accessibilityLabel="Gift item"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                    <Text style={styles.actionButtonText}>GIFT</Text>
                  </Pressable>}

                {onDestroy && <Pressable onPress={()=>handleAction(onDestroy)}disabled={isProcessing}style={({pressed})=>[styles.actionButton,styles.destroyButton,pressed && {opacity:0.8}]}accessibilityLabel="Destroy item"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                    <Text style={[styles.actionButtonText,styles.destroyText]}>
                      {isProcessing ? 'Destroying...' : 'DESTROY'}
                    </Text>
                  </Pressable>}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>;}const{width,height} = Dimensions.get('window'); const MODAL_WIDTH = Math.min(width * 0.9,400); const styles = createSheet({overlay:{flex:1,backgroundColor:launchColors.rgb_0_0_0_0_5,justifyContent:'center',alignItems:'center'},container:{width:MODAL_WIDTH,maxHeight:height * 0.8,backgroundColor:launchColors.hex_ffffff,borderRadius:16,overflow:'hidden'},header:{padding:20,paddingTop:16,alignItems:'center',position:'relative'},closeButton:{position:'absolute',top:12,right:12,width:32,height:32,justifyContent:'center',alignItems:'center',backgroundColor:launchColors.rgb_0_0_0_0_05,borderRadius:16},closeButtonText:{fontSize:24,color:launchColors.hex_6b7280,lineHeight:28},iconContainer:{marginTop:8},iconPlaceholder:{width:80,height:80,borderRadius:12,borderWidth:3,justifyContent:'center',alignItems:'center',backgroundColor:launchColors.hex_ffffff},iconText:{fontSize:40},rarityBadge:{marginTop:12,paddingHorizontal:12,paddingVertical:4,backgroundColor:launchColors.hex_ffffff,borderRadius:12},rarityText:{fontSize:12,fontWeight:'700',textTransform:'uppercase'},content:{padding:20,paddingTop:0},itemName:{fontSize:22,fontWeight:'700',color:launchColors.hex_111827,textAlign:'center',marginTop:16,marginBottom:8},metaRow:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:12,marginBottom:16},typeBadge:{paddingHorizontal:10,paddingVertical:4,borderRadius:12},typeText:{fontSize:12,fontWeight:'600'},quantityText:{fontSize:14,color:launchColors.hex_6b7280},quantityValue:{fontWeight:'700',color:launchColors.hex_111827},equippedBadge:{backgroundColor:launchColors.hex_d1fae5,paddingHorizontal:12,paddingVertical:6,borderRadius:8,alignSelf:'center',marginBottom:16},equippedText:{color:launchColors.hex_059669,fontSize:12,fontWeight:'600'},section:{marginTop:20,paddingTop:16,borderTopWidth:1,borderTopColor:launchColors.hex_e5e7eb},sectionTitle:{fontSize:12,fontWeight:'600',color:launchColors.hex_6b7280,textTransform:'uppercase',marginBottom:8},description:{fontSize:14,color:launchColors.hex_374151,lineHeight:20},effectRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:6},effectType:{fontSize:14,color:launchColors.hex_374151},effectValue:{fontSize:14,fontWeight:'600',color:launchColors.hex_10b981},slotText:{fontSize:14,color:launchColors.hex_374151},usesText:{fontSize:14,color:launchColors.hex_374151},enhancementText:{fontSize:18,fontWeight:'700',color:launchColors.hex_f59e0b},valueText:{fontSize:14,color:launchColors.hex_374151},acquiredText:{fontSize:12,color:launchColors.hex_6b7280},spacer:{height:20},actions:{padding:16,paddingTop:12,backgroundColor:launchColors.hex_f9fafb,borderTopWidth:1,borderTopColor:launchColors.hex_e5e7eb,flexDirection:'row',flexWrap:'wrap',gap:8},actionButton:{flex:1,minWidth:80,paddingVertical:12,paddingHorizontal:16,borderRadius:8,alignItems:'center'},actionButtonText:{fontSize:12,fontWeight:'700',color:launchColors.hex_ffffff},useButton:{backgroundColor:launchColors.hex_10b981},equipButton:{backgroundColor:launchColors.hex_3b82f6},unequipButton:{backgroundColor:launchColors.hex_6b7280},craftButton:{backgroundColor:launchColors.hex_8b5cf6},giftButton:{backgroundColor:launchColors.hex_f59e0b},destroyButton:{backgroundColor:launchColors.hex_fee2e2,borderWidth:1,borderColor:launchColors.hex_fecaca},destroyText:{color:launchColors.hex_ef4444}});
