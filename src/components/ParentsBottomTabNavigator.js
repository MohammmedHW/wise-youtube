import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AppColors from '../utils/AppColors';

import ParentHomeScreen from '../screens/parents/ParentHomeScreen';
import VideoChannelAll from '../screens/parents/VideoChannelAll';
import ParentPlaylistScreen from '../screens/parents/ParentPlaylistScreen';
import ParentProfileScreen from '../screens/parents/ParentProfileScreen';

const Tab = createBottomTabNavigator();

const ParentsBottomTabNavigator = ({ onLogout }) => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 16 }} onPress={onLogout}>
            <Icon name="log-out-outline" size={24} color={AppColors.theme} />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 60,
          paddingBottom: 4,
        },
        tabBarActiveTintColor: '#000', // text color always black
        tabBarInactiveTintColor: '#000',
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
        tabBarIcon: ({ focused }) => {
          let outlineName, fillName;
          switch (route.name) {
            case 'Home':
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
            <View>
              {/* Filled icon (yellow when active, transparent otherwise) */}
              <Icon
                name={fillName}
                size={22}
                color={focused ? '#4B0082' : 'transparent'}
                style={StyleSheet.absoluteFill}
              />
              {/* Outline icon (always black) */}
              <Icon name={outlineName} size={22} color="#000" />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={ParentHomeScreen} />
      <Tab.Screen name="Channel Video" component={VideoChannelAll} />
      <Tab.Screen name="Playlist" component={ParentPlaylistScreen} />
      <Tab.Screen name="Profile" component={ParentProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ParentsBottomTabNavigator;
