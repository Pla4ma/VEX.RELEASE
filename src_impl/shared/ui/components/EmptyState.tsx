import React from'react';import{View,ViewStyle}from'react-native';import{useReducedMotion}from'react-native-reanimated';import{useTheme}from'../../../theme';import{Text}from'../../../components/primitives';import{Button}from'../../../components';import{EnterAnimation}from'./EnterAnimation';import{createSheet}from'@/shared/ui/create-sheet';export interface EmptyStateProps{icon?:React.ReactNode|string;title:string;description?:string;actionLabel?:string;onAction?:()=>void;secondaryLabel?:string;onSecondary?:()=>void;style?:ViewStyle;testID?:string;variant?:'default'|'first-use'|'error'|'offline';featureName?:string;}const PRESETS={inventory:{icon:'📦',title:'Your inventory is empty',description:'Complete sessions to earn rewards and items.',actionLabel:'Start a Session'},feed:{icon:'📰',title:'No activity yet',description:'Your squad\'s activity will appear here.',actionLabel:'Invite Friends'},leaderboards:{icon:'🏆',title:'Leaderboard empty',description:'Complete this week\'s challenge to appear here.',actionLabel:'View Challenge'},challenges:{icon:'🎯',title:'No active challenges',description:'Daily and weekly challenges reset soon.',actionLabel:'Browse All'},shop:{icon:'🛍️',title:'Shop empty',description:'New items arrive weekly. Check back soon!',actionLabel:'View Featured'},squadWars:{icon:'⚔️',title:'No active wars',description:'Join a squad to participate in weekly wars.',actionLabel:'Find a Squad'},offline:{icon:'📡',title:'You\'re offline',description:'Some features are unavailable. We\'ll sync when you reconnect.',variant:'offline'as const},error:{icon:'⚠️',title:'Something went wrong',description:'We couldn\'t load this content. Try again in a moment.',variant:'error'as const,actionLabel:'Try Again'}};export const EmptyState:React.FC<EmptyStateProps>=({icon,title,description,actionLabel,onAction,secondaryLabel,onSecondary,style,testID,variant='default',featureName})=>{const{theme}=useTheme();const reducedMotion=useReducedMotion();const iconContent=typeof icon==='string'?<Text style={[styles.icon,{fontSize:variant==='first-use'?80:64}]}>
      {icon}
    </Text>:icon;return<EnterAnimation direction="up"speed={reducedMotion?'instant':'normal'}>
      <View style={[styles.container,style]}>
      <View style={styles.content}testID={testID}>
        {}
        <View style={styles.iconContainer}>
          {iconContent||<View style={[styles.placeholderIcon,{backgroundColor:theme.colors.border.DEFAULT}]}/>}
        </View>

        {}
        <Text variant={variant==='first-use'?'h2':'h3'}style={styles.title}textAlign="center"accessibilityRole="header">
          {title}
        </Text>

        {}
        {description&&<Text variant="body"style={[styles.description,{color:theme.colors.text.secondary}]}textAlign="center">
            {description}
          </Text>}

        {}
        {variant==='first-use'&&featureName&&<Text variant="caption"style={styles.featureContext}textAlign="center">
            {featureName} unlocks after your first focus session
          </Text>}

        {}
        <View style={styles.actions}>
          {actionLabel&&onAction&&<Button variant="primary"onPress={onAction}style={styles.primaryAction}accessibilityLabel="Action button"accessibilityRole="button"accessibilityHint="Activates this control">
              {actionLabel}
            </Button>}

          {secondaryLabel&&onSecondary&&<Button variant="ghost"onPress={onSecondary}style={styles.secondaryAction}accessibilityLabel="Action button"accessibilityRole="button"accessibilityHint="Activates this control">
              {secondaryLabel}
            </Button>}
        </View>

        {}
        {variant==='offline'&&<View style={[styles.offlineBadge,{backgroundColor:theme.colors.warning.light}]}>
            <Text variant="caption"style={{color:theme.colors.warning.DEFAULT}}>
              ● Offline Mode
            </Text>
          </View>}
      </View>
    </View>
    </EnterAnimation>;};export const InventoryEmptyState:React.FC<Omit<EmptyStateProps,'icon'|'title'|'description'>>=props=><EmptyState{...PRESETS.inventory}{...props}/>;export const FeedEmptyState:React.FC<Omit<EmptyStateProps,'icon'|'title'|'description'>>=props=><EmptyState{...PRESETS.feed}{...props}/>;export const LeaderboardEmptyState:React.FC<Omit<EmptyStateProps,'icon'|'title'|'description'>>=props=><EmptyState{...PRESETS.leaderboards}{...props}/>;export const ChallengeEmptyState:React.FC<Omit<EmptyStateProps,'icon'|'title'|'description'>>=props=><EmptyState{...PRESETS.challenges}{...props}/>;export const ShopEmptyState:React.FC<Omit<EmptyStateProps,'icon'|'title'|'description'>>=props=><EmptyState{...PRESETS.shop}{...props}/>;export const SquadWarsEmptyState:React.FC<Omit<EmptyStateProps,'icon'|'title'|'description'>>=props=><EmptyState{...PRESETS.squadWars}{...props}/>;export const OfflineEmptyState:React.FC<Omit<EmptyStateProps,'icon'|'title'|'description'|'variant'>>=props=><EmptyState{...PRESETS.offline}{...props}/>;export const ErrorEmptyState:React.FC<Omit<EmptyStateProps,'icon'|'title'|'description'|'variant'>>=props=><EmptyState{...PRESETS.error}{...props}/>;const styles=createSheet({container:{flex:1,justifyContent:'center',alignItems:'center',padding:24},content:{alignItems:'center',maxWidth:320},iconContainer:{marginBottom:24},icon:{textAlign:'center'},placeholderIcon:{width:80,height:80,borderRadius:40},title:{marginBottom:12},description:{marginBottom:24,lineHeight:22},featureContext:{marginBottom:24,fontStyle:'italic'},actions:{flexDirection:'column',gap:12,width:'100%'},primaryAction:{minWidth:200},secondaryAction:{minWidth:200},offlineBadge:{marginTop:16,paddingHorizontal:12,paddingVertical:6,borderRadius:16}});export default EmptyState;
