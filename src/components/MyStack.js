import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ParentsBottomTabNavigator from './ParentsBottomTabNavigator';
import ParentVideoDetailScreen from '../screens/parents/ParentVideoDetailScreen';
// import ParentPlaylistScreen from '../screens/parents/ParentPlaylistScreen';
import ParentViewScreen from '../screens/parents/ParentViewScreen';
// import ParentUpdateScreen from '../screens/parents/ParentUpdateScreen';
// import ParentUserViewScreen from '../screens/parents/ParentUserViewScreen'
import LoginScreen from '../screens/LoginScreen';
// import ParentUpdateUserScreen from "../screens/parents/ParentUpdateUserScreen"
// import ParentCreateUserScreen from "../screens/parents/ParentCreateUserScreen"
import ParentCreatePlaylistScreen from '../screens/parents/ParentCreatePlaylistScreen';
import ParentSignUpScreen from '../screens/parents/ParentSignUpScreen';
import ParentChannelScreen from '../screens/parents/ParentChannelScreen';
// import ParentChannelListScreen from '../screens/parents/ParentChannelListScreen';
import ParentChannelVideoScreen from '../screens/parents/ParentChannelVideoScreen';
import ParentPlaylistScreen from '../screens/parents/ParentPlaylistScreen';
import ParentPlaylistViewScreen from '../screens/parents/ParentPlaylistViewScreen';
import {NavigationContainer} from '@react-navigation/native';
import PlaylistDetails from '../screens/parents/PlaylistDetails';
import ParentHomeScreen from '../screens/parents/ParentHomeScreen';

import PaywallScreen from '../screens/PaywallScreen';
import TrialScreen from '../screens/TrialScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

const MyStack = ({onLogout}) => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{headerShown: false}} name="HomeScreen">
        {() => <ParentsBottomTabNavigator onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="Add Video" component={ParentVideoDetailScreen} />
      <Stack.Screen name="Playlist Video" component={ParentViewScreen} />
      {/* <Stack.Screen name="ParentUserViewScreen" component={ParentUserViewScreen}/>
      <Stack.Screen name="ParentUpdateUserScreen" component={ParentUpdateUserScreen}/>
      <Stack.Screen name="Create User" component={ParentCreateUserScreen}/>  */}
      <Stack.Screen
        name="Create Playlist"
        component={ParentCreatePlaylistScreen}
      />
      <Stack.Screen name="PlayList Details" component={PlaylistDetails} />
      {/* <Stack.Screen name="Update" component={ParentUpdateScreen} /> */}
      <Stack.Screen name="Channel" component={ParentChannelScreen} />
      {/* <Stack.Screen name="Channel List" component={ParentChannelListScreen}/>  */}
      <Stack.Screen
        name="Channel Videos"
        component={ParentChannelVideoScreen}
      />
      <Stack.Screen name="Playlist" component={ParentPlaylistViewScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Sign UP" component={ParentSignUpScreen} />
      <Stack.Screen name="ParentHomeScreen" component={ParentHomeScreen} />
      <Stack.Screen name="PaywallScreen" component={PaywallScreen} />
      <Stack.Screen name="TrialScreen" component={TrialScreen} />
    </Stack.Navigator>
  );
};

export default MyStack;

const styles = StyleSheet.create({});
