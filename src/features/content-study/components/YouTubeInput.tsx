import React,{useCallback,useEffect,useState}from'react'; import{View,TextInput,Pressable,Image,ActivityIndicator}from'react-native'; import{Text}from'../../../components/primitives/Text'; import{Button}from'../../../components/primitives/Button'; import{useTheme}from'../../../theme'; import{Icon}from'../../../icons'; import type{YouTubeInputProps}from'../types'; import{validateYouTubeUrl,extractYouTubeVideoId}from'../validation'; import{createSheet}from'@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
 export const YouTubeInput:React.FC<YouTubeInputProps> = ({value,onChange,onValidationChange,onExtract,disabled = false,isExtracting = false,extractionError,videoInfo})=>{const{theme} = useTheme(); const[isFocused,setIsFocused] = useState(false); const[validationState,setValidationState] = useState<{isValid:boolean;errors:string[];warnings:string[];videoId?:string;}>({isValid:false,errors:[],warnings:[]}); useEffect(()=>{if(!value){setValidationState({isValid:false,errors:[],warnings:[]}); onValidationChange?.(false); return;}const result = validateYouTubeUrl(value); setValidationState({isValid:result.isValid,errors:result.errors.map(e=>e.message),warnings:result.warnings.map(w=>w.message),videoId:result.metadata?.youtubeVideoId}); onValidationChange?.(result.isValid,result.errors[0]?.message);},[value,onValidationChange]); const clearInput = useCallback(()=>{onChange('');},[onChange]); const handlePaste = useCallback(async()=>{},[]); const formatDuration = (seconds?:number):string=>{if(!seconds){return'';}const mins = Math.floor(seconds / 60); const hrs = Math.floor(mins / 60); if(hrs > 0){return`${hrs}:${String(mins % 60).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;}return`${mins}:${String(seconds % 60).padStart(2,'0')}`;}; return<View style={styles.container}>
      {}
      <View style={[styles.inputContainer,{borderColor:isFocused ? theme.colors.primary[500] : extractionError || validationState.errors.length > 0 ? theme.colors.error[500] : validationState.warnings.length > 0 ? theme.colors.warning[500] : theme.colors.border.DEFAULT}]}>
        <Icon name="link"size="sm"color={theme.colors.text.muted}style={styles.inputIcon}/>
        <TextInput style={[styles.input,{color:theme.colors.text.primary}]}value={value}onChangeText={onChange}onFocus={()=>setIsFocused(true)}onBlur={()=>setIsFocused(false)}placeholder="Paste YouTube URL (youtube.com/watch?v=...)"placeholderTextColor={theme.colors.text.muted}editable={!disabled && !isExtracting}autoCapitalize="none"autoCorrect={false}keyboardType="url"accessibilityLabel="YouTube URL input"/>
        {value.length > 0 && !disabled && <Pressable onPress={clearInput}style={({pressed})=>[styles.clearButton,pressed && {opacity:0.8}]}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Icon name="x"size="sm"color={theme.colors.text.muted}/>
          </Pressable>}
      </View>

      {}
      {validationState.errors.length > 0 && <View style={styles.messageContainer}>
          {validationState.errors.map((error,index)=><View key={index}style={styles.messageRow}>
              <Icon name="alert-circle"size="sm"color={theme.colors.error[500]}/>
              <Text style={[styles.messageText,{color:theme.colors.error[500]}]}>{error}</Text>
            </View>)}
        </View>}

      {validationState.errors.length === 0 && validationState.warnings.length > 0 && <View style={styles.messageContainer}>
          {validationState.warnings.map((warning,index)=><View key={index}style={styles.messageRow}>
              <Icon name="alert-triangle"size="sm"color={theme.colors.warning[500]}/>
              <Text style={[styles.messageText,{color:theme.colors.warning[500]}]}>{warning}</Text>
            </View>)}
        </View>}

      {}
      {(videoInfo || isExtracting) && validationState.isValid && <View style={[styles.previewCard,{backgroundColor:theme.colors.background.secondary,borderColor:theme.colors.border.DEFAULT}]}>
          {isExtracting ? <View style={styles.extractingContainer}>
              <ActivityIndicator color={theme.colors.primary[500]}/>
              <Text style={[styles.extractingText,{color:theme.colors.text.secondary}]}>Extracting video transcript...</Text>
            </View> : videoInfo ? <>
              {videoInfo.thumbnail && <Image source={{uri:videoInfo.thumbnail}}style={styles.thumbnail}resizeMode="cover"/>}
              <View style={styles.previewInfo}>
                <Text style={[styles.videoTitle,{color:theme.colors.text.primary}]}numberOfLines={2}>
                  {videoInfo.title || 'Video title unavailable'}
                </Text>
                {videoInfo.channelName && <Text style={[styles.channelName,{color:theme.colors.text.secondary}]}>{videoInfo.channelName}</Text>}
                {videoInfo.duration && <View style={styles.durationBadge}>
                    <Icon name="clock"size="xs"color={theme.colors.text.muted}/>
                    <Text style={[styles.durationText,{color:theme.colors.text.muted}]}>{formatDuration(videoInfo.duration)}</Text>
                  </View>}
              </View>
            </> : null}

          {extractionError && <View style={styles.extractionErrorContainer}>
              <Icon name="alert-circle"size="md"color={theme.colors.error[500]}/>
              <Text style={[styles.extractionErrorText,{color:theme.colors.error[500]}]}>{extractionError}</Text>
              {onExtract && <Button variant="ghost"size="sm"onPress={onExtract}accessibilityLabel="Retry button"accessibilityRole="button"accessibilityHint="Activates this control">
                  Retry
                </Button>}
            </View>}
        </View>}

      {}
      {!videoInfo && !isExtracting && validationState.isValid && <Text style={[styles.helpText,{color:theme.colors.text.muted}]}>We'll extract the video's transcript and create study materials from it.</Text>}
    </View>;}; const styles = createSheet({container:{gap:12},inputContainer:{flexDirection:'row',alignItems:'center',borderWidth:1,borderRadius:12,paddingHorizontal:12,height:48},inputIcon:{marginRight:8},input:{flex:1,fontSize:15,height:'100%'},clearButton:{padding:4},messageContainer:{gap:4},messageRow:{flexDirection:'row',alignItems:'center',gap:6},messageText:{fontSize:13,flex:1},previewCard:{borderWidth:1,borderRadius:12,overflow:'hidden',marginTop:8},thumbnail:{width:'100%',height:160,backgroundColor:launchColors.hex_000},previewInfo:{padding:12,gap:4},videoTitle:{fontSize:15,fontWeight:'600',lineHeight:20},channelName:{fontSize:13},durationBadge:{flexDirection:'row',alignItems:'center',gap:4,marginTop:4},durationText:{fontSize:12},extractingContainer:{padding:24,alignItems:'center',gap:12},extractingText:{fontSize:14},extractionErrorContainer:{padding:16,alignItems:'center',gap:8},extractionErrorText:{fontSize:14,textAlign:'center'},helpText:{fontSize:13,lineHeight:18}});
