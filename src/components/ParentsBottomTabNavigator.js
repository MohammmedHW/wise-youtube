import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Alert, TouchableOpacity, Image, View, Text} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // You can change to MaterialIcons, FontAwesome, etc.
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

import ParentHomeScreen from '../screens/parents/ParentHomeScreen';
import VideoChannelAll from '../screens/parents/VideoChannelAll';
import ParentPlaylistScreen from '../screens/parents/ParentPlaylistScreen';
import ParentProfileScreen from '../screens/parents/ParentProfileScreen';
import AppColors from '../utils/AppColors';

const Tab = createBottomTabNavigator();

const LogoutButton = ({navigation, onLogout}) => {
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.clear();
          onLogout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{marginRight: 16}}>
      <Icon name="log-out-outline" size={24} color={AppColors.theme} />
    </TouchableOpacity>
  );
};

const ParentsBottomTabNavigator = ({onLogout}) => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerRight: () => {
          return <LogoutButton navigation={navigation} onLogout={onLogout} />;
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 60,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: {width: 0, height: -2},
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarActiveTintColor: AppColors.theme,
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Channel Video':
              iconName = focused ? 'albums' : 'albums-outline';
              break;
            case 'Playlist':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Icon name={iconName} size={22} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={ParentHomeScreen} />
      <Tab.Screen name="Channel Video" component={VideoChannelAll} />
      <Tab.Screen name="Playlist" component={ParentPlaylistScreen} />
      <Tab.Screen name="Profile" component={ParentProfileScreen} />
    </Tab.Navigator>
  );
};

export default ParentsBottomTabNavigator;
