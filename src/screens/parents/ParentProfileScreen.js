import React, { useEffect, useRef, useState } from 'react';
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
  Dimensions,
  Platform,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropdownAlert, { DropdownAlertType } from 'react-native-dropdownalert';
import { useNavigation } from '@react-navigation/native';
import SubscriptionService from '../../services/subscriptionService';
import AppColors from '../../utils/AppColors';
import AppFonts from '../../utils/AppFonts';

const screenHeight = Dimensions.get('window').height;

const ParentProfileScreen = () => {
  const navigation = useNavigation();
  const refRBSheet = useRef();
  const [userName, setUserName] = useState('');
  const [userParentFirstName, setUserParentFirstName] = useState('');
  const [userParentLastName, setUserParentLastName] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [isHomeLocked, setIsHomeLocked] = useState(false);
  let alert = _data => new Promise(res => res);

  useEffect(() => {
    const fetchData = async () => {
      const name = await AsyncStorage.getItem('userUserName');
      const fName = await AsyncStorage.getItem('userParentFirstName');
      const lName = await AsyncStorage.getItem('userParentLastName');
      const homeLocked = await AsyncStorage.getItem('homeLocked');

      setUserName(name || '');
      setUserParentFirstName(fName || '');
      setUserParentLastName(lName || '');
      setIsHomeLocked(homeLocked === 'true');

      const subs = await SubscriptionService.getSubscription(name);
      setSubscriptionDetails(subs?.data?.[0] || null);
    };
    fetchData();
  }, []);

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
      if (!pinInput.trim()) {
        alert({
          type: DropdownAlertType.Warn,
          title: 'Invalid PIN',
          message: 'PIN cannot be empty.',
        });
        return;
      }
      await AsyncStorage.setItem('userPin', pinInput);
      await AsyncStorage.setItem('homeLocked', 'true');
      setIsHomeLocked(true);
      setPinInput('');
      alert({
        type: DropdownAlertType.Success,
        title: 'Locked',
        message: 'Home screen is now locked.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.avatar}
            />
            <Text style={styles.nameText}>
              {`${userParentFirstName} ${userParentLastName}`}
            </Text>
            <Text style={styles.usernameText}>{userName}</Text>
          </View>

          {/* Lock / Unlock Card */}
          <View style={[styles.card, { marginTop: 40 }]}>
            <Text style={styles.sectionTitle}>
              {isHomeLocked ? '🔒 Unlock Home Screen' : '🔓 Lock Home Screen'}
            </Text>
            <View style={styles.inputBox}>
              <Ionicons
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
            <TouchableOpacity style={styles.primaryButton} onPress={handlePinAction}>
              <Text style={styles.primaryButtonText}>
                {isHomeLocked ? 'Unlock' : 'Lock'}
              </Text>
            </TouchableOpacity>
          </View>


          {/* Subscription Card */}
          {/* <View style={styles.card}>
            <Text style={styles.sectionTitle}>🎟 Subscription</Text>
            {subscriptionDetails ? (
              <View style={{alignItems: 'center'}}>
                <Text style={styles.planText}>{subscriptionDetails?.product_id}</Text>
                <Text style={styles.validTillText}>
                  Valid till {moment(subscriptionDetails?.expiry_date).format('D MMM YYYY')}
                </Text>
                <TouchableOpacity
                  style={[styles.primaryButton, {marginTop: 12}]}
                  onPress={() => refRBSheet.current.open()}>
                  <Text style={styles.primaryButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('PaywallScreen')}>
                <Text style={styles.primaryButtonText}>Subscribe Now</Text>
              </TouchableOpacity>
            )}
          </View> */}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Subscription Bottom Sheet */}
      <RBSheet
        ref={refRBSheet}
        height={screenHeight * 0.5}
        openDuration={250}
        customStyles={{
          wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          },
        }}>
        <Text style={styles.sheetTitle}>Subscription Details</Text>
        {subscriptionDetails && (
          <>
            <Text>Status: {subscriptionDetails?.is_trial ? 'Trial' : 'Active'}</Text>
            <Text>Plan: {subscriptionDetails?.product_id}</Text>
            <Text>Price: {subscriptionDetails?.price}</Text>
            <Text>
              Purchased: {moment(subscriptionDetails?.purchase_date).format('D MMM YYYY')}
            </Text>
            <Text>
              Valid till: {moment(subscriptionDetails?.expiry_date).format('D MMM YYYY')}
            </Text>
            <Text style={styles.orderId}>Order ID: {subscriptionDetails?.order_id}</Text>
          </>
        )}
      </RBSheet>

      <DropdownAlert alert={func => (alert = func)} alertPosition="bottom" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: AppColors.theme,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 12,
  },
  nameText: {
    fontSize: 22,
    fontFamily: AppFonts.Bold,
    color: '#fff',
  },
  usernameText: {
    fontSize: 15,
    color: '#EDEDED',
    fontFamily: AppFonts.Medium,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: AppFonts.SemiBold,
    marginBottom: 14,
    color: '#333',
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
  pinInput: { flex: 1, fontSize: 16, paddingVertical: 10, color: '#333' },
  icon: { marginRight: 10 },
  primaryButton: {
    backgroundColor: AppColors.theme,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontFamily: AppFonts.SemiBold },
  planText: {
    fontSize: 18,
    fontFamily: AppFonts.Medium,
    color: AppColors.theme,
  },
  validTillText: { fontSize: 14, color: '#555', marginTop: 4 },
  sheetTitle: { fontSize: 20, fontFamily: AppFonts.Bold, marginBottom: 16 },
  orderId: { marginTop: 10, fontSize: 12, color: '#999' },
});

export default ParentProfileScreen;
