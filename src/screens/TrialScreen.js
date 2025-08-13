// import React, {useContext, useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   Button,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';

// import AppColors from '../utils/AppColors';
// import AppFonts from '../utils/AppFonts';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import SubscriptionService from '../services/subscriptionService';
// import DropdownAlert, { DropdownAlertType } from 'react-native-dropdownalert';
// import { AppContext } from '../contextApi/AppContext';

// const TrialScreen = ({onTrialComplete}) => {
//   const [loading, setLoading] = useState(false);
//   const {setCheckTrialFirstTime ,checkTrialFirstTime } = useContext(AppContext);

//   let alert = _data => new Promise(res => res);

//   const handleStartTrial = async () => {
//     try {
//       setLoading(true);
//       const email = await AsyncStorage.getItem('userUserName');

//       if (!email) {
//         Alert.alert('Error', 'User email not found');
//         return;
//       }

//       const response = await SubscriptionService.addTrialSubscription(email);
//       const response1 = await SubscriptionService.getSubscription(email);
//       console.log('Response 1', response1);
//       console.log('Trial response:', response);

//       if (response.message === 'Subscription already exists for this email') {
//         console.log('Trial already exists, proceeding to main app');
//         onTrialComplete(true);
//         Alert.alert(
//           'Trial Period Completed',
//           'You need to purchase the subscription to continue using the app, by clicking on the button "Skip Trial"',
//           [{text: 'OK'}],
//         );
     
       
//       } else if (response.status === 'success') {
//         console.log('New trial created, proceeding to main app');
//         setCheckTrialFirstTime(true);
//         onTrialComplete(true);
//         alert({
//           type: DropdownAlertType.Success,
//           title: 'Congratulations',
//           message: 'You have earned 3 days of trial.',
//         });
//       } else {
//         console.error('Failed to start trial:', response.message);
//         Alert.alert('Error', response.message || 'Failed to start trial');
//         onTrialComplete(false);
//       }
//     } catch (error) {
//       console.error('Error starting trial:', error);
//       Alert.alert('Error', 'Failed to start trial. Please try again.');
//       onTrialComplete(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSkipTrial = () => {
//     console.log('handle skip trial)+');
//     onTrialComplete(false);
//   };

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />
//       <View style={styles.content}>
//         <Text style={styles.title}>Start Your Free Trial</Text>
//         <Text style={styles.subtitle}>
//           Get 3 days of full access to all premium features. No credit card
//           required.
//         </Text>

//         <View style={styles.featuresContainer}>
//           <Text style={styles.featureText}>✓ Full access to all content</Text>
//           <Text style={styles.featureText}>✓ No credit card required</Text>
//           <Text style={styles.featureText}>✓ Cancel anytime</Text>
//           <Text style={styles.featureText}>
//             ✓ If you already use trial period the Start Free Trial button won't
//             work.
//           </Text>
//         </View>

//         <TouchableOpacity
//           style={styles.startButton}
//           onPress={handleStartTrial}
//           disabled={loading}>
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.startButtonText}>Start Free Trial</Text>
//           )}
//         </TouchableOpacity>

//         <Text style={styles.orText}>OR</Text>

//         <TouchableOpacity
//           style={[styles.skipButton, {opacity: loading ? 0.5 : 1}]}
//           onPress={handleSkipTrial}
//           disabled={loading}>
//           <Text style={styles.skipButtonText}>Skip Trial</Text>
//         </TouchableOpacity>
//         <Text style={styles.termsText}>
//           By starting the trial, you agree to our Terms of Service and Privacy
//           Policy
//         </Text>

//       </View>

//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: AppColors.offWhite,
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 28,
//     fontFamily: AppFonts.Bold,
//     color: AppColors.black,
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 18,
//     fontFamily: AppFonts.regular,
//     color: AppColors.gray,
//     textAlign: 'center',
//     marginBottom: 40,
//   },
//   featuresContainer: {
//     width: '100%',
//     marginBottom: 40,
//   },
//   featureText: {
//     fontSize: 16,
//     fontFamily: AppFonts.regular,
//     color: AppColors.green,
//     marginBottom: 15,
//   },
//   startButton: {
//     backgroundColor: AppColors.blue,
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 25,
//     marginBottom: 20,
//   },
//   startButtonText: {
//     color: AppColors.white,
//     fontSize: 18,
//     fontFamily: AppFonts.medium,
//   },
//   skipButton: {
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     marginBottom: 20,
//   },
//   skipButtonText: {
//     color: AppColors.blue,
//     fontSize: 16,
//     fontFamily: AppFonts.regular,
//     textDecorationLine: 'underline',
//   },
//   termsText: {
//     fontSize: 12,
//     fontFamily: AppFonts.regular,
//     color: AppColors.gray,
//     textAlign: 'center',
//     opacity: 0.7,
//   },
//   orText: {
//     fontSize: 16,
//     fontFamily: AppFonts.regular,
//     color: AppColors.gray,
//     paddingVertical: 10,
//   },
// });

// export default TrialScreen;
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import AppColors from '../utils/AppColors';
import AppFonts from '../utils/AppFonts';

const TrialScreen = ({ onTrialComplete }) => {
  const [loading, setLoading] = useState(false);

  // Just skip all subscription/trial logic
  const handleAccessApp = () => {
    setLoading(true);
    // Simulate small delay (optional)
    setTimeout(() => {
      onTrialComplete(true); // Always pass to next screen
      setLoading(false);
    }, 300);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={AppColors.blue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome 🎉</Text>
        <Text style={styles.subtitle}>
          All premium features are now unlocked — no subscription required!
        </Text>

        <View style={styles.featuresContainer}>
          <Text style={styles.featureText}>✓ Full access to all content</Text>
          <Text style={styles.featureText}>✓ No credit card required</Text>
          <Text style={styles.featureText}>✓ Cancel anytime (not needed)</Text>
          <Text style={styles.featureText}>✓ Works for everyone</Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleAccessApp}
          disabled={loading}
        >
          <Text style={styles.startButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.offWhite,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: AppFonts.Bold,
    color: AppColors.black,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: AppFonts.regular,
    color: AppColors.gray,
    textAlign: 'center',
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureText: {
    fontSize: 16,
    fontFamily: AppFonts.regular,
    color: AppColors.green,
    marginBottom: 15,
  },
  startButton: {
    backgroundColor: AppColors.blue,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 20,
  },
  startButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontFamily: AppFonts.medium,
  },
});

export default TrialScreen;
