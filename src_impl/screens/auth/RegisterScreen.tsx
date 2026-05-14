import{captureSilentFailure}from'../../utils/silent-failure';import React,{useState,useCallback,useRef}from'react';import{KeyboardAvoidingView,Platform,ScrollView,View,Pressable}from'react-native';import{useSafeAreaInsets}from'react-native-safe-area-context';import type{NativeStackScreenProps}from'@react-navigation/native-stack';import Animated,{FadeInDown}from'react-native-reanimated';import{useTheme}from'../../theme';import{Box,Text}from'../../components/primitives';import{Button}from'../../components';import{Icon}from'../../icons';import{FormField}from'../../shared/ui/components/FormField';import{useToast}from'../../shared/ui/components/Toast';import{useAuthStore}from'../../store/index';import{registerSchema,type RegisterFormData}from'../../validation';import type{AuthStackParams}from'../../navigation';import{scheduleOnboardingNotifications}from'../../features/notifications/retention-strategy';type Props=NativeStackScreenProps<AuthStackParams,'Register'>;const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;export const RegisterScreen:React.FC<Props>=({navigation})=>{const{theme}=useTheme();const insets=useSafeAreaInsets();const{register,isLoading}=useAuthStore();const{show:showToast}=useToast();const[firstName,setFirstName]=useState('');const[lastName,setLastName]=useState('');const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[confirmPassword,setConfirmPassword]=useState('');const[agreeToTerms,setAgreeToTerms]=useState(false);const[errors,setErrors]=useState<Partial<Record<keyof RegisterFormData,string>>>({});const[touched,setTouched]=useState<Record<string,boolean>>({});const validateEmail=useCallback((value:string)=>{if(!value){return'Email is required';}if(!emailRegex.test(value)){return'Please enter a valid email';}return undefined;},[]);const validatePasswordMatch=useCallback(()=>{if(confirmPassword&&password!==confirmPassword){setErrors(prev=>({...prev,confirmPassword:"Passwords don't match"}));}else{setErrors(prev=>({...prev,confirmPassword:undefined}));}},[password,confirmPassword]);const handleBlur=useCallback((field:keyof RegisterFormData)=>{setTouched(prev=>({...prev,[field]:true}));if(field==='email'){const emailError=validateEmail(email);if(emailError){setErrors(prev=>({...prev,email:emailError}));}}if(field==='confirmPassword'||field==='password'){validatePasswordMatch();}},[email,validateEmail,validatePasswordMatch]);const handleRegister=useCallback(async()=>{if(!agreeToTerms){showToast({type:'error',title:'Terms required',message:'Please agree to the Terms of Service',duration:3000});return;}const formData:RegisterFormData&{agreeToTerms:boolean;}={firstName,lastName,email,password,confirmPassword,agreeToTerms};const result=registerSchema.safeParse(formData);if(!result.success){const fieldErrors:Partial<Record<keyof RegisterFormData,string>>={};result.error.errors.forEach(err=>{const path=err.path[0]as keyof RegisterFormData;fieldErrors[path]=err.message;});setErrors(fieldErrors);return;}const success=await register(formData);if(!success){showToast({type:'error',title:'Registration failed',message:'Could not create account. Please try again.',duration:4000});return;}const createdUser=useAuthStore.getState().user;if(createdUser?.id){try{await scheduleOnboardingNotifications(createdUser.id);}catch(error){captureSilentFailure(error,{feature:'screens',operation:'ui-fallback',type:'ui'});}}},[firstName,lastName,email,password,confirmPassword,agreeToTerms,register,showToast]);const handleLogin=useCallback(()=>{navigation.navigate({name:'Login',params:{}});},[navigation]);return<KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'}style={{flex:1,backgroundColor:theme.colors.background.primary}}>
      <ScrollView contentContainerStyle={{flexGrow:1,paddingBottom:insets.bottom+20}}keyboardShouldPersistTaps="handled">
        <Box flex={1}justifyContent="center"px="xl"py="2xl">
          {}
          <Animated.View entering={FadeInDown.delay(0).duration(600)}>
            <Text variant="h1"textAlign="center"mb="xs">
              Create Account
            </Text>
            <Text variant="body"color="text.secondary"textAlign="center"mb="2xl">
              Join VEX and start your journey
            </Text>
          </Animated.View>

          {}
          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <Box flexDirection="row"gap="md">
              <Box flex={1}>
                <FormField label="First Name"value={firstName}onChangeText={value=>{setFirstName(value);if(errors.firstName){setErrors(prev=>({...prev,firstName:undefined}));}}}placeholder="John"leftIcon="user"size="lg"error={errors.firstName}autoComplete="given-name"returnKeyType="next"/>
              </Box>
              <Box flex={1}>
                <FormField label="Last Name"value={lastName}onChangeText={value=>{setLastName(value);if(errors.lastName){setErrors(prev=>({...prev,lastName:undefined}));}}}placeholder="Doe"leftIcon="user"size="lg"error={errors.lastName}autoComplete="family-name"returnKeyType="next"/>
              </Box>
            </Box>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <FormField label="Email"value={email}onChangeText={value=>{setEmail(value);if(errors.email){setErrors(prev=>({...prev,email:undefined}));}}}onBlur={()=>handleBlur('email')}placeholder="you@example.com"keyboardType="email-address"autoCapitalize="none"autoComplete="email"leftIcon="email"size="lg"error={touched.email?errors.email:undefined}returnKeyType="next"containerStyle={{marginTop:12}}/>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <FormField label="Password"value={password}onChangeText={value=>{setPassword(value);if(errors.password){setErrors(prev=>({...prev,password:undefined}));}}}onBlur={()=>handleBlur('password')}placeholder="Create a password"secureTextEntry leftIcon="lock"size="lg"error={errors.password}helperText="Use 8+ characters with a number"returnKeyType="next"containerStyle={{marginTop:12}}/>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <FormField label="Confirm Password"value={confirmPassword}onChangeText={value=>{setConfirmPassword(value);if(errors.confirmPassword){setErrors(prev=>({...prev,confirmPassword:undefined}));}}}onBlur={()=>handleBlur('confirmPassword')}placeholder="Confirm your password"secureTextEntry leftIcon="lock"size="lg"error={errors.confirmPassword}returnKeyType="done"onSubmitEditing={handleRegister}containerStyle={{marginTop:12}}/>
          </Animated.View>

          {}
          <Animated.View entering={FadeInDown.delay(500).duration(600)}>
            <Pressable onPress={()=>setAgreeToTerms(prev=>!prev)}style={{flexDirection:'row',alignItems:'center',gap:12,marginTop:16,marginBottom:24}}accessibilityLabel="Interactive control"accessibilityRole="button"accessibilityHint="Activates this control">
              <View style={{width:22,height:22,borderRadius:6,borderWidth:2,borderColor:agreeToTerms?theme.colors.primary[500]:theme.colors.border.DEFAULT,backgroundColor:agreeToTerms?theme.colors.primary[500]:'transparent',justifyContent:'center',alignItems:'center'}}>
                {agreeToTerms&&<Icon name="check"size={14}color="#FFF"/>}
              </View>
              <Text variant="bodySmall"color="text.secondary"style={{flex:1}}>
                I agree to the Terms of Service and Privacy Policy
              </Text>
            </Pressable>
          </Animated.View>

          {}
          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <Button variant="primary"size="lg"onPress={handleRegister}isLoading={isLoading}disabled={isLoading}fullWidth accessibilityLabel="Create Account button"accessibilityRole="button"accessibilityHint="Activates this control">
              Create Account
            </Button>

            <Box flexDirection="row"justifyContent="center"mt="lg"gap="xs">
              <Text variant="body"color="text.secondary">
                Already have an account?
              </Text>
              <Pressable onPress={handleLogin}accessibilityRole="link"accessibilityLabel="Sign In button"accessibilityHint="Activates this control">
                <Text variant="body"color="primary.500">
                  Sign In
                </Text>
              </Pressable>
            </Box>
          </Animated.View>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>;};export default RegisterScreen;
