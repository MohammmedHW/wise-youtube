import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import AppColors from '../utils/AppColors';

import HomeScreen from '../screens/HomeScreen';
import ParentHomeScreen from '../screens/parents/ParentHomeScreen';
import VideoChannelAll from '../screens/parents/VideoChannelAll';
import ParentPlaylistScreen from '../screens/parents/ParentPlaylistScreen';
import ParentProfileScreen from '../screens/parents/ParentProfileScreen';
import CategoryScreen from '../screens/CategoryScreen';
import VideosScreen from '../screens/VideosScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator for Select Category tab
const SelectCategoryStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
      <Stack.Screen name="ParentHomeScreen" component={ParentHomeScreen} />
      <Stack.Screen name="VideosScreen" component={VideosScreen} />
    </Stack.Navigator>
  );
};

const ParentsBottomTabNavigator = ({onLogout}) => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: route.name !== 'Select Category',
        headerRight: () => (
          <TouchableOpacity style={{marginRight: 16}} onPress={onLogout}>
            <Icon name="log-out-outline" size={24} color={AppColors.theme} />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarActiveTintColor: AppColors.darkGray,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 2,
          marginTop: 4,
        },
        tabBarIcon: ({focused}) => {
          let outlineName, fillName;
          switch (route.name) {
            case 'Select Category':
              outlineName = 'home-outline';
              fillName = 'home';
              break;
            case 'Channel Video':
              outlineName = 'videocam-outline';
              fillName = 'videocam';
              break;
            case 'Playlist':
              outlineName = 'musical-notes-outline';
              fillName = 'musical-notes';
              break;
            case 'Profile':
              outlineName = 'person-outline';
              fillName = 'person';
              break;
            default:
              outlineName = 'ellipse-outline';
              fillName = 'ellipse';
          }

          return (
            <View
              style={[
                styles.iconContainer,
                focused && styles.activeIconContainer,
              ]}>
              <View
                style={focused ? styles.activeIconWrapper : styles.iconWrapper}>
                <Icon
                  name={focused ? fillName : outlineName}
                  size={focused ? 26 : 24}
                  color={focused ? '#fff' : '#8E8E93'}
                />
              </View>
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
      })}>
      <Tab.Screen name="Select Category" component={SelectCategoryStack} />
      <Tab.Screen name="Channel Video" component={VideoChannelAll} />
      <Tab.Screen name="Playlist" component={ParentPlaylistScreen} />
      <Tab.Screen name="Profile" component={ParentProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  activeIconContainer: {
    // transform: [{translateY: -5}],
  },
  activeIconWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: AppColors.theme,
    shadowColor: AppColors.theme,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // activeIndicator: {
  //   width: 6,
  //   height: 6,
  //   borderRadius: 3,
  //   backgroundColor: '#9370DB',
  //   marginTop: 4,
  // },
});

export default ParentsBottomTabNavigator;
