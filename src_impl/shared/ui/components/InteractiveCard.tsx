import React,{useCallback,useState}from'react';import{View,ViewStyle,StyleSheet,Pressable,PressableProps,AccessibilityProps}from'react-native';import Animated,{useSharedValue,useAnimatedStyle,withSpring}from'react-native-reanimated';import{Text}from'../../../components/primitives/Text';import{Icon}from'../../../icons';import{useTheme}from'../../../theme';import{Skeleton}from'../state-components';import{createSheet}from'@/shared/ui/create-sheet';type CardVariant='default'|'elevated'|'outlined'|'ghost';type CardSize='sm'|'md'|'lg';type CardState='default'|'loading'|'disabled'|'error'|'selected';export interface InteractiveCardProps extends Omit<PressableProps,'onPress'|'style'>{children:React.ReactNode;onPress?:()=>void|Promise<void>;onLongPress?:()=>void;variant?:CardVariant;size?:CardSize;style?:ViewStyle;state?:CardState;loadingMessage?:string;disabledReason?:string;errorMessage?:string;onRetry?:()=>void;icon?:string;badge?:string|number;badgeColor?:string;selected?:boolean;selectionIcon?:string;accessibilityLabel?:string;accessibilityHint?:string;hapticOnPress?:boolean;scaleOnPress?:number;fullWidth?:boolean;aspectRatio?:number;}const LoadingOverlay:React.FC<{message?:string;theme:DynamicValue;}>=({message,theme})=><View style={[styles.overlay,{backgroundColor:theme.colors.background.overlay}]}>
    <Animated.View style={[styles.spinner,{borderColor:theme.colors.primary[500]}]}/>
    {message&&<Text variant="caption"color="text.secondary"style={styles.overlayMessage}>
        {message}
      </Text>}
  </View>;const DisabledOverlay:React.FC<{reason?:string;theme:DynamicValue;}>=({reason,theme})=><View style={[styles.overlay,{backgroundColor:theme.colors.background.overlay}]}>
    <Icon name="lock"size="md"color={theme.colors.text.tertiary}/>
    {reason&&<Text variant="caption"color="text.tertiary"style={styles.overlayMessage}>
        {reason}
      </Text>}
  </View>;const ErrorOverlay:React.FC<{message?:string;onRetry?:()=>void;theme:DynamicValue;}>=({message,onRetry,theme})=><View style={[styles.overlay,{backgroundColor:theme.colors.background.overlay}]}>
    <Icon name="alert-circle"size="lg"color={theme.colors.error.DEFAULT}/>
    {message&&<Text variant="caption"color="error.DEFAULT"style={styles.overlayMessage}>
        {message}
      </Text>}
    {onRetry&&<Pressable onPress={onRetry}style={[styles.retryButton,{backgroundColor:theme.colors.error.DEFAULT}]}accessibilityLabel="Retry button"accessibilityRole="button"accessibilityHint="Activates this control">
        <Text variant="caption"color="text.inverse">Retry</Text>
      </Pressable>}
  </View>;const SelectedOverlay:React.FC<{icon?:string;theme:DynamicValue;}>=({icon='check-circle',theme})=><View style={[styles.selectedIndicator,{backgroundColor:theme.colors.success.DEFAULT}]}>
    <Icon name={icon}size="sm"color="#FFFFFF"/>
  </View>;export const InteractiveCard:React.FC<InteractiveCardProps>=({children,onPress,onLongPress,variant='default',size='md',style,state='default',loadingMessage,disabledReason,errorMessage,onRetry,icon,badge,badgeColor,selected=false,selectionIcon,accessibilityLabel,accessibilityHint,hapticOnPress=true,scaleOnPress=0.98,fullWidth=false,aspectRatio,disabled:propDisabled,...pressableProps})=>{const{theme}=useTheme();const[,setIsPressed]=useState(false);const[,setIsLoading]=useState(false);const scale=useSharedValue(1);const opacity=useSharedValue(1);const isDisabled=propDisabled||state==='disabled'||state==='loading';const isError=state==='error';const animatedStyle=useAnimatedStyle(()=>({transform:[{scale:scale.value}],opacity:opacity.value}));const handlePress=useCallback(async()=>{if(isDisabled||!onPress){return;}if(hapticOnPress){}setIsLoading(true);try{await onPress();}finally{setIsLoading(false);}},[onPress,isDisabled,hapticOnPress]);const handlePressIn=useCallback(()=>{if(!isDisabled&&scaleOnPress){scale.value=withSpring(scaleOnPress,{damping:15,stiffness:300});setIsPressed(true);}},[isDisabled,scaleOnPress,scale]);const handlePressOut=useCallback(()=>{scale.value=withSpring(1,{damping:15,stiffness:300});setIsPressed(false);},[scale]);const variantStyles:Record<CardVariant,ViewStyle>={default:{backgroundColor:theme.colors.background.secondary,borderWidth:0},elevated:{backgroundColor:theme.colors.background.secondary,shadowColor:theme.colors.text.primary,shadowOffset:{width:0,height:4},shadowOpacity:0.15,shadowRadius:12,elevation:4},outlined:{backgroundColor:'transparent',borderWidth:1,borderColor:theme.colors.border.DEFAULT},ghost:{backgroundColor:'transparent',borderWidth:0}};const sizeStyles:Record<CardSize,ViewStyle>={sm:{padding:12,borderRadius:12},md:{padding:16,borderRadius:16},lg:{padding:20,borderRadius:20}};const accessibilityState:AccessibilityProps['accessibilityState']={disabled:isDisabled,selected:selected,busy:state==='loading'};return<Animated.View style={[animatedStyle,fullWidth&&styles.fullWidth]}>
      <Pressable onPress={handlePress}onLongPress={onLongPress}onPressIn={handlePressIn}onPressOut={handlePressOut}disabled={isDisabled}accessibilityRole="button"accessibilityLabel={accessibilityLabel}accessibilityHint={accessibilityHint}accessibilityState={accessibilityState}{...pressableProps}>
        <View style={[styles.card,variantStyles[variant],sizeStyles[size],selected&&[styles.selected,{borderColor:theme.colors.primary[500]}],isError&&[styles.error,{borderColor:theme.colors.error.DEFAULT}],aspectRatio!==undefined?{aspectRatio}:undefined,style]}>
          {}
          {badge!==undefined&&<View style={[styles.badge,{backgroundColor:badgeColor||theme.colors.primary[500]}]}>
              <Text variant="caption"color="text.inverse"style={styles.badgeText}>
                {typeof badge==='number'&&badge>99?'99+':badge}
              </Text>
            </View>}

          {}
          {icon&&<View style={styles.iconContainer}>
              <Icon name={icon}size="lg"color={theme.colors.primary[500]}/>
            </View>}

          {}
          <View style={styles.content}>
            {children}
          </View>

          {}
          {state==='loading'&&<LoadingOverlay message={loadingMessage}theme={theme}/>}
          {state==='disabled'&&<DisabledOverlay reason={disabledReason}theme={theme}/>}
          {state==='error'&&<ErrorOverlay message={errorMessage}onRetry={onRetry}theme={theme}/>}

          {}
          {selected&&<SelectedOverlay icon={selectionIcon}theme={theme}/>}
        </View>
      </Pressable>
    </Animated.View>;};export const CardSkeleton:React.FC<{variant?:CardVariant;size?:CardSize;lines?:number;hasIcon?:boolean;style?:ViewStyle;}>=({size='md',lines=2,hasIcon=true,style})=>{const{theme}=useTheme();const sizeStyles:Record<CardSize,ViewStyle>={sm:{padding:12,borderRadius:12},md:{padding:16,borderRadius:16},lg:{padding:20,borderRadius:20}};return<View style={[styles.card,sizeStyles[size],{backgroundColor:theme.colors.background.secondary},style]}>
      <View style={styles.skeletonRow}>
        {hasIcon&&<Skeleton variant="avatar"width={48}height={48}circle/>}
        <View style={styles.skeletonLines}>
          {Array(lines).fill(null).map((_,i)=><Skeleton key={i}variant="text"width={i===0?'70%':'50%'}height={16}style={{marginTop:i>0?8:0}}/>)}
        </View>
      </View>
    </View>;};const styles=createSheet({fullWidth:{width:'100%'},card:{position:'relative',overflow:'hidden'},selected:{borderWidth:2},error:{borderWidth:2},badge:{position:'absolute',top:-4,right:-4,minWidth:24,height:24,borderRadius:12,justifyContent:'center',alignItems:'center',paddingHorizontal:6,zIndex:10},badgeText:{fontSize:12,fontWeight:'700'},iconContainer:{marginBottom:12},content:{flex:1},overlay:{...StyleSheet.absoluteFillObject,justifyContent:'center',alignItems:'center',borderRadius:16},overlayMessage:{marginTop:8,textAlign:'center',paddingHorizontal:16},spinner:{width:32,height:32,borderRadius:16,borderWidth:3,borderTopColor:'transparent'},retryButton:{marginTop:12,paddingHorizontal:16,paddingVertical:8,borderRadius:8},selectedIndicator:{position:'absolute',top:8,right:8,width:24,height:24,borderRadius:12,justifyContent:'center',alignItems:'center'},skeletonRow:{flexDirection:'row',alignItems:'center',gap:12},skeletonLines:{flex:1,justifyContent:'center'}});export default InteractiveCard;
