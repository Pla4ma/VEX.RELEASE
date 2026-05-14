import React from'react';import{View,Text,Pressable}from'react-native';import{createSheet}from'@/shared/ui/create-sheet';interface DegradedFeature{name:string;available:boolean;reason?:string;}interface SessionDegradedStateProps{reason:string;features:DegradedFeature[];onContinueAnyway?:()=>void;onRetryFullMode?:()=>void;onEndSession?:()=>void;}export const SessionDegradedState:React.FC<SessionDegradedStateProps>=({reason,features,onContinueAnyway,onRetryFullMode,onEndSession})=>{const availableCount=features.filter(f=>f.available).length;const totalCount=features.length;return<View style={styles.container}>
      <View style={styles.warningBanner}>
        <Text style={styles.warningIcon}>⚡</Text>
        <Text style={styles.warningText}>Limited Mode</Text>
      </View>

      <Text style={styles.title}>Session Degraded</Text>
      <Text style={styles.reason}>{reason}</Text>

      {}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>
          Features ({availableCount}/{totalCount} available):
        </Text>
        {features.map((feature,index)=><View key={index}style={styles.featureRow}>
            <Text style={styles.featureIcon}>
              {feature.available?'✅':'❌'}
            </Text>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureName,!feature.available&&styles.featureUnavailable]}>
                {feature.name}
              </Text>
              {!feature.available&&feature.reason&&<Text style={styles.featureReason}>{feature.reason}</Text>}
            </View>
          </View>)}
      </View>

      {}
      <View style={styles.actions}>
        {onRetryFullMode&&<Pressable style={({pressed})=>[styles.primaryButton,pressed&&{opacity:0.8}]}onPress={onRetryFullMode}accessibilityLabel="🔄 Retry Full Mode button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={styles.primaryButtonText}>🔄 Retry Full Mode</Text>
          </Pressable>}

        {onContinueAnyway&&<Pressable style={({pressed})=>[styles.secondaryButton,pressed&&{opacity:0.8}]}onPress={onContinueAnyway}accessibilityLabel="Continue in Limited Mode button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={styles.secondaryButtonText}>
              Continue in Limited Mode
            </Text>
          </Pressable>}

        {onEndSession&&<Pressable style={({pressed})=>[styles.endButton,pressed&&{opacity:0.8}]}onPress={onEndSession}accessibilityLabel="End Session button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={styles.endButtonText}>End Session</Text>
          </Pressable>}
      </View>

      {}
      <View style={styles.explanation}>
        <Text style={styles.explanationTitle}>What does this mean?</Text>
        <Text style={styles.explanationText}>
          Your session is still running, but some features are temporarily unavailable.
          Your progress is still being tracked and will sync once full service is restored.
        </Text>
      </View>
    </View>;};const styles=createSheet({container:{flex:1,backgroundColor:'#1a1a2e',padding:24},warningBanner:{flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'#FFA500',paddingVertical:12,borderRadius:8,marginBottom:24},warningIcon:{fontSize:20,marginRight:8},warningText:{color:'#000',fontSize:16,fontWeight:'700'},title:{fontSize:24,fontWeight:'700',color:'#fff',textAlign:'center',marginBottom:8},reason:{fontSize:14,color:'#9E9E9E',textAlign:'center',marginBottom:24},featuresContainer:{backgroundColor:'#2a2a3e',borderRadius:12,padding:16,marginBottom:24},featuresTitle:{fontSize:14,fontWeight:'600',color:'#9E9E9E',marginBottom:12,textTransform:'uppercase'},featureRow:{flexDirection:'row',alignItems:'flex-start',paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#3a3a4e'},featureIcon:{fontSize:16,marginRight:12,marginTop:2},featureInfo:{flex:1},featureName:{fontSize:15,color:'#fff'},featureUnavailable:{color:'#9E9E9E',textDecorationLine:'line-through'},featureReason:{fontSize:12,color:'#FFA500',marginTop:2},actions:{gap:12,marginBottom:24},primaryButton:{backgroundColor:'#e94560',paddingVertical:16,borderRadius:12,alignItems:'center'},primaryButtonText:{color:'#fff',fontSize:16,fontWeight:'600'},secondaryButton:{backgroundColor:'transparent',borderWidth:1,borderColor:'#9E9E9E',paddingVertical:16,borderRadius:12,alignItems:'center'},secondaryButtonText:{color:'#9E9E9E',fontSize:16,fontWeight:'600'},endButton:{paddingVertical:12,alignItems:'center'},endButtonText:{color:'#e94560',fontSize:14},explanation:{backgroundColor:'rgba(255, 165, 0, 0.1)',borderRadius:12,padding:16,borderWidth:1,borderColor:'rgba(255, 165, 0, 0.3)'},explanationTitle:{fontSize:14,fontWeight:'600',color:'#FFA500',marginBottom:8},explanationText:{fontSize:13,color:'#9E9E9E',lineHeight:18}});export default SessionDegradedState;
