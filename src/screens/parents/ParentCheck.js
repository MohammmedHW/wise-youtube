import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Channel } from '../../services';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useIsFocused } from '@react-navigation/native';

const ParentCheck = () => {
  const [channelList, setChannelList] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getChannelList();
    }
  }, [isFocused]);

  const getChannelList = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const result = await Channel.getChannelList(token);
      setChannelList(result?.data);
    } catch (err) {
      console.error(err, 'error');
    }
    setLoading(false);
  };

  const handleRefresh = useCallback(() => {
    getChannelList();
  }, []);

  const handleDeleteChannel = async (channelId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await Channel.deleteChannel(token, channelId._id);
      setChannelList(channelList.filter(channel => channel.channelId !== channelId));
      Alert.alert('ChannelList Deleted!', `${channelId.channelName} deleted from your List Successfully`);
      await getChannelList();
    } catch (err) {
      Alert.alert("Error!", "Error while deleting");
      console.error(err, 'error');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={[styles.scrollView, { paddingRight: 10 }]}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          channelList.map((item, index) => (
            <View key={index} style={styles.touchable}>
              <View style={[styles.card, { backgroundColor: '#3498db' }]}>
                <Text style={[styles.cardText, { color: 'white' }]}>{item.channelName}</Text>
                <Text style={{ color: 'white' }}>ID: {item.channelId}</Text>
                <TouchableOpacity onPress={() => handleDeleteChannel(item)} style={{ position: 'absolute', right: 10, top: 10 }}>
                  <AntDesign name="delete" style={{ color: 'white', fontSize: 24 }} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
        <AntDesign name="sync" style={{ color: 'white', fontSize: 24 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scrollView: {
    flex: 1,
  },
  touchable: {
    marginVertical: 5,
    borderRadius: 5,
  },
  card: {
    padding: 10,
    backgroundColor: '#3498db',
    marginBottom: 10,
    height: 100,
    borderRadius: 10,
    position: 'relative',
  },
  cardText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3498db',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ParentCheck;
