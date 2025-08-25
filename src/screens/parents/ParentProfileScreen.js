import React, {useEffect, useRef, useState} from 'react';
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
  Linking,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Dimensions} from 'react-native';
const screenHeight = Dimensions.get('window').height;

import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import AppColors from '../../utils/AppColors';
import {Auth} from '../../services';
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';
import AppFonts from '../../utils/AppFonts';
import {useNavigation} from '@react-navigation/native';
import {red} from 'react-native-reanimated/lib/typescript/Colors';
import SubscriptionService from '../../services/subscriptionService';

const ParentProfileScreen = () => {
  const navigation = useNavigation();
  const refRBSheet = useRef();

  const [userName, setUserName] = useState('');
  const [userParentFirstName, setUserParentFirstName] = useState('');
  const [userParentLastName, setUserParentLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [isPinSet, setIsPinSet] = useState(false);
  const [isHomeLocked, setIsHomeLocked] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [subscriptionValidTill, setSubscriptionValidTill] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  console.log(
    'TCL: ParentProfileScreen -> subscriptionDetails',
    subscriptionDetails,
  );
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  let alert = _data => new Promise(res => res);

  const checkLock = async () => {
    const isLocked = await AsyncStorage.getItem('homeLocked');
    console.log('TCL: checkLock -> isLocked', isLocked);
    setIsHomeLocked(isLocked === 'true');
  };
  useEffect(() => {
    const isFocused = navigation.addListener('focus', () => {
      checkLock();
    });
    return isFocused;
  }, [navigation]);

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
      console.log('TCL: fetchData -> trialData', trialData);
      const PriceData = await AsyncStorage.getItem('pricedata');
      const DaysRemaining = await AsyncStorage.getItem('daysRemaining');
      const daysRemainingParsed = JSON.parse(DaysRemaining);
      console.log('TCL: fetchData -> daysRemainingParsed', daysRemainingParsed);
      console.log(trialData);
      console.log('tiral data', PriceData);
      console.log('daysremaining', daysRemainingParsed);
      if (trialData && PriceData && daysRemainingParsed <= 3) {
        setIsTrialActive(true);
        console.log('inside');
      }
      console.log(isTrialActive);

      setUserName(name || '');
      setUserParentFirstName(fName || '');
      setUserParentLastName(lName || '');
      setUserEmail(email || '');
      setIsPinSet(!!storedPin);
      setIsHomeLocked(homeLocked === 'true');
      const subscriptionDetails = await SubscriptionService.getSubscription(
        name,
      );
      console.log('TCL: fetchData -> email', email);

      console.log('TCL: fetchData -> subscriptionDetails', subscriptionDetails);
      if (subscriptionDetails) {
        // const findUserSubs = subscriptionDetails?.data?.find((item)=>item?.email==email);
        // console.log("TCL: fetchData -> findUserSubs", findUserSubs)
        setSubscriptionDetails(subscriptionDetails?.data?.[0]);
        const expDate = subscriptionDetails?.data?.[0]?.expiry_date;
        console.log('TCL: fetchData -> expDate', expDate);
        if (expDate) {
          console.log('TCL: fetchData -> readableDate');
          try {
            const readableDate = moment(expDate).format('MMMM Do YYYY');
            console.log('TCL: fetchData -> readableDate', readableDate);

            setSubscriptionValidTill(readableDate);
          } catch (err) {
            console.log('TCL: fetchData -> err', err);
          }
        }
      }
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

  const MyComponent = ({refRBSheet, subscriptionDetails}) => {
    return (
      <RBSheet
        ref={refRBSheet}
        height={screenHeight * 0.45}
        openDuration={250}
        closeOnDragDown={true}
        dragFromTopOnly={true}
        customStyles={{
          wrapper: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          container: {
            backgroundColor: '#fff',
            paddingHorizontal: 24,
            paddingVertical: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          draggableIcon: {
            backgroundColor: '#ccc',
            width: 60,
          },
        }}>
        <View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#333',
              textAlign: 'center',
              marginBottom: 20,
              marginTop: 30,
            }}>
            🎟 Subscription Details
          </Text>

          {[
            {
              label: 'Status',
              value: `Subscribed ${
                subscriptionDetails?.is_trial == 1 ? '(Trial)' : ''
              }`,
            },
            {label: 'Plan', value: subscriptionDetails?.product_id},
            {label: 'Price', value: subscriptionDetails?.price},
            {
              label: 'Purchased on',
              value: moment(subscriptionDetails?.purchase_date).format(
                'D MMMM YYYY',
              ),
            },
            {
              label: 'Valid till',
              value: moment(subscriptionDetails?.expiry_date).format(
                'D MMMM YYYY',
              ),
            },
          ].map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
              <Text style={{fontWeight: '600', fontSize: 16, color: '#444'}}>
                {item.label}:
              </Text>
              <Text style={{fontSize: 16, color: '#444'}}>{item.value}</Text>
            </View>
          ))}

          <Text
            style={{
              fontSize: 12,
              color: '#999',
              marginTop: 10,
              textAlign: 'center',
            }}>
            Order ID: {subscriptionDetails?.order_id}
          </Text>
        </View>
      </RBSheet>
    );
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

            

            {showModal && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>Verify OTP</Text>

                  a

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
      <MyComponent
        refRBSheet={refRBSheet}
        subscriptionDetails={subscriptionDetails}
      />
      <DropdownAlert alert={func => (alert = func)} alertPosition="bottom" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB', // softer, modern background
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 35,
  },
  avatarShadow: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 80,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  nameText: {
    fontSize: 24,
    fontFamily: AppFonts.Bold,
    marginTop: 18,
    color: '#222',
  },
  usernameText: {
    fontSize: 15,
    color: '#777',
    marginTop: 4,
    fontFamily: AppFonts.Medium,
  },
  pinSection: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: AppFonts.SemiBold,
    marginBottom: 18,
    color: AppColors.theme,
    textAlign: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
    tintColor: '#888',
  },
  pinInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#333',
  },
  pinButton: {
    backgroundColor: AppColors.theme,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: AppColors.theme,
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  pinButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: AppFonts.SemiBold,
  },
  forgotText: {
    textAlign: 'center',
    color: '#6C63FF',
    fontSize: 14,
    fontFamily: AppFonts.Regular,
    marginTop: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: AppFonts.SemiBold,
    color: AppColors.theme,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
  },
  modalButton: {
    backgroundColor: AppColors.theme,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  trialquote: {
    textAlign: 'center',
    color: AppColors.red,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: AppFonts.SemiBold,
  },
  modalClose: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  subscriptionSection: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },
  subscriptionButton: {
    backgroundColor: AppColors.orange,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: AppColors.orange,
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  subscriptionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: AppFonts.SemiBold,
  },
  subscribedContainer: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F4F6F8',
    alignItems: 'center',
  },
  subscribedText: {
    color: AppColors.orange,
    fontSize: 16,
    fontFamily: AppFonts.Medium,
  },
  validTillText: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
});


export default ParentProfileScreen;
