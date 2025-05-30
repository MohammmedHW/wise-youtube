import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import AppColors from '../../utils/AppColors';
import {Auth} from '../../services';
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';
import AppFonts from '../../utils/AppFonts';
import { useNavigation } from '@react-navigation/native';

const ParentProfileScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [userParentFirstName, setUserParentFirstName] = useState('');
  const [userParentLastName, setUserParentLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [isPinSet, setIsPinSet] = useState(false);
  const [isHomeLocked, setIsHomeLocked] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  let alert = _data => new Promise(res => res);

  useEffect(() => {
    const fetchData = async () => {
      const name = await AsyncStorage.getItem('userUserName');
      const fName = await AsyncStorage.getItem('userParentFirstName');
      const lName = await AsyncStorage.getItem('userParentLastName');
      const email = await AsyncStorage.getItem('userEmail');
      const storedPin = await AsyncStorage.getItem('userPin');
      const homeLocked = await AsyncStorage.getItem('homeLocked');
      
      // Check trial status
      const trialData = await AsyncStorage.getItem('trialdata');
      const PriceData = await AsyncStorage.getItem('pricedata');
      const expiryDate = await AsyncStorage.getItem('expirydata');
      
      console.log(trialData);
      console.log("trial data", PriceData);
      console.log("expiry date", expiryDate);

      if (trialData && PriceData) {
        setIsTrialActive(true);
      }

      // Check expiry date and show alert if less than 2 days remaining
      if (expiryDate) {
        const currentDate = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 2 && diffDays > 0) {
          Alert.alert(
            'Subscription Expiring Soon',
            `Your subscription will expire in ${diffDays} day${diffDays === 1 ? '' : 's'}. Please renew your subscription to continue using the app.`,
            [
              {
                text: 'Purchase Now',
                onPress: () => navigation.navigate('PaywallScreen'),
                style: 'default',
              },
              {
                text: 'Later',
                style: 'cancel',
              },
            ]
          );
        }
      }

      setUserName(name || '');
      setUserParentFirstName(fName || '');
      setUserParentLastName(lName || '');
      setUserEmail(email || '');
      setIsPinSet(!!storedPin);
      setIsHomeLocked(homeLocked === 'true');
    };
    fetchData();
  }, []);

  const handleSubscriptionPress = () => {
    navigation.navigate('PaywallScreen');
  };

  const handleModalClose = () => {
    setShowModal(false);
    setOtp('');
    setNewPin('');
    setOtpVerified(false);
    setLoading(false);
  };

  const handlePinAction = async () => {
    const storedPin = await AsyncStorage.getItem('userPin');

    if (isHomeLocked) {
      if (pinInput === storedPin) {
        await AsyncStorage.setItem('homeLocked', 'false');
        setIsHomeLocked(false);
        setPinInput('');
        alert({
          type: DropdownAlertType.Success,
          title: 'Unlocked',
          message: 'Home screen is now accessible.',
        });
      } else {
        alert({
          type: DropdownAlertType.Error,
          title: 'Incorrect PIN',
          message: 'Please enter valid passcode.',
        });
      }
    } else {
      if (!pinInput || pinInput.trim() === '') {
        alert({
          type: DropdownAlertType.Warn,
          title: 'Invalid PIN',
          message: 'PIN cannot be empty.',
        });
        return;
      }

      await AsyncStorage.setItem('userPin', pinInput);
      await AsyncStorage.setItem('homeLocked', 'true');
      setIsPinSet(true);
      setIsHomeLocked(true);
      setPinInput('');
      alert({
        type: DropdownAlertType.Success,
        title: 'Locked',
        message: 'Home screen is now locked.',
      });
    }
  };

  const forgotPin = async () => {
    if (!userName) {
      Alert.alert('Error', 'User email not found. Cannot send OTP.');
      return;
    }

    setShowModal(true);
    setLoading(true);
    try {
      const result = await Auth.generateOtp({email: userName});
      if (result?.status === 200 || result?.status === 201) {
        if (result.data.message === 'OTP sent successfully') {
          alert({
            type: DropdownAlertType.Success,
            title: 'OTP Sent',
            message: 'Please check your email.',
          });
        } else {
          alert({
            type: DropdownAlertType.Error,
            title: 'Error',
            message: result.data.message || 'OTP send failed',
          });
        }
      } else {
        Alert.alert('Failed', 'Could not send OTP.');
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
      Alert.alert('Required', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await Auth.verifyOtp({email: userName, otp: otp.trim()});
      if (
        result?.status === 200 &&
        result.data.message === 'OTP verified successfully'
      ) {
        alert({
          type: DropdownAlertType.Success,
          title: 'Verified',
          message: 'You can now reset your PIN.',
        });
        setOtpVerified(true);
      } else {
        alert({
          type: DropdownAlertType.Warn,
          title: 'Invalid OTP',
          message: result?.data.message || 'Try again',
        });
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetPin = async () => {
    if (newPin.length !== 4 && newPin.length !== 6) {
      Alert.alert('Invalid PIN', 'PIN must be 4 or 6 digits.');
      return;
    }

    await AsyncStorage.setItem('userPin', newPin);
    await AsyncStorage.setItem('homeLocked', 'true');
    setIsPinSet(true);
    setIsHomeLocked(true);
    handleModalClose();
    Alert.alert('Success', 'New PIN has been set.');
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.container}>
            <View style={styles.profileSection}>
              <View style={styles.avatarShadow}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.avatar}
                />
              </View>
              <Text style={styles.nameText}>
                {`${userParentFirstName} ${userParentLastName}`}
              </Text>
              <Text style={styles.usernameText}>{userName}</Text>
            </View>

            <View style={styles.pinSection}>
              <Text style={styles.sectionTitle}>
                {isHomeLocked ? 'Unlock Home Screen' : 'Lock Home Screen'}
              </Text>

              <View style={styles.inputBox}>
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color="#aaa"
                  style={styles.icon}
                />
                <TextInput
                  value={pinInput}
                  onChangeText={setPinInput}
                  style={styles.pinInput}
                  placeholder={
                    isHomeLocked ? 'Enter PIN to Unlock' : 'Enter PIN to Lock'
                  }
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.pinButton}
                onPress={handlePinAction}>
                <Text style={styles.pinButtonText}>
                  {isHomeLocked ? 'Unlock' : 'Lock'}
                </Text>
              </TouchableOpacity>

              {isPinSet && (
                <TouchableOpacity onPress={forgotPin} style={{marginTop: 15}}>
                  <Text style={styles.forgotText}>
                    Forgot PIN? Verify via OTP
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {isTrialActive && (
              <View style={styles.subscriptionSection}>
                <Text style={styles.sectionTitle}>Subscription</Text>
                <TouchableOpacity
                  style={styles.subscriptionButton}
                  onPress={handleSubscriptionPress}>
                  <Text style={styles.subscriptionButtonText}>
                    Purchase Subscription
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {showModal && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>Verify OTP</Text>

                  {!otpVerified && (
                    <>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Enter OTP"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                      <TouchableOpacity
                        onPress={verifyOtp}
                        style={styles.modalButton}>
                        <Text style={styles.modalButtonText}>
                          {loading ? 'Verifying...' : 'Verify OTP'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {otpVerified && (
                    <>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Enter New PIN"
                        value={newPin}
                        onChangeText={setNewPin}
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={6}
                      />
                      <TouchableOpacity
                        onPress={resetPin}
                        style={styles.modalButton}>
                        <Text style={styles.modalButtonText}>Reset PIN</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity onPress={handleModalClose}>
                    <Text style={styles.modalClose}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DropdownAlert alert={func => (alert = func)} alertPosition="bottom" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA'},
  profileSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  avatarShadow: {
    padding: 6,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  nameText: {
    fontSize: 22,
    fontFamily: AppFonts.Bold,
    marginTop: 15,
    color: '#333',
  },
  usernameText: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
    fontFamily: AppFonts.Medium,
  },
  pinSection: {
    marginHorizontal: 25,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: AppFonts.SemiBold,
    marginBottom: 20,
    color: AppColors.theme,
    textAlign: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F0F2F5',
    marginBottom: 15,
  },
  icon: {
    marginRight: 8,
  },
  pinInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#333',
  },
  pinButton: {
    backgroundColor: AppColors.theme,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  pinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: AppFonts.SemiBold,
  },
  forgotText: {
    textAlign: 'center',
    color: '#007BFF',
    fontSize: 14,
    fontFamily: AppFonts.Regular,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.theme,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: AppColors.theme,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalClose: {
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
    fontSize: 14,
  },
  subscriptionSection: {
    marginTop: 20,
    marginHorizontal:25,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subscriptionButton: {
    backgroundColor: AppColors.orange,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  subscriptionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ParentProfileScreen;
