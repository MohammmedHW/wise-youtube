import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaywallScreen from '../screens/PaywallScreen';
import TrialScreen from '../screens/TrialScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    // Force sign out and clear all data on app start
    const initializeApp = async () => {
      try {
        // Sign out from Firebase
        await auth().signOut();
        
        // Clear all stored data
        await AsyncStorage.multiRemove([
          'trialStatus',
          'userUserName',
          'userParentFirstName',
          'userParentLastName',
          'userParentEmail',
          'token',
          'userId',
          'role',
          'loginDate'
        ]);

        // Reset states
        setUser(null);
        setTrialStatus(null);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setInitializing(false);
      }
    };

    initializeApp();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          const trialData = await AsyncStorage.getItem('trialStatus');
          if (trialData) {
            setTrialStatus(JSON.parse(trialData));
          }
        } catch (error) {
          console.error('Error checking trial status:', error);
        }
      }
    });

    return subscriber;
  }, []);

  if (initializing) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack - Always show login first if not authenticated
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : !trialStatus ? (
          // Trial Stack - Show trial screen for new users
          <Stack.Screen name="Trial" component={TrialScreen} />
        ) : trialStatus.isActive ? (
          // Main App Stack - Show main app if trial is active
          <Stack.Screen name="MainApp" component={TabNavigator} />
        ) : (
          // Subscription Stack - Show paywall if trial is expired
          <Stack.Screen name="Paywall" component={PaywallScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 