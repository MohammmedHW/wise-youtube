import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Pressable,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
// import { RadioButton } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Auth, Users} from '../services';
import {useNavigation} from '@react-navigation/native';
import Modal from 'react-native-modal';
import {KeyboardAvoidingView} from 'react-native';
import AppLoader from '../components/AppLoader';
import AppFonts from '../utils/AppFonts';
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';
import Icon from 'react-native-vector-icons/Ionicons'; // or Feather
import AppColors from '../utils/AppColors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {getApp} from '@react-native-firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
import SubscriptionService from '../services/subscriptionService';
import {checkLoginInFirstTime, getUserByEmail} from '../services/authService';

const LoginScreen = ({onLoginSuccess, setIsLogInScreen}) => {
  console.log('TCL: LoginScreen -> onLoginSuccess', onLoginSuccess);
  const [isModalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fpemail, setFpemail] = useState('');
  const [fppassword, setFppassword] = useState('');
  const [fpconfirmpassword, setFpconfirmpassword] = useState('');
  const [fpotp, setFpotp] = useState('');
  const [loginErrors, setLoginErrors] = useState({});
  const [fpErrors, setFpErrors] = useState({});
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  let alert = _data => new Promise(res => res);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    navigation.navigate('Sign UP');
    setIsLogInScreen(false);
  };

  useEffect(() => {
    GoogleSignin.configure({
      // Replace this with your new Web Client ID from Google Cloud Console
      webClientId:
        '380327626433-iqnmcb6uvse8dgipio6kfcr87pddq7ki.apps.googleusercontent.com',
      // androidClientId: '380327626433-jujubpgd21ejajjtou4fk7t1nmsumo0t.apps.googleusercontent.com',
      offlineAccess: true,
      // scopes: ['https://www.googleapis.com/auth/drive'],
      // forceCodeForRefreshToken: true,
      // profileImageSize: 120,
    });
  }, []);

  const validateLoginForm = () => {
    let errors = {};
    let messages = [];

    if (!userName.trim()) {
      errors.email = 'Email is required.';
      messages.push('Email is required');
    }

    if (!password.trim()) {
      errors.password = 'Password is required.';
      messages.push('Password is required');
    }

    setLoginErrors(errors);

    if (messages.length > 0) {
      Alert.alert('Fields Required', messages.join('\n'));
      return false;
    }

    return true;
  };

  const validateForgotPasswordForm = () => {
    let errors = {};
    let messages = [];

    if (!fpemail.trim()) {
      errors.email = 'Email is required.';
      messages.push('Email is required');
    }

    if (!fppassword.trim()) {
      errors.password = 'New Password is required.';
      messages.push('New Password is required');
    }

    if (!fpconfirmpassword.trim()) {
      errors.confirm = 'Confirm password is required.';
      messages.push('Confirm password is required');
    }

    if (fppassword !== fpconfirmpassword) {
      errors.confirm = 'Passwords do not match.';
      messages.push('Passwords do not match');
    }

    if (!fpotp.trim()) {
      errors.otp = 'OTP is required.';
      messages.push('OTP is required');
    }

    setFpErrors(errors);

    if (messages.length > 0) {
      Alert.alert('Fields Required', messages.join('\n'));
      return false;
    }

    return true;
  };

  const isResetButtonEnabled = () => {
    return (
      fpemail.trim() &&
      fppassword.trim() &&
      fpconfirmpassword.trim() &&
      fppassword === fpconfirmpassword &&
      fpotp.trim() &&
      isOtpVerified
    );
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const sendOtp = async () => {
    if (!fpemail.trim()) {
      Alert.alert('Required Field', 'Email is required.');
      return;
    }
    try {
      setisLoading(true);
      const result = await Auth.generateOtp({email: fpemail});
      if ((result && result.status === 200) || result.status === 201) {
        if (result.data.message === 'OTP sent successfully') {
          alert({
            type: DropdownAlertType.Success,
            title: 'Success',
            message: result.data.message,
          });
          setOtpSent(true);
          setIsOtpVerified(false);
        } else {
          alert({
            type: DropdownAlertType.Error,
            title: 'Failed',
            message: result.data.message,
          });
        }
      } else {
        Alert.alert('Failed', 'Could not send OTP.');
      }
    } catch (err) {
      Alert.alert('Error', 'Try again later.');
    } finally {
      setisLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!fpemail.trim() || !fpotp.trim()) {
      setFpErrors({
        ...fpErrors,
        otp: !fpotp ? 'OTP is required.' : '',
      });
      return;
    }

    try {
      setisLoading(true);

      const res = await Auth.verifyOtp({email: fpemail, otp: fpotp});
      if ((res && res.status === 200) || res.status === 201) {
        if (res.data.message === 'OTP verified successfully') {
          alert({
            type: DropdownAlertType.Success,
            title: 'Verified',
            message: res.data.message,
          });
          setIsOtpVerified(true);
        } else {
          alert({
            type: DropdownAlertType.Warn,
            title: 'Invalid',
            message: res.data.message,
          });
        }
      } else {
        setIsOtpVerified(false);
        Alert.alert('Invalid', 'OTP verification failed.');
      }
    } catch (err) {
      Alert.alert('Error', 'Error while verifying OTP.');
    } finally {
      setisLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!validateForgotPasswordForm()) return;

    try {
      setisLoading(true);

      const response = await Users.forgotPasswordSave({
        email: fpemail,
        password: fppassword,
      });
      if (response.status == 'success') {
        alert({
          type: DropdownAlertType.Success,
          title: 'Success',
          message: response.message,
        });
        toggleModal();
        navigation.navigate('Sign In');

        setFpemail('');
        setFppassword('');
        setFpconfirmpassword('');
        setFpotp('');
        setOtpSent(false);
        setIsOtpVerified(false);
      } else {
        alert({
          type: DropdownAlertType.Error,
          title: 'Error',
          message: response.message,
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setisLoading(false);
    }
  };

  const parentLogin = async () => {
  try {
    if (!userName || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setisLoading(true);
    console.log('Attempting login with:', { email: userName, password });

    // Call your API login
    const response = await Auth.login({
      action: 'login',
      email: userName,
      password: password,
    });
    console.log('Login response:', response);

    if (response?.data?.status === 'success' && response?.data?.data?.token) {
      console.log('Login successful, storing data...');

      // Clear any existing data first
      await AsyncStorage.multiRemove([
        'userUserName',
        'userParentFirstName',
        'userParentLastName',
        'userParentEmail',
        'token',
        'userId',
        'role',
        'loginDate',
      ]);

      // Store new data
      await AsyncStorage.multiSet([
        ['userUserName', response.data.data.email],
        ['userParentFirstName', response.data.data.first_name],
        ['userParentLastName', response.data.data.last_name],
        ['userParentEmail', response.data.data.email],
        ['token', response.data.data.token],
        ['userId', response.data.data.id.toString()],
        ['role', 'admin'],
        ['loginDate', new Date().toISOString()],
      ]);

      console.log('Data stored, calling onLoginSuccess');
      onLoginSuccess(response.data.data, false); // second arg = false → no trial alert
    } else {
      // If API login fails, sign out from Firebase
      const app = getApp();
      const auth = getAuth(app);
      await signOut(auth);
      console.log('Login failed - invalid response');
      Alert.alert('Error', response?.data?.message || 'Login failed');
    }
  } catch (error) {
    console.log('TCL: parentLogin -> error', error);
    // If any error occurs, sign out from Firebase
    const app = getApp();
    const auth = getAuth(app);
    await signOut(auth);
    console.log('Login error:', error);
    Alert.alert('Error', error?.response?.data?.message || 'Login failed');
  } finally {
    setisLoading(false);
  }
};


  const handleGoogleLogin = async () => {
    try {
      const playServicesAvailable = await GoogleSignin.hasPlayServices();
      console.log('It is here ');

      const userInfo = await GoogleSignin.signIn();
      const {email, givenName, familyName, id} = userInfo.data.user;
      const {idToken} = userInfo.data;
      await AsyncStorage.multiSet([
        ['userUserName', email],
        ['userParentFirstName', givenName],
        ['userParentLastName', familyName],
        ['userParentEmail', email],
        ['role', 'admin'],
        ['token', idToken],
        ['userId', id.toString()],
      ]);
      onLoginSuccess();
      alert({
        type: DropdownAlertType.Success,
        title: 'Google Login Successful',
        message: 'You have successfully logged in via Google.',
      });
    } catch (error) {
      console.error('Detailed Google Sign-In Error:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      Alert.alert('Error', `Google sign-in failed: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#4B0082" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
          </View>

          <View style={styles.card}>
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={userName}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={{flex: 0.8}}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                flex: 0.2,
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}>
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color={AppColors.theme}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={parentLogin}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>LogIn</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}>
            <MaterialCommunityIcons
              name="google"
              size={22}
              color="#fff"
              style={{marginRight: 10}}
            />
            <Text style={styles.googleButtonText}>Login with Google</Text>
          </TouchableOpacity>

          <View style={{alignItems: 'flex-end'}}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={[styles.linkText, {fontSize: 12, color: 'grey'}]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.signupPrompt}>
            Create new account?{' '}
            <Text style={styles.signupLink} onPress={handleSignup}>
              Sign Up
            </Text>
          </Text>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL('https://timesride.com/wisetube/faqs/')
            }
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
            }}>
            <Text
              style={{
                ...styles.signupLink,
                textDecorationLine: 'underline',
                marginRight: 8,
              }}>
              WiseTube Help Center
            </Text>
            <Text
              style={{...styles.signupLink, textDecorationLine: 'underline'}}>
              Help & FAQs
            </Text>
          </TouchableOpacity>

          {/* ---------------- Forgot Password Modal ---------------- */}
          <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={{position: 'absolute', top: 10, right: 10, zIndex: 1}}
                onPress={toggleModal}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
              <TextInput
                placeholder="Email"
                style={styles.fpInput}
                value={fpemail}
                onChangeText={setFpemail}
              />

              <TextInput
                placeholder="New Password"
                secureTextEntry
                style={styles.fpInput}
                value={fppassword}
                onChangeText={setFppassword}
              />

              <TextInput
                placeholder="Confirm New Password"
                secureTextEntry
                style={styles.fpInput}
                value={fpconfirmpassword}
                onChangeText={setFpconfirmpassword}
              />

              {otpSent && (
                <>
                  <TextInput
                    placeholder="OTP"
                    style={styles.fpInput}
                    value={fpotp}
                    onChangeText={setFpotp}
                  />

                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={verifyOtp}>
                    <Text style={styles.loginButtonText}>Verify OTP</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={styles.loginButton} onPress={sendOtp}>
                <Text style={styles.loginButtonText}>
                  {otpSent ? 'Resend OTP' : 'Email OTP'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  {
                    backgroundColor: isResetButtonEnabled()
                      ? '#7B68EE'
                      : 'gray',
                  },
                ]}
                onPress={handleSavePassword}
                disabled={!isResetButtonEnabled()}>
                <Text style={styles.loginButtonText}>Reset Password</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
      {isLoading && <AppLoader />}
      <DropdownAlert alert={func => (alert = func)} alertPosition="bottom" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F4F4F6', // Light neutral background
  },
  scrollContainer: {
    justifyContent: 'center',
    padding: 20,
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4B0082',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#4B0082',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4B0082',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: AppFonts.SemiBold,
    letterSpacing: 0.5,
  },
  linkText: {
    color: '#4B0082',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    fontFamily: AppFonts.SemiBold,
  },
  signupPrompt: {
    color: '#555',
    textAlign: 'center',
    fontSize: 15,
    marginTop: 20,
    fontFamily: AppFonts.SemiBold,
  },
  signupLink: {
    color: '#4B0082',
    fontFamily: AppFonts.SemiBold,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  fpInput: {
    height: 40,
    borderColor: '#DDD',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB4437',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 12,
    elevation: 3,
    shadowColor: '#DB4437',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: AppFonts.SemiBold,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0, // small padding from bottom
  },
});

export default LoginScreen;
