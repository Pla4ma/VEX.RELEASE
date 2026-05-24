import React,{useEffect,useCallback,type ReactNode}from'react'; import{View,StyleSheet,TouchableWithoutFeedback,BackHandler,type ViewStyle}from'react-native'; import Animated,{useSharedValue,useAnimatedStyle,withTiming,withSpring,runOnJS,type SharedValue}from'react-native-reanimated'; import{useTheme}from'../../theme'; import{Box,Text}from'../primitives'; import{IconButton}from'../../icons'; import{createSheet}from'@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
 export interface ModalProps{visible:boolean;children:ReactNode;title?:string;onClose:()=>void;showCloseButton?:boolean;closeOnBackdropPress?:boolean;closeOnBackButton?:boolean;header?:ReactNode;footer?:ReactNode;animation?:'fade'|'slide'|'scale';style?:ViewStyle;contentStyle?:ViewStyle;testID?:string;}export const Modal:React.FC<ModalProps> = ({visible,children,title,onClose,showCloseButton = true,closeOnBackdropPress = true,closeOnBackButton = true,header,footer,animation = 'slide',style,contentStyle,testID})=>{const{theme} = useTheme(); const opacity = useSharedValue(0); const translateY = useSharedValue(500); const scale = useSharedValue(0.9); const backdropStyle = useAnimatedStyle(()=>({opacity:opacity.value})); const contentAnimatedStyle = useAnimatedStyle(()=>{switch(animation){case'fade':return{opacity:opacity.value}; case'scale':return{opacity:opacity.value,transform:[{scale:scale.value}]}; case'slide':default:return{opacity:opacity.value,transform:[{translateY:translateY.value}]};}}); const open = useCallback(()=>{opacity.value = withTiming(1,{duration:200}); switch(animation){case'scale':scale.value = withSpring(1,{damping:20,stiffness:200}); break; case'slide':default:translateY.value = withSpring(0,{damping:25,stiffness:300}); break;}},[animation,opacity,scale,translateY]); const close = useCallback(()=>{opacity.value = withTiming(0,{duration:150},()=>{runOnJS(onClose)();}); switch(animation){case'scale':scale.value = withTiming(0.9,{duration:150}); break; case'slide':default:translateY.value = withTiming(500,{duration:200}); break;}},[animation,onClose,opacity,scale,translateY]); useEffect(()=>{if(visible){open();}},[visible,open]); useEffect(()=>{if(!visible || !closeOnBackButton){return;}const backHandler = BackHandler.addEventListener('hardwareBackPress',()=>{close(); return true;}); return()=>backHandler.remove();},[visible,closeOnBackButton,close]); const handleBackdropPress = useCallback(()=>{if(closeOnBackdropPress){close();}},[closeOnBackdropPress,close]); const handleClosePress = useCallback(()=>{close();},[close]); if(!visible){return null;}return<View style={styles.container}testID={testID}>
      {}
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[styles.backdrop,{backgroundColor:launchColors.rgb_0_0_0_0_5},backdropStyle]}/>
      </TouchableWithoutFeedback>

      {}
      <Animated.View style={[styles.content,{backgroundColor:theme.colors.background.primary,borderRadius:theme.borderRadius.lg},contentAnimatedStyle,style,contentStyle]}>
        {}
        {(title || showCloseButton || header) && <View style={styles.header}>
            {header || <>
                <Box flex={1}>{title && <Text variant="h3">{title}</Text>}</Box>
                {showCloseButton && <IconButton name="close"size="md"onPress={handleClosePress}testID={`${testID}-close`}/>}
              </>}
          </View>}

        {}
        <View style={styles.body}>{children}</View>

        {}
        {footer && <View style={styles.footer}>{footer}</View>}
      </Animated.View>
    </View>;}; const styles = createSheet({container:{...StyleSheet.absoluteFillObject,justifyContent:'center',alignItems:'center',zIndex:1000},backdrop:{...StyleSheet.absoluteFillObject},content:{width:'90%',maxWidth:400,maxHeight:'80%',boxShadow:'0px 2px 4px rgba(0,0,0,0.25)',elevation:5},header:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingTop:16,paddingBottom:8},body:{padding:16},footer:{padding:16,borderTopWidth:1,borderTopColor:launchColors.rgb_0_0_0_0_1}}); export default Modal;
