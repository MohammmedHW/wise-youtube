import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Playlist} from '../../services';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import AppLoader from '../../components/AppLoader';
import AppColors from '../../utils/AppColors';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AppFonts from '../../utils/AppFonts';

export default function ParentCreatePlaylistScreen() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      fetchPlaylists();
      return () => {};
    }, []),
  );

  const fetchPlaylists = async () => {
    try {
      const email = await AsyncStorage.getItem('userUserName');
      if (!email) {
        Alert.alert('Error', 'Email not found in storage');
        return;
      }

      const data = await Playlist.getAllPlaylist(email);
      setPlaylists(data?.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load playlists');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true); // Activate the spinner when refreshing
    fetchPlaylists(); // Fetch the playlists again on refresh
  };

  const createPlaylist = async () => {
    try {
      const email = await AsyncStorage.getItem('userUserName');
      if (!email) {
        Alert.alert('Error', 'Email not found in storage');
        return;
      }

      const response = await Playlist.createPlaylist({
        email_id: email,
        playlist_Name: playlistName,
      });

      if (response?.status === 'success') {
        Alert.alert(
          'Success',
          response.message || 'Playlist created successfully',
        );
        fetchPlaylists();
        setModalVisible(false);
      } else {
        Alert.alert('Error', response?.message || 'Failed to create playlist');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create playlist');
      console.error('Error creating playlist:', error);
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('PlayList Details', {
          playlistId: item.playlist_id,
          playlistName: item.playlist_Name,
        });
      }}>
      <View style={styles.card}>
        <View style={styles.thumbnail}>
          <SimpleLineIcons name="playlist" size={24} color={AppColors.theme} />
        </View>

        <View style={{flex: 1}}>
          {/* Title and Delete Icon in Row */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{item.playlist_Name}</Text>

            {/* Delete Button (Bin Icon) */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={e => {
                e.stopPropagation(); // Prevent event from bubbling to parent
                Alert.alert(
                  'Delete Playlist',
                  'Are you sure you want to delete this playlist?',
                  [
                    {text: 'No', onPress: () => {}, style: 'cancel'},
                    {
                      text: 'Yes',
                      onPress: () => deletePlaylist(item.playlist_id),
                    },
                  ],
                  {cancelable: false},
                );
              }}>
              <Icon name="delete" size={20} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Uploaded At: {moment(item.created_at).format('DD/MM/YYYY')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const deletePlaylist = async playlistId => {
    try {
      const response = await fetch(
        'http://timesride.com/custom/DeletePlayListAndVideo.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playlist_id: playlistId.toString(),
          }),
        },
      );

      const result = await response.json();

      if (result.status === 'success') {
        await fetchPlaylists();
        Alert.alert('Success', 'Playlist deleted successfully.');
      } else {
        Alert.alert('Error', 'Failed to delete playlist.');
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      Alert.alert('Error', 'An error occurred while deleting the playlist.');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <AppLoader />
      ) : playlists.length > 0 ? (
        <View style={{flex: 1}}>
          <FlatList
            data={playlists}
            keyExtractor={(item, index) =>
              item.playlist_id?.toString() || index.toString()
            }
            renderItem={renderItem}
            contentContainerStyle={{paddingBottom: 20}}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[AppColors.theme]}
                tintColor={AppColors.theme}
              />
            }
          />
        </View>
      ) : (
        <Text style={styles.noData}>No playlists found.</Text> // Show when no playlists
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}>
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal for New Playlist */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Playlist Name"
              value={playlistName}
              onChangeText={setPlaylistName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={createPlaylist}>
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#fff'},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 120,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: '#222',
    fontFamily: AppFonts.Medium,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#555',
    fontFamily: AppFonts.Light,
  },
  titleContainer: {
    flexDirection: 'row', // Align title and delete icon horizontally
    justifyContent: 'space-between', // Space between title and bin icon
    alignItems: 'center', // Center both vertically
  },
  deleteButton: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10, // Space between title and bin icon
  },
  noData: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: AppColors.theme,
    borderRadius: 50,
    padding: 15,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: AppColors.theme,
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
