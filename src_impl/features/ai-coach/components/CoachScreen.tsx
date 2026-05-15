import React,{useState,useEffect,useCallback,useRef}from'react'; import{View,Text,TextInput,Pressable,ActivityIndicator,KeyboardAvoidingView,Platform,SafeAreaView,Image}from'react-native'; import{FlashList,type FlashListRef,type ListRenderItem}from'@shopify/flash-list'; import{useAnalytics}from'@/shared/analytics'; import{CoachEvents}from'@/shared/analytics/analytics-events'; import{createDebugger}from'@/utils/debug'; const debug = createDebugger('coach:screen'); import{getCurrentRecommendation}from'../services/coach-screen-service'; import type{CoachState,CoachUserState}from'../types'; import{PERSONALITY_METADATA}from'../service/personality-templates'; import{useAskCoachQuestionMutation,useCoachScreenState}from'../hooks'; import{styles}from'./CoachScreen.styles'; interface ChatMessage{id:string;type:'user'|'coach'|'system';content:string;timestamp:number;metadata?:{hasAction?:boolean;actionLabel?:string;actionData?:Record<string,unknown>;state?:CoachUserState;};}interface CoachRecommendation{duration:number;difficulty:string;reasoning:string;}export function CoachScreen():JSX.Element{const{track} = useAnalytics(); const flashListRef = useRef<FlashListRef<ChatMessage>|null>(null); const[inputText,setInputText] = useState(''); const[chatMessages,setChatMessages] = useState<ChatMessage[]>([]); const[isTyping,setIsTyping] = useState(false); const[error,setError] = useState<string|null>(null); const{coachState,coachHistory,stateLoading,historyLoading} = useCoachScreenState(); const askMutation = useAskCoachQuestionMutation({onMutate:()=>{setIsTyping(true); setError(null);},onSuccess:response=>{setIsTyping(false); const coachMsg:ChatMessage = {id:`coach-${Date.now()}`,type:'coach',content:response.message,timestamp:Date.now(),metadata:{hasAction:response.hasAction,actionLabel:response.actionLabel,actionData:response.actionData}}; setChatMessages(prev=>[...prev,coachMsg]); track(CoachEvents.COACH_QUESTION_ANSWERED,{has_action:response.hasAction}as Record<string,unknown>);},onError:message=>{setIsTyping(false); setError(message);}}); useEffect(()=>{if(coachHistory?.messages && chatMessages.length === 0){const initialMessages:ChatMessage[] = coachHistory.messages.slice(-20).map(msg=>({id:msg.id,type:(msg as unknown as{sender?:string;}).sender === 'user' ? 'user' : 'coach',content:msg.content,timestamp:msg.createdAt,metadata:(msg as unknown as{metadata?:Record<string,unknown>;}).metadata})); if(initialMessages.length === 0){initialMessages.push({id:'welcome',type:'coach',content:getWelcomeMessage(coachState),timestamp:Date.now(),metadata:{state:coachState?.currentState}});}setChatMessages(initialMessages);}},[chatMessages.length,coachHistory,coachState]); useEffect(()=>{if(chatMessages.length > 0){setTimeout(()=>{flashListRef.current?.scrollToEnd({animated:true});},100);}},[chatMessages]); const handleSend = useCallback(()=>{if(!inputText.trim()){return;}const question = inputText.trim(); const userMsg:ChatMessage = {id:`user-${Date.now()}`,type:'user',content:question,timestamp:Date.now()}; setChatMessages(prev=>[...prev,userMsg]); setInputText(''); track(CoachEvents.COACH_QUESTION_ASKED,{question:question.substring(0,50)}as Record<string,unknown>); askMutation.mutate(question);},[inputText,askMutation,track]); const handleActionPress = useCallback((message:ChatMessage)=>{if(!message.metadata?.actionData){return;}const action = message.metadata.actionData; switch(action.type){case'START_SESSION':track(CoachEvents.COACH_CTA_CLICKED,{cta_type:'start_session',session_duration:action.duration as number}); break; case'VIEW_STREAK':track(CoachEvents.COACH_CTA_CLICKED,{cta_type:'view_streak'}); break; case'VIEW_PROGRESS':track(CoachEvents.COACH_CTA_CLICKED,{cta_type:'view_progress'}); break; default:break;}},[track]); const renderMessage:ListRenderItem<ChatMessage> = useCallback(({item})=>{const isCoach = item.type === 'coach'; const isUser = item.type === 'user'; return<View style={[styles.messageContainer,isCoach ? styles.coachMessageContainer : isUser ? styles.userMessageContainer : styles.systemMessageContainer]}>
          {isCoach && <View style={styles.coachAvatar}>
              <Text style={styles.coachAvatarText}>{getPersonalityEmoji(coachState?.personaId)}</Text>
            </View>}

          <View style={[styles.messageBubble,isCoach ? styles.coachBubble : isUser ? styles.userBubble : styles.systemBubble]}>
            <Text style={[styles.messageText,isCoach ? styles.coachText : isUser ? styles.userText : styles.systemText]}>{item.content}</Text>

            {}
            {item.metadata?.hasAction && item.metadata.actionLabel && <Pressable style={({pressed})=>[styles.actionButton,pressed && {opacity:0.8}]}onPress={()=>handleActionPress(item)}accessibilityLabel="Action button"accessibilityRole="button"accessibilityHint="Activates this control">
                <Text style={styles.actionButtonText}>{item.metadata.actionLabel}</Text>
              </Pressable>}
          </View>
        </View>;},[coachState?.personaId,handleActionPress]); if(stateLoading || historyLoading){return<SafeAreaView style={styles.container}>
        <View style={{height:44}}/>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large"color="#6366f1"/>
          <Text style={styles.loadingText}>Loading your coach...</Text>
        </View>
      </SafeAreaView>;}const recommendation = coachState ? getCurrentRecommendation(coachState) : null; return<SafeAreaView style={styles.container}>
      <View style={{height:44}}/>

      {}
      <View style={styles.header}>
        <View style={styles.coachInfo}>
          <Text style={styles.coachName}>{getPersonalityName(coachState?.personaId)}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{formatState(coachState?.currentState)}</Text>
          </View>
        </View>

        {}
        <View style={styles.stateIndicator}>
          <View style={[styles.stateDot,{backgroundColor:getStateColor(coachState?.currentState)}]}/>
          <Text style={styles.stateLabel}>Active</Text>
        </View>
      </View>

      {}
      {recommendation && <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>Recommended Session</Text>
          <Text style={styles.recommendationReason}>{recommendation.reasoning}</Text>
          <Pressable style={({pressed})=>[styles.startSessionButton,pressed && {opacity:0.8}]}onPress={()=>{track(CoachEvents.COACH_CTA_CLICKED,{duration:recommendation.duration,difficulty:recommendation.difficulty,source:'coach_recommendation'});}}accessibilityLabel="Start session button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={styles.startSessionButtonText}>Start {recommendation.duration}-min Session</Text>
          </Pressable>
        </View>}

      {}
      <KeyboardAvoidingView style={styles.chatContainer}behavior={Platform.OS === 'ios' ? 'padding' : 'height'}keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlashList ref={flashListRef}data={chatMessages}renderItem={renderMessage}keyExtractor={(item:ChatMessage)=>item.id}contentContainerStyle={styles.chatContent}showsVerticalScrollIndicator={true}estimatedItemSize={80}onContentSizeChange={()=>{flashListRef.current?.scrollToEnd({animated:false});}}/>

        {}
        {isTyping && <View style={styles.typingContainer}>
            <View style={styles.coachAvatarSmall}>
              <Text style={styles.coachAvatarTextSmall}>{getPersonalityEmoji(coachState?.personaId)}</Text>
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small"color="#6366f1"/>
              <Text style={styles.typingText}>Thinking...</Text>
            </View>
          </View>}

        {}
        {error && <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={()=>setError(null)}style={({pressed})=>[pressed && {opacity:0.8}]}accessibilityLabel="Dismiss button"accessibilityRole="button"accessibilityHint="Activates this control">
              <Text style={styles.errorDismiss}>Dismiss</Text>
            </Pressable>
          </View>}

        {}
        <View style={styles.inputContainer}>
          <TextInput style={styles.input}value={inputText}onChangeText={setInputText}placeholder="Ask your coach anything..."placeholderTextColor="#9ca3af"multiline maxLength={200}onSubmitEditing={handleSend}returnKeyType="send"/>
          <Pressable style={({pressed})=>[styles.sendButton,!inputText.trim() && styles.sendButtonDisabled,pressed && {opacity:0.8}]}onPress={handleSend}disabled={!inputText.trim() || isTyping}accessibilityLabel="Send button"accessibilityRole="button"accessibilityHint="Activates this control">
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>;}function getWelcomeMessage(coachState?:CoachState|null):string{if(!coachState){return"Hi! I'm your AI coach. I'm here to help you build focus habits and achieve your goals. What would you like to work on today?";}switch(coachState.currentState){case'COLD_START':return"Welcome! I'm your AI coach. I can see you're just getting started — that's exciting! Let's build some momentum together. What brings you here today?"; case'HIGH_CONFIDENCE':return"You're on fire! 🔥 I can see your consistency is paying off. What can I help you with today?"; case'STREAK_AT_RISK':return"I noticed your streak needs attention soon. Don't worry — I've got your back. Want to protect it together?"; case'COMEBACK_MODE':return'Welcome back! 💪 Every master was once a beginner who returned. Your comeback starts now. How can I support you?'; case'POST_FAILURE_SUPPORT':return"Hey, I saw things didn't go as planned recently. That's okay — setbacks are part of growth. Let's talk about what happened and how to move forward."; default:return"Hi there! Ready to make today count? I'm here to help with sessions, streaks, or just a motivational boost.";}}function getPersonalityName(personaId?:string|null):string{if(!personaId){return'Coach';}return PERSONALITY_METADATA[personaId as keyof typeof PERSONALITY_METADATA]?.name || 'Coach';}function getPersonalityEmoji(personaId?:string|null):string{if(!personaId){return'🎯';}switch(personaId){case'DRILL_SERGEANT':return'⭐'; case'FRIEND':return'🤗'; case'MENTOR':return'📚'; case'RIVAL':return'⚡'; case'MINDFUL':return'🧘'; default:return'🎯';}}function formatState(state?:CoachUserState|null):string{if(!state){return'Ready';}const stateLabels:Record<CoachUserState,string> = {COLD_START:'Getting Started',LOW_CONFIDENCE:'Building Confidence',HIGH_CONFIDENCE:'In The Zone',STREAK_AT_RISK:'Streak Alert',COMEBACK_MODE:'Comeback',POST_FAILURE_SUPPORT:'Recovery',MILESTONE_HYPE:'Celebrating',OVERLOAD_PROTECTION:'Rest Mode',MUTED_MODE:'Quiet'}; return stateLabels[state] || 'Active';}function getStateColor(state?:CoachUserState|null):string{if(!state){return'#22c55e';}const stateColors:Record<CoachUserState,string> = {COLD_START:'#3b82f6',LOW_CONFIDENCE:'#f59e0b',HIGH_CONFIDENCE:'#22c55e',STREAK_AT_RISK:'#ef4444',COMEBACK_MODE:'#8b5cf6',POST_FAILURE_SUPPORT:'#f97316',MILESTONE_HYPE:'#ec4899',OVERLOAD_PROTECTION:'#06b6d4',MUTED_MODE:'#6b7280'}; return stateColors[state] || '#22c55e';}export default CoachScreen;
