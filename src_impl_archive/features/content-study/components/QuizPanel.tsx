import React,{useState,useCallback,useMemo}from'react'; import{View,Pressable,TextInput,StyleSheet,ScrollView}from'react-native'; import{Text}from'../../../components/primitives/Text'; import{Button}from'../../../components/primitives/Button'; import{useTheme}from'../../../theme'; import{Icon}from'../../../icons'; import type{QuizPanelProps,QuizItem}from'../types'; import{QUIZ_DIFFICULTY_CONFIG}from'../constants'; import{createSheet}from'@/shared/ui/create-sheet'; export const QuizPanel:React.FC<QuizPanelProps> = ({items,answers,activeId,onAnswer,onRevealAnswer,showResults = false,score,readOnly = false})=>{const{theme} = useTheme(); const[revealedIds,setRevealedIds] = useState<Set<string>>(new Set()); const[shortAnswers,setShortAnswers] = useState<Record<string,string>>({}); const handleOptionSelect = useCallback((quizId:string,option:string)=>{if(readOnly || answers[quizId]){return;}onAnswer(quizId,option);},[answers,onAnswer,readOnly]); const handleShortAnswerSubmit = useCallback((quizId:string)=>{const answer = shortAnswers[quizId]?.trim(); if(!answer || readOnly){return;}onAnswer(quizId,answer);},[shortAnswers,onAnswer,readOnly]); const handleReveal = useCallback((quizId:string)=>{setRevealedIds(prev=>new Set([...prev,quizId])); onRevealAnswer(quizId);},[onRevealAnswer]); const calculateScore = useMemo(()=>{if(!showResults || !score){return null;}return{percentage:Math.round(score.correct / score.total * 100),correct:score.correct,total:score.total};},[showResults,score]); return<View style={styles.container}>
      {}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Icon name="help-circle"size="sm"color={theme.colors.primary[500]}/>
          <Text style={[styles.title,{color:theme.colors.text.primary}]}>
            Quick Quiz ({Object.keys(answers).length}/{items.length})
          </Text>
        </View>

        {calculateScore && <View style={[styles.scoreBadge,{backgroundColor:calculateScore.percentage >= 70 ? theme.colors.success[500] : calculateScore.percentage >= 40 ? theme.colors.warning[500] : theme.colors.error[500]}]}>
            <Text style={[styles.scoreText,{color:theme.colors.background.primary}]}>{calculateScore.percentage}%</Text>
          </View>}
      </View>

      {}
      <ScrollView style={styles.quizList}showsVerticalScrollIndicator={false}>
        {items.map((quiz,index)=>{const answer = answers[quiz.id]; const isAnswered = !!answer; const isRevealed = revealedIds.has(quiz.id); const isActive = activeId === quiz.id; const isCorrect = answer?.isCorrect; const difficultyConfig = QUIZ_DIFFICULTY_CONFIG[quiz.difficulty]; return<View key={quiz.id}style={[styles.quizCard,{backgroundColor:isAnswered ? isCorrect ? theme.colors.success[50] : theme.colors.error[50] : isActive ? theme.colors.primary[50] : theme.colors.background.secondary,borderColor:isActive ? theme.colors.primary[500] : isAnswered ? isCorrect ? theme.colors.success[500] : theme.colors.error[500] : theme.colors.border.DEFAULT}]}>
              {}
              <View style={styles.questionHeader}>
                <Text style={[styles.questionNumber,{color:theme.colors.text.muted}]}>Q{index + 1}</Text>
                <View style={[styles.difficultyBadge,{backgroundColor:difficultyConfig.color}]}>
                  <Text style={[styles.difficultyText,{color:difficultyConfig.textColor}]}>{difficultyConfig.label}</Text>
                </View>
                {quiz.conceptTag && <View style={styles.conceptTag}>
                    <Text style={[styles.conceptText,{color:theme.colors.text.muted}]}>{quiz.conceptTag}</Text>
                  </View>}
              </View>

              {}
              <Text style={[styles.question,{color:theme.colors.text.primary}]}>{quiz.question}</Text>

              {}
              {quiz.options && quiz.options.length > 0 && <View style={styles.optionsContainer}>
                  {quiz.options.map((option,optIndex)=>{const isSelected = answer?.answer === option; const showCorrectness = isAnswered || isRevealed; const isCorrectOption = option === quiz.answer; return<Pressable key={optIndex}style={({pressed})=>[styles.optionButton,{backgroundColor:showCorrectness ? isCorrectOption ? theme.colors.success[500] : isSelected ? theme.colors.error[500] : theme.colors.background.secondary : isSelected ? theme.colors.primary[500] : theme.colors.background.secondary,borderColor:showCorrectness ? isCorrectOption ? theme.colors.success[500] : isSelected ? theme.colors.error[500] : theme.colors.border.DEFAULT : isSelected ? theme.colors.primary[500] : theme.colors.border.DEFAULT,opacity:pressed && !isAnswered && !readOnly ? 0.8 : 1}]}onPress={()=>handleOptionSelect(quiz.id,option)}disabled={isAnswered || readOnly}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                        <Text style={[styles.optionText,{color:showCorrectness ? isCorrectOption || isSelected ? theme.colors.background.primary : theme.colors.text.primary : isSelected ? theme.colors.background.primary : theme.colors.text.primary}]}>
                          {option}
                        </Text>
                        {showCorrectness && isCorrectOption && <Icon name="check"size="sm"color={theme.colors.background.primary}/>}
                        {showCorrectness && isSelected && !isCorrectOption && <Icon name="x"size="sm"color={theme.colors.background.primary}/>}
                      </Pressable>;})}
                </View>}

              {}
              {!quiz.options && !isAnswered && !readOnly && <View style={styles.shortAnswerContainer}>
                  <TextInput style={[styles.shortAnswerInput,{color:theme.colors.text.primary,borderColor:theme.colors.border.DEFAULT,backgroundColor:theme.colors.background.primary}]}placeholder="Type your answer..."placeholderTextColor={theme.colors.text.muted}value={shortAnswers[quiz.id] || ''}onChangeText={text=>setShortAnswers(prev=>({...prev,[quiz.id]:text}))}multiline maxLength={500}/>
                  <Button size="sm"onPress={()=>handleShortAnswerSubmit(quiz.id)}disabled={!shortAnswers[quiz.id]?.trim()}accessibilityLabel="Submit button"accessibilityRole="button"accessibilityHint="Activates this control">
                    Submit
                  </Button>
                </View>}

              {}
              {!isAnswered && !isRevealed && !readOnly && <Pressable style={({pressed})=>[styles.revealButton,pressed && {opacity:0.8}]}onPress={()=>handleReveal(quiz.id)}accessibilityLabel="Show Answer button"accessibilityRole="button"accessibilityHint="Activates this control">
                  <Text style={[styles.revealText,{color:theme.colors.primary[500]}]}>Show Answer</Text>
                </Pressable>}

              {}
              {(isRevealed || isAnswered && !isCorrect) && <View style={[styles.answerReveal,{backgroundColor:theme.colors.background.primary}]}>
                  <Text style={[styles.answerLabel,{color:theme.colors.text.muted}]}>Correct Answer:</Text>
                  <Text style={[styles.answerText,{color:theme.colors.success[500]}]}>{quiz.answer}</Text>
                </View>}

              {}
              {(isAnswered || isRevealed) && quiz.explanation && <View style={[styles.explanationContainer,{backgroundColor:theme.colors.background.primary}]}>
                  <Text style={[styles.explanationLabel,{color:theme.colors.text.muted}]}>Explanation:</Text>
                  <Text style={[styles.explanationText,{color:theme.colors.text.secondary}]}>{quiz.explanation}</Text>
                </View>}
            </View>;})}
      </ScrollView>
    </View>;}; const styles = createSheet({container:{gap:12},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},headerTitle:{flexDirection:'row',alignItems:'center',gap:8},title:{fontSize:16,fontWeight:'600'},scoreBadge:{paddingHorizontal:12,paddingVertical:6,borderRadius:16},scoreText:{fontSize:14,fontWeight:'600'},quizList:{maxHeight:500},quizCard:{padding:16,borderRadius:12,borderWidth:1,marginBottom:12,gap:12},questionHeader:{flexDirection:'row',alignItems:'center',gap:8},questionNumber:{fontSize:12,fontWeight:'500'},difficultyBadge:{paddingHorizontal:8,paddingVertical:2,borderRadius:4},difficultyText:{fontSize:11,fontWeight:'500'},conceptTag:{flex:1,alignItems:'flex-end'},conceptText:{fontSize:12},question:{fontSize:15,fontWeight:'500',lineHeight:22},optionsContainer:{gap:8},optionButton:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:12,borderRadius:8,borderWidth:1},optionText:{fontSize:14,flex:1},shortAnswerContainer:{gap:8},shortAnswerInput:{borderWidth:1,borderRadius:8,padding:12,fontSize:14,minHeight:80,textAlignVertical:'top'},revealButton:{alignSelf:'flex-start',paddingVertical:8},revealText:{fontSize:14,fontWeight:'500'},answerReveal:{padding:12,borderRadius:8,gap:4},answerLabel:{fontSize:12},answerText:{fontSize:15,fontWeight:'600'},explanationContainer:{padding:12,borderRadius:8,gap:4},explanationLabel:{fontSize:12},explanationText:{fontSize:14,lineHeight:20}});
