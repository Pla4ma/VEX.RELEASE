import React,{useState}from'react'; import{View,Text,Pressable,Modal}from'react-native'; import{createSheet}from'@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
 interface SessionControlsProps{isActive:boolean;isPaused:boolean;onStart:()=>void;onPause:()=>void;onResume:()=>void;onAbandon:()=>void;disabled?:boolean;}export const SessionControls:React.FC<SessionControlsProps> = ({isActive,isPaused,onStart,onPause,onResume,onAbandon,disabled = false})=>{const[showConfirmAbandon,setShowConfirmAbandon] = useState(false); const handleAbandon = ()=>{setShowConfirmAbandon(false); onAbandon();}; if(!isActive){return<View style={styles.container}>
        <Pressable style={({pressed})=>[styles.button,styles.startButton,disabled && styles.disabled,pressed && {opacity:0.8}]}onPress={onStart}disabled={disabled}accessibilityLabel="▶ Start Session button"accessibilityRole="button"accessibilityHint="Activates this control">
          <Text style={styles.buttonText}>▶ Start Session</Text>
        </Pressable>
      </View>;}return<View style={styles.container}>
      <View style={styles.row}>
        {isPaused ? <Pressable style={({pressed})=>[styles.button,styles.resumeButton,pressed && {opacity:0.8}]}onPress={onResume}accessibilityLabel="▶ Resume button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={styles.buttonText}>▶ Resume</Text>
          </Pressable> : <Pressable style={({pressed})=>[styles.button,styles.pauseButton,pressed && {opacity:0.8}]}onPress={onPause}accessibilityLabel="⏸ Pause button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={styles.buttonText}>⏸ Pause</Text>
          </Pressable>}

        <Pressable style={({pressed})=>[styles.button,styles.abandonButton,pressed && {opacity:0.8}]}onPress={()=>setShowConfirmAbandon(true)}accessibilityLabel="✕ Abandon button"accessibilityRole="button"accessibilityHint="Activates this control">
          <Text style={styles.buttonText}>✕ Abandon</Text>
        </Pressable>
      </View>

      {}
      <Modal visible={showConfirmAbandon}transparent animationType="fade"onRequestClose={()=>setShowConfirmAbandon(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Abandon Session?</Text>
            <Text style={styles.modalText}>
              This will count as a failed session and may affect your streak. Are you sure?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable style={({pressed})=>[styles.modalButton,styles.cancelButton,pressed && {opacity:0.8}]}onPress={()=>setShowConfirmAbandon(false)}accessibilityLabel="Continue Session button"accessibilityRole="button"accessibilityHint="Activates this control">
                <Text style={styles.cancelButtonText}>Continue Session</Text>
              </Pressable>
              <Pressable style={({pressed})=>[styles.modalButton,styles.confirmAbandonButton,pressed && {opacity:0.8}]}onPress={handleAbandon}accessibilityLabel="Yes, Abandon button"accessibilityRole="button"accessibilityHint="Activates this control">
                <Text style={styles.buttonText}>Yes, Abandon</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>;}; const styles = createSheet({container:{padding:16},row:{flexDirection:'row',justifyContent:'space-between',gap:12},button:{flex:1,paddingVertical:16,borderRadius:12,alignItems:'center',justifyContent:'center'},startButton:{backgroundColor:launchColors.hex_4caf50},resumeButton:{backgroundColor:launchColors.hex_4caf50},pauseButton:{backgroundColor:launchColors.hex_ffa500},abandonButton:{backgroundColor:launchColors.hex_e94560},disabled:{opacity:0.5},buttonText:{color:launchColors.hex_fff,fontSize:16,fontWeight:'600'},modalOverlay:{flex:1,backgroundColor:launchColors.rgb_0_0_0_0_7,justifyContent:'center',alignItems:'center',padding:24},modalContent:{backgroundColor:launchColors.hex_1a1a2e,borderRadius:16,padding:24,width:'100%',maxWidth:400},modalTitle:{fontSize:20,fontWeight:'700',color:launchColors.hex_e94560,marginBottom:12,textAlign:'center'},modalText:{fontSize:16,color:launchColors.hex_9e9e9e,textAlign:'center',marginBottom:24,lineHeight:22},modalButtons:{flexDirection:'column',gap:12},modalButton:{paddingVertical:14,borderRadius:8,alignItems:'center'},cancelButton:{backgroundColor:'transparent',borderWidth:1,borderColor:launchColors.hex_4caf50},cancelButtonText:{color:launchColors.hex_4caf50,fontSize:16,fontWeight:'600'},confirmAbandonButton:{backgroundColor:launchColors.hex_e94560}}); export default SessionControls;
