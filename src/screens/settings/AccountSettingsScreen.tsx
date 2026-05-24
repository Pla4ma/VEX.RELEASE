import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React,{useState,useCallback}from'react'; import{ScrollView,Pressable,Switch,Alert,TextInput}from'react-native'; import{useSafeAreaInsets}from'react-native-safe-area-context'; import type{NativeStackScreenProps}from'@react-navigation/native-stack'; import{useTheme}from'../../theme'; import{Box,Text,Card}from'../../components/primitives'; import{Icon}from'../../icons'; import{useAuthStore,useUIStore}from'../../store/index'; import type{SettingsStackParams}from'../../navigation';
import { launchColors } from '@theme/tokens/launch-colors';
 type Props=NativeStackScreenProps<SettingsStackParams,'AccountSettings'>;export const AccountSettingsScreen:React.FC<Props> = ({navigation})=>{const{theme} = useTheme(); const insets = useSafeAreaInsets(); const{user} = useAuthStore(); const{showToast} = useUIStore(); const[twoFactorEnabled,setTwoFactorEnabled] = useState(false); const[currentPassword,setCurrentPassword] = useState(''); const[newPassword,setNewPassword] = useState(''); const[confirmPassword,setConfirmPassword] = useState(''); const[showPasswordFields,setShowPasswordFields] = useState(false); const[isChangingPassword,setIsChangingPassword] = useState(false); const handleTwoFactorToggle = useCallback(()=>{if(!twoFactorEnabled){Alert.alert('Enable Two-Factor Authentication?','You will need an authenticator app like Google Authenticator or Authy.',[{text:'Cancel',style:'cancel'},{text:'Enable',onPress:()=>{setTwoFactorEnabled(true); showToast({message:'2FA enabled. Please set up in your authenticator app.',type:'success',duration:5000});}}]);}else{Alert.alert('Disable Two-Factor Authentication?','This makes your account less secure. Are you sure?',[{text:'Cancel',style:'cancel'},{text:'Disable',style:'destructive',onPress:()=>{setTwoFactorEnabled(false); showToast({message:'2FA has been disabled',type:'warning',duration:3000});}}]);}},[twoFactorEnabled,showToast]); const handleChangePassword = useCallback(async()=>{if(!currentPassword || !newPassword || !confirmPassword){showToast({message:'Please fill in all password fields',type:'error',duration:3000}); return;}if(newPassword !== confirmPassword){showToast({message:'New passwords do not match',type:'error',duration:3000}); return;}if(newPassword.length < 8){showToast({message:'Password must be at least 8 characters',type:'error',duration:3000}); return;}setIsChangingPassword(true); await new Promise(resolve=>setTimeout(resolve,1500)); setIsChangingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setShowPasswordFields(false); showToast({message:'Password changed successfully',type:'success',duration:3000});},[currentPassword,newPassword,confirmPassword,showToast]); const handleChangeEmail = useCallback(()=>{Alert.alert('Change Email Address','A verification link will be sent to your new email address.',[{text:'Cancel',style:'cancel'},{text:'Continue',onPress:()=>{showToast({message:'Email change flow started',type:'info',duration:3000});}}]);},[showToast]); return<Box flex={1}style={{backgroundColor:theme.colors.background.primary}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <Box px={20}pb={16}pt={insets.top + 16}flexDirection="row"alignItems="center">
          <Pressable onPress={()=>navigation.goBack()}style={{marginRight:12}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
            <Icon name="arrow-left"size={24}color={theme.colors.text.primary}/>
          </Pressable>
          <Text variant="h2">Account</Text>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            EMAIL ADDRESS
          </Text>
          <Card size="sm"style={{overflow:'hidden'}}>
            <Box p={16}>
              <Text variant="body"color="text.secondary"style={{marginBottom:4}}>
                Current Email
              </Text>
              <Text variant="body"style={{fontWeight:'500',marginBottom:12}}>
                {user?.email || 'user@example.com'}
              </Text>
              <Pressable onPress={handleChangeEmail}style={{backgroundColor:theme.colors.primary[500],paddingVertical:12,paddingHorizontal:16,borderRadius:8,alignItems:'center'}}accessibilityLabel="Change Email button"accessibilityRole="button"accessibilityHint="Activates this control">
                <Text style={{color:launchColors.hex_fff,fontWeight:'600'}}>Change Email</Text>
              </Pressable>
            </Box>
          </Card>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            SECURITY
          </Text>
          <Card size="sm"style={{overflow:'hidden'}}>
            <Pressable style={{flexDirection:'row',alignItems:'center',paddingVertical:16,paddingHorizontal:16}}onPress={handleTwoFactorToggle}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
              <Box width={40}height={40}borderRadius={10}justifyContent="center"alignItems="center"style={{backgroundColor:twoFactorEnabled ? theme.colors.success[50] || launchColors.hex_ecfdf5 : theme.colors.background.secondary}}>
                <Icon name="shield"size={20}color={twoFactorEnabled ? theme.colors.success.DEFAULT : theme.colors.text.tertiary}/>
              </Box>

              <Box flex={1}ml={12}>
                <Text variant="body"style={{fontWeight:'500',color:theme.colors.text.primary}}>
                  Two-Factor Authentication
                </Text>
                <Text variant="caption"color="text.secondary"style={{marginTop:2}}>
                  {twoFactorEnabled ? 'Enabled' : 'Add extra security'}
                </Text>
              </Box>

              <Switch value={twoFactorEnabled}onValueChange={handleTwoFactorToggle}trackColor={{false:theme.colors.background.tertiary,true:theme.colors.success.DEFAULT + '80'}}thumbColor={twoFactorEnabled ? theme.colors.success.DEFAULT : launchColors.hex_fff}/>
            </Pressable>
          </Card>
        </Box>

        {}
        <Box px={16}mb={24}>
          <Text variant="caption"color="text.secondary"style={{marginLeft:12,marginBottom:8,fontWeight:'600',letterSpacing:0.5}}>
            PASSWORD
          </Text>
          <Card size="sm"style={{overflow:'hidden'}}>
            {!showPasswordFields ? <Pressable onPress={()=>setShowPasswordFields(true)}style={{flexDirection:'row',alignItems:'center',paddingVertical:16,paddingHorizontal:16}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                <Box width={40}height={40}borderRadius={10}justifyContent="center"alignItems="center"style={{backgroundColor:theme.colors.background.secondary}}>
                  <Icon name="lock"size={20}color={theme.colors.text.tertiary}/>
                </Box>

                <Box flex={1}ml={12}>
                  <Text variant="body"style={{fontWeight:'500',color:theme.colors.text.primary}}>
                    Change Password
                  </Text>
                  <Text variant="caption"color="text.secondary"style={{marginTop:2}}>
                    Update your account password
                  </Text>
                </Box>

                <Icon name="arrow-right"size={20}color={theme.colors.text.tertiary}/>
              </Pressable> : <Box p={16}>
                <Text variant="body"style={{fontWeight:'600',marginBottom:16,color:theme.colors.text.primary}}>
                  Change Password
                </Text>

                <Box mb={12}>
                  <Text variant="caption"color="text.secondary"style={{marginBottom:4}}>
                    Current Password
                  </Text>
                  <TextInput value={currentPassword}onChangeText={setCurrentPassword}placeholder="Enter current password"secureTextEntry maxLength={128}style={{backgroundColor:theme.colors.background.secondary,padding:12,borderRadius:8,borderWidth:1,borderColor:theme.colors.border.light,color:theme.colors.text.primary}}placeholderTextColor={theme.colors.text.tertiary}/>
                </Box>

                <Box mb={12}>
                  <Text variant="caption"color="text.secondary"style={{marginBottom:4}}>
                    New Password
                  </Text>
                  <TextInput value={newPassword}onChangeText={setNewPassword}placeholder="Enter new password"secureTextEntry maxLength={128}style={{backgroundColor:theme.colors.background.secondary,padding:12,borderRadius:8,borderWidth:1,borderColor:theme.colors.border.light,color:theme.colors.text.primary}}placeholderTextColor={theme.colors.text.tertiary}/>
                </Box>

                <Box mb={16}>
                  <Text variant="caption"color="text.secondary"style={{marginBottom:4}}>
                    Confirm New Password
                  </Text>
                  <TextInput value={confirmPassword}onChangeText={setConfirmPassword}placeholder="Confirm new password"secureTextEntry maxLength={128}style={{backgroundColor:theme.colors.background.secondary,padding:12,borderRadius:8,borderWidth:1,borderColor:theme.colors.border.light,color:theme.colors.text.primary}}placeholderTextColor={theme.colors.text.tertiary}/>
                </Box>

                <Box flexDirection="row">
                  <Pressable onPress={()=>setShowPasswordFields(false)}style={{flex:1,backgroundColor:theme.colors.background.secondary,paddingVertical:12,borderRadius:8,alignItems:'center',marginRight:8,borderWidth:1,borderColor:theme.colors.border.light}}accessibilityLabel="Cancel button"accessibilityRole="button"accessibilityHint="Activates this control">
                    <Text style={{color:theme.colors.text.primary,fontWeight:'600'}}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable onPress={handleChangePassword}disabled={isChangingPassword}style={{flex:1,backgroundColor:theme.colors.primary[500],paddingVertical:12,borderRadius:8,alignItems:'center',marginLeft:8,opacity:isChangingPassword ? 0.7 : 1}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
                    <Text style={{color:launchColors.hex_fff,fontWeight:'600'}}>
                      {isChangingPassword ? 'Changing...' : 'Change'}
                    </Text>
                  </Pressable>
                </Box>
              </Box>}
          </Card>
        </Box>

        <Box height={insets.bottom + 20}/>
      </ScrollView>
    </Box>;}; export default withScreenErrorBoundary(AccountSettingsScreen, 'AccountSettings');
