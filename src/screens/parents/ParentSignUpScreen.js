import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Auth} from '../../services';
import {CheckBox} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tickImage from '../../assets/icons/tick.png';
import untickImage from '../../assets/icons/untick.png';
import AppFonts from '../../utils/AppFonts';
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';
import AppLoader from '../../components/AppLoader';
import AppColors from '../../utils/AppColors';
import {Dropdown} from 'react-native-element-dropdown';

const ParentSignUpScreen = ({onLoginSuccess, setIsLogInScreen}) => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showModal, setShowModal] = useState(false);
  let alert = _data => new Promise(res => res);
  const [selectedCountry, setSelectedCountry] = useState({
    label: 'India (+91)',
    value: '+91',
  });

  const validateForm = () => {
    const errorMessages = [];

    if (email.trim() === '') {
      errorMessages.push('• Email is required');
    }
    if (password === '') {
      errorMessages.push('• Password is required');
    }
    if (phone.trim() === '') {
      errorMessages.push('• Phone Number is required');
    }
    if (otp.trim() === '') {
      errorMessages.push('• OTP is required');
    }
    if (!agreedToTerms) {
      errorMessages.push('• Please agree to the Terms and Conditions');
    }

    if (errorMessages.length > 0) {
      Alert.alert('Validation Error', errorMessages.join('\n'));
      return false;
    }

    return true;
  };

  const countryCodes = [
    {label: 'USA (+1)', value: '+1'},
    {label: 'UK (+44)', value: '+44'},
    {label: 'India (+91)', value: '+91'},
    {label: 'Canada (+1)', value: '+1'},
    {label: 'Australia (+61)', value: '+61'},
  ];

  const handleLogin = () => {
    setIsLogInScreen(true);
    navigation.navigate('Login');
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(
        'http://timesride.com/custom/ParentSignUp.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
      password: password,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phone,
          }),
        },
      );

      const data = await response.json();

      if (data.status === 'success') {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userId', data.userId);
        await AsyncStorage.setItem('role', data.role);
        // Store the signup date
        await AsyncStorage.setItem('loginDate', new Date().toISOString());
          onLoginSuccess();
        } else {
          alert({
            type: DropdownAlertType.Error,
          title: 'Error',
          message: data.message || 'Sign up failed',
        });
      }
    } catch (error) {
      alert({
        type: DropdownAlertType.Error,
        title: 'Error',
        message: 'Network error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (email.trim() === '') {
      Alert.alert('Required Field', 'Please enter Email Address');
      return;
    }

    setLoading(true);
    try {
      const result = await Auth.generateOtp({email});

      if (result && (result.status === 200 || result.status === 201)) {
        if (result.data.message === 'OTP sent successfully') {
          alert({
            type: DropdownAlertType.Success,
            title: 'Success',
            message: result.data.message,
          });
          setOtpSent(true);
        } else {
          alert({
            type: DropdownAlertType.Warn,
            title: 'Warning',
            message: result.data.message,
          });
        }
      } else {
        Alert.alert('OTP Failed', 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Something went wrong while sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.trim() === '') {
      Alert.alert('Required Field', 'Please enter the OTP.');
      return;
    }

    setLoading(true);
    try {
      const result = await Auth.verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
      });

      if (result && result.status === 200) {
        if (result.data.message === 'OTP verified successfully') {
          alert({
            type: DropdownAlertType.Success,
            title: 'Success',
            message: result.data.message,
          });
          setOtpVerified(true);
        } else {
          alert({
            type: DropdownAlertType.Error,
            title: 'Verification Failed',
            message: result.data.message,
          });
        }
      } else {
        Alert.alert(
          'Verification Failed',
          result?.data.message || 'Invalid OTP.',
        );
      }
    } catch (err) {
      console.log(err);
      Alert.alert(
        'Error',
        'OTP verification failed. It may be expired or incorrect.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#9370db" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.backgroundImage}>
            <Text style={styles.heading}>Sign Up</Text>

            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={text => setEmail(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={true}
                value={password}
                onChangeText={text => setPassword(text)}
              />
              <Dropdown
                style={styles.dropdown}
                data={countryCodes}
                labelField="label"
                valueField="value"
                placeholder="Select Country"
                value={selectedCountry}
                onChange={item => setSelectedCountry(item)}
                containerStyle={{borderRadius: 8}}
                itemTextStyle={{fontSize: 14}}
                selectedTextStyle={{fontSize: 14}}
                placeholderStyle={{color: '#999'}}
                fontFamily={AppFonts.Regular}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={phone}
                onChangeText={text => setPhone(text)}
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                onPress={sendOtp}
                style={[styles.loginButton, {backgroundColor: '#6a5acd'}]}>
                <Text style={styles.loginButtonText}>
                  {otpSent ? 'Resend OTP' : 'Send Email OTP'}
                </Text>
              </TouchableOpacity>

              {otpSent && (
                <View style={{marginTop: 10}}>
                  <TextInput
                    style={styles.input}
                    placeholder="Insert Email OTP"
                    value={otp}
                    onChangeText={text => setOtp(text)}
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              {otpSent && (
                <TouchableOpacity
                  onPress={verifyOtp}
                  style={[styles.loginButton, {backgroundColor: '#4682b4'}]}>
                  <Text style={styles.loginButtonText}>Verify OTP</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={{marginLeft: 40, marginTop: 10}}>
                <Text style={{color: '#007bff', fontFamily: AppFonts.Regular}}>
                  Read Terms and Conditions
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 10,
                  marginTop: 10,
                }}>
                <TouchableOpacity
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image
                    source={agreedToTerms ? tickImage : untickImage}
                    style={{width: 24, height: 24, marginRight: 8}}
                  />
                  <Text style={{color: '#000', fontFamily: AppFonts.Regular}}>
                    I agree to the terms and condition
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSignUp}
                disabled={!otpVerified}
                style={[
                  styles.loginButton,
                  {
                    backgroundColor: otpVerified ? '#7B68EE' : 'gray',
                  },
                ]}>
                <Text style={styles.loginButtonText}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.signinPrompt}>
                  Already have an account?{' '}
                  <Text style={styles.signinLink}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            visible={showModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowModal(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <ScrollView>
                  <Text style={styles.modalText}>
                    Welcome to WiseTube! By accessing or using our application,
                    website, services, or tools (collectively, "Services"), you
                    agree to comply with and be bound by the following terms and
                    conditions (the "Terms"). Please read these Terms carefully
                    before using our Services.{'\n\n'}
                    1. Acceptance of Terms{'\n'}
                    By creating an account, accessing, or using the Services,
                    you confirm that you have read, understood, and agreed to be
                    bound by these Terms. If you do not agree with any part of
                    these Terms, you must not use our Services.{'\n\n'}
                    2. Changes to Terms{'\n'}
                    We reserve the right to modify these Terms at any time. We
                    will notify you of any changes by posting the new Terms on
                    this page. Your continued use of the Services after any such
                    changes take effect constitutes your acceptance of the new
                    Terms.{'\n\n'}
                    3. Account Registration{'\n'}
                    To access certain features of the Services, you must
                    register for an account. When registering, you agree to
                    provide accurate, current, and complete information about
                    yourself. You are responsible for safeguarding your account
                    and for all activities that occur under your account.
                    {'\n\n'}
                    4. Use of Services{'\n'}
                    You agree to use our Services only for lawful purposes and
                    in accordance with these Terms. You will not use the
                    Services in any way that violates any applicable local,
                    state, national, or international law or regulation.{'\n\n'}
                    5. Intellectual Property Rights{'\n'}
                    All rights, title, and interest in and to the Services
                    (excluding content provided by users) are and will remain
                    the exclusive property of WiseTube and its licensors.
                    Nothing in the Terms gives you a right to use the WiseTube
                    name or any of the WiseTube trademarks, logos, domain names,
                    and other distinctive brand features.{'\n\n'}
                    6. Content{'\n'}
                    You are responsible for the content that you provide or
                    transmit through our Services. You grant us a non-exclusive,
                    transferable, sub-licensable, royalty-free, worldwide
                    license to use any content that you post on or in connection
                    with the Services.{'\n\n'}
                    7. Third-Party Services{'\n'}
                    Our Services may contain links to third-party websites or
                    services that are not owned or controlled by WiseTube. We
                    have no control over, and assume no responsibility for, the
                    content, privacy policies, or practices of any third-party
                    websites or services.{'\n\n'}
                    8. Termination{'\n'}
                    We may terminate or suspend your account and bar access to
                    the Services immediately, without prior notice or liability,
                    under our sole discretion, for any reason whatsoever and
                    without limitation, including but not limited to a breach of
                    the Terms.{'\n\n'}
                    9. Limitation of Liability{'\n'}
                    In no event shall WiseTube, nor its directors, employees,
                    partners, agents, suppliers, or affiliates, be liable for
                    any indirect, incidental, special, consequential or punitive
                    damages, including without limitation, loss of profits,
                    data, use, goodwill, or other intangible losses, resulting
                    from your access to or use of or inability to access or use
                    the Services.{'\n\n'}
                    10. Governing Law{'\n'}
                    These Terms shall be governed and construed in accordance
                    with the laws of India, without regard to its conflict of
                    law provisions.{'\n\n'}
                    11. Changes to Services{'\n'}
                    We reserve the right to withdraw or amend our Services, and
                    any service or material we provide via the Services, in our
                    sole discretion without notice. We will not be liable if for
                    any reason all or any part of the Services is unavailable at
                    any time or for any period.{'\n\n'}
                    12. Contact Us{'\n'}
                    If you have any questions about these Terms, please contact
                    us at contact.timesride@gmail.com{'\n\n'}
                  </Text>
                </ScrollView>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={styles.okButton}>
                  <Text style={{color: '#fff'}}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
      {loading && <AppLoader />}

      <DropdownAlert alert={func => (alert = func)} alertPosition="bottom" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#9370db', // Matches app theme
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#9370db',
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: AppFonts.Bold,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  backgroundImage: {
    width: '100%',
    backgroundColor: '#9370db',
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
  },
  loginButton: {
    backgroundColor: '#7B68EE',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: AppFonts.SemiBold,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: AppColors.theme,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  signinPrompt: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 30,
    fontFamily: AppFonts.SemiBold,
  },
  signinLink: {
    color: '#FFD700',
    fontFamily: AppFonts.SemiBold,
  },
  dropdown: {
    height: 40,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 20,
    justifyContent: 'center',
  },
});

export default ParentSignUpScreen;
