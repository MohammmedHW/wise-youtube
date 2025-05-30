import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GestureHandlerRootView} from 'react-native-gesture-handler'; // ✅ Important import
// import BottomTabNavigator from "./src/components/BottomTabNavigator";
import LoginScreen from './src/screens/LoginScreen';
import ParentSignUpScreen from './src/screens/parents/ParentSignUpScreen';
import MyStack from './src/components/MyStack';
import PaywallScreen from './src/screens/PaywallScreen';
import TrialScreen from './src/screens/TrialScreen';
import * as RNIap from 'react-native-iap';
import { getApp } from '@react-native-firebase/app';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { Alert, ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useSubscription } from './src/hooks/useSubscription';
import SubscriptionService from './src/services/subscriptionService';
import { useTrial } from './src/hooks/useTrial';

// Define product IDs at the app level
const productIds = ["monthly_plan", "quarterly_plan", "yearly_plan"];

export default function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [navigatorComponent, setNavigatorComponent] = useState(null);
  const [isLogInScreen, setIsLogInScreen] = useState(true);
  const [hasActiveSub, setHasActiveSub] = useState(false);
  const [checkingSub, setCheckingSub] = useState(false);
  const [showTrial, setShowTrial] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Use hooks to manage subscription and trial status
  const { subscription, loading: subscriptionLoading, checkSubscription } = useSubscription();
  const { trialStatus, loading: trialLoading, checkTrialStatus } = useTrial();

  useEffect(() => {
    // Initialize IAP at app level
    const initializeIAP = async () => {
      try {
        await RNIap.initConnection();
        console.log('App: IAP connection initialized');
      } catch (error) {
        console.error('App: Error initializing IAP:', error);
      }
    };

    initializeIAP();

    // Cleanup IAP connection when app closes
    return () => {
      RNIap.endConnection();
    };
  }, []);

  useEffect(() => {
    // Force sign out and clear data on app start for clean state
    const initializeApp = async () => {
      try {
        const app = getApp();
        const auth = getAuth(app);
        await signOut(auth); // Keep user logged in during development

        await AsyncStorage.clear(); // Keep data during development

        setLoggedIn(false);
        setIsLogInScreen(true);
        setRole('');
        setHasActiveSub(false);
        setShowTrial(false);
        setShowPaywall(false);
        setNavigatorComponent(null);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // After login (isLoggedIn becomes true), check subscription and trial status
    if (isLoggedIn) {
      console.log("App.js Effect [isLoggedIn]: User logged in, checking sub/trial status...");
      checkSubscription();
      checkTrialStatus();
    }
  }, [isLoggedIn]); // Only runs when isLoggedIn changes

  useEffect(() => {
    // Determine which screen to show based on subscription/trial status
    // This effect runs when isLoggedIn, loading states, subscription, or trialStatus change
    if (isLoggedIn && !loading && !subscriptionLoading && !trialLoading) {
      console.log("App.js Effect [Status Check]: Determining screen to show...");
      console.log("App.js Effect [Status Check]: isLoggedIn:", isLoggedIn);
      console.log("App.js Effect [Status Check]: loading:", loading);
      console.log("App.js Effect [Status Check]: subscriptionLoading:", subscriptionLoading);
      console.log("App.js Effect [Status Check]: trialLoading:", trialLoading);
      console.log("App.js Effect [Status Check]: subscription data:", subscription);
      console.log("App.js Effect [Status Check]: trialStatus data:", trialStatus);

      // Check if subscription data is available and has active status
      if (subscription?.status === 'success' && subscription?.data?.length > 0) {
        const sub = subscription.data[0];
        console.log("App.js Effect [Status Check]: Found subscription data:", sub);

        if (sub.status === 'active') {
          console.log("App.js Effect [Status Check]: Subscription/Trial status is ACTIVE, showing main app.");
          setShowTrial(false);
          setShowPaywall(false);
          setHasActiveSub(true);
          setNavigatorComponent(<MyStack onLogout={handleLogout} />);
        } else {
          console.log("App.js Effect [Status Check]: Subscription status is NOT active, showing paywall.");
          setShowTrial(false);
          setShowPaywall(true);
          setHasActiveSub(false);
          setNavigatorComponent(null);
        }
      } else if (trialStatus?.isActive === true) {
         console.log("App.js Effect [Status Check]: Active trial status from hook, showing main app.");
         // Active trial status from the useTrial hook
          setShowTrial(false);
          setShowPaywall(false);
          setHasActiveSub(true);
          setNavigatorComponent(<MyStack onLogout={handleLogout} />);
      } else if (isLoggedIn && !loading && !subscriptionLoading && !trialLoading) {
         console.log("App.js Effect [Status Check]: Logged in but no active sub/trial data found via hooks, showing trial screen.");
         // Logged in, data loaded, but no active sub/trial found via hooks, show subscription screen
          setShowTrial(true);
          setShowPaywall(false);
          setHasActiveSub(false);
          setNavigatorComponent(null);
      } else { // This else block might be redundant due to the outer if condition, but kept for clarity in logging
         console.log("App.js Effect [Status Check]: Conditions not met to determine screen yet.");
      }
    }
  }, [isLoggedIn, loading, subscription, trialStatus, subscriptionLoading, trialLoading]);

  const handleLoginSuccess = async () => {
     // When login is successful, simply set isLoggedIn to true.
     // The useEffect above will handle checking subscription status and navigating.
    console.log("App.js handleLoginSuccess: Setting isLoggedIn to true.");
    setLoggedIn(true);
    // Role and other basic user data can be set here if needed immediately after login
    setRole(await AsyncStorage.getItem('role')); // Assuming role is saved in login
  };

  const handleTrialComplete = (success) => {
    // After trial completion (either success or skip)
    console.log("App.js handleTrialComplete:", success);
    if (success) {
      // Trial started successfully, re-check status (should show main app)
      checkSubscription();
      checkTrialStatus();
    } else {
      // Trial skipped or failed, show paywall
      console.log("App.js handleTrialComplete: Trial skipped or failed, setting showPaywall to true.");
      setShowTrial(false);
      setShowPaywall(true);
      setHasActiveSub(false);
      setNavigatorComponent(null); // Ensure main app is not rendered
    }
  };

  const handleSubscriptionComplete = (success) => {
     // After subscription completion
    console.log("App.js handleSubscriptionComplete:", success);
    // Re-check subscription status which will update the UI via the useEffect above
    if (success) {
        checkSubscription();
        checkTrialStatus();
    }
  };

  const handleLogout = async () => {
    try {
      const app = getApp();
      const auth = getAuth(app);
      await signOut(auth);

      await AsyncStorage.clear();

      setLoggedIn(false);
      setIsLogInScreen(true);
      setRole('');
      setHasActiveSub(false);
      setShowTrial(false);
      setShowPaywall(false);
      setNavigatorComponent(null);
    } catch (error) {
      console.error('Error during logout:', error.message);
    }
  };

  // Show a loading indicator if data is still being fetched
  if (loading || checkingSub || subscriptionLoading || trialLoading) {
    console.log("App.js Render: Showing loading screen.");
    return (
       <View style={styles.loadingContainer}>
         <ActivityIndicator size="large" color="#0000ff" />
       </View>
    );
  }

  console.log("App.js Render: Determining which screen to show...");

  // Render the appropriate screen based on state
  if (!isLoggedIn) {
    console.log("App.js Render: Not logged in, showing login/signup.");
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <NavigationContainer>
          {isLogInScreen ? (
            <LoginScreen
              onLoginSuccess={handleLoginSuccess}
              setIsLogInScreen={setIsLogInScreen}
            />
          ) : (
            <ParentSignUpScreen
              setIsLogInScreen={setIsLogInScreen}
            />
          )}
        </NavigationContainer>
      </GestureHandlerRootView>
    );
  } else if (showTrial) {
     console.log("App.js Render: Logged in, showing trial screen.");
     return (
      <GestureHandlerRootView style={{flex: 1}}>
        <NavigationContainer>
          <TrialScreen
            onTrialComplete={handleTrialComplete}
          />
        </NavigationContainer>
      </GestureHandlerRootView>
    );
  } else if (showPaywall) {
     console.log("App.js Render: Logged in, showing paywall screen.");
     return (
      <GestureHandlerRootView style={{flex: 1}}>
        <NavigationContainer>
          <PaywallScreen
            onSubscriptionComplete={handleSubscriptionComplete}
          />
        </NavigationContainer>
      </GestureHandlerRootView>
    );
  } else if (hasActiveSub && navigatorComponent) {
     console.log("App.js Render: Logged in with active sub, showing main app.");
     // If logged in and has active sub, show the main app navigator
     return (
       <GestureHandlerRootView style={{flex: 1}}>
         <NavigationContainer>
           {navigatorComponent}
         </NavigationContainer>
       </GestureHandlerRootView>
     );
  } else {
     console.log("App.js Render: Logged in, but no specific screen condition met (should not happen often).");
     // Fallback or loading state if none of the above conditions are met immediately
     return (
       <View style={styles.loadingContainer}>
         <ActivityIndicator size="large" color="#00ff00" />
         <Text>Loading app state...</Text>
       </View>
     );
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  // Add other styles from your App.js if any
});
