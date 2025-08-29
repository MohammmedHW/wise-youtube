import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist } from '../../services';
import AppLoader from '../../components/AppLoader';
import AppColors from '../../utils/AppColors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AppFonts from '../../utils/AppFonts';
import Ionicons from 'react-native-vector-icons/Ionicons';


const ICON_OPTIONS = [
  'book-outline',
  'musical-notes-outline',
  'videocam-outline',
  'lock-closed-outline',
  'folder-outline',
  'film-outline',
  'image-outline',
  'headset-outline',
];

export default function ParentPlaylistScreen() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [iconMap, setIconMap] = useState({});

  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      fetchPlaylists();
    }, [])
  );


const fetchPlaylistDetails = async (playlistId) => {
  try {
    const email = await AsyncStorage.getItem('userUserName');
    if (!email) {
      return { status: 'error', videos: [] };
    }

    const response = await Playlist.getPlaylistDetails({
      email_id: email,
      playlist_id: playlistId,
    });

    if (response.status === 'success') {
      const items = response.videos || [];
      const videoDetails = items.map((item) => {
        const ytId = getYouTubeId(item.video_link);  // ✅ fixed
        return {
          key: item.video_id,
          videoId: item.video_id,
          videoLink: item.video_link,
          title: item.title || 'Unknown Title',
          description: item.description || '',
          thumbnail: ytId
            ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
            : '',
        };
      });

      console.log("✅ Mapped Videos:", videoDetails);
      return { status: 'success', videos: videoDetails };
    }

    return { status: 'error', videos: [] };
  } catch (err) {
    console.log('Error fetching playlist videos:', err);
    return { status: 'error', videos: [] };
  }
};


  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem('userUserName');
      if (!email) {
        Alert.alert('Error', 'Email not found in storage');
        return;
      }

      const data = await Playlist.getAllPlaylist(email);
      let list = data?.data || [];

      // Fetch details (videos) for each playlist
      const detailedList = await Promise.all(
        list.map(async (p) => {
          const details = await fetchPlaylistDetails(p.playlist_id);
          if (details?.status === 'success') {
            return { ...p, videos: details.videos || [] };
          }
          return { ...p, videos: [] };
        })
      );

      setPlaylists(detailedList);

      const storedIcons = await AsyncStorage.getItem('playlistIcons');
      if (storedIcons) setIconMap(JSON.parse(storedIcons));
    } catch {
      Alert.alert('Error', 'Failed to load playlists');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const saveIconMap = async (newMap) => {
    setIconMap(newMap);
    await AsyncStorage.setItem('playlistIcons', JSON.stringify(newMap));
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlaylists();
  };

  const createPlaylist = async () => {
    try {
      if (!playlistName.trim()) {
        Alert.alert('Error', 'Playlist name is required');
        return;
      }
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
        Alert.alert('Success', response.message || 'Playlist created successfully');
        setModalVisible(false);
        setPlaylistName('');
        setSelectedIcon(ICON_OPTIONS[0]);

        await fetchPlaylists();
        const newList = await Playlist.getAllPlaylist(email);
        const newlyAdded = newList?.data?.find(
          (p) => p.playlist_Name === playlistName
        );
        if (newlyAdded?.playlist_id) {
          const updatedMap = { ...iconMap, [newlyAdded.playlist_id]: selectedIcon };
          await saveIconMap(updatedMap);
        }
      } else {
        Alert.alert('Error', response?.message || 'Failed to create playlist');
      }
    } catch {
      Alert.alert('Error', 'Failed to create playlist');
    }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      setLoading(true);
      const response = await fetch(
        'http://timesride.com/custom/DeletePlayListAndVideo.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlist_id: playlistId.toString() }),
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        const newMap = { ...iconMap };
        delete newMap[playlistId];
        await saveIconMap(newMap);
        fetchPlaylists();
        Alert.alert('Success', 'Playlist deleted successfully.');
      } else {
        Alert.alert('Error', 'Failed to delete playlist.');
      }
    } catch {
      Alert.alert('Error', 'An error occurred while deleting the playlist.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Extract YouTube ID
  const getYouTubeId = (url) => {
    const match = url?.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/);
    return match ? match[1] : null;
  };

  const renderItem = ({ item }) => {
  const videoCount = item.videos?.length || 0;
  const firstVideo = item.videos?.[0];

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("PlayList Details", {
          playlistId: item.playlist_id,
          playlistName: item.playlist_Name,
        });
      }}
      delayLongPress={2000}
      onLongPress={() => {
        Alert.alert(
          "Delete Playlist",
          `Are you sure you want to delete "${item.playlist_Name}"?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => deletePlaylist(item.playlist_id),
            },
          ]
        );
      }}
      activeOpacity={0.85}
      style={styles.card}
    >
      {videoCount > 0 && firstVideo?.thumbnail ? (
        <>
          <Image
            source={{ uri: firstVideo.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.textWrapper}>
            <Text style={styles.title} numberOfLines={1}>
              {item.playlist_Name}
            </Text>
            <Text style={styles.count}>
              {videoCount > 0 ? `${videoCount} videos` : "No videos"}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyWrapper}>
          <Ionicons name="folder-outline" size={50} color={AppColors.theme} />
          <Text style={styles.title} numberOfLines={1}>
            {item.playlist_Name}
          </Text>
          <Text style={styles.count}>
            {videoCount > 0 ? `${videoCount} videos` : "No videos"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};


  return (
    <View style={styles.container}>
      {loading ? (
        <AppLoader />
      ) : playlists.length > 0 ? (
        <FlatList
          data={playlists}
          keyExtractor={(item, index) =>
            item.playlist_id?.toString() || index.toString()
          }
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[AppColors.theme]}
              tintColor={AppColors.theme}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[AppColors.theme]}
              tintColor={AppColors.theme}
            />
          }
        >
          <Text style={styles.noData}>No playlists found</Text>
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Create Playlist Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              placeholder="Playlist Name"
              style={styles.input}
              value={playlistName}
              onChangeText={setPlaylistName}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={createPlaylist}>
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
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },

  // Playlist Card
  card: {
  flex: 0.48,
  marginBottom: 16,
  borderRadius: 14,
  backgroundColor: "#fafafa",
  overflow: "hidden",

  // iOS shadow
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.1,
  shadowRadius: 6,

  // Android shadow
  elevation: 3,
},


  thumbnail: {
    width: "100%",
    height: 140,
  },

  textWrapper: {
    padding: 10,
    alignItems: "center",
  },

  emptyWrapper: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    height: 180,
  },

  title: {
    fontSize: 16,
    fontFamily: AppFonts.Medium,
    color: "#000",
    marginTop: 6,
    textAlign: "center",
  },

  count: {
    fontSize: 13,
    color: "#555",
    fontFamily: AppFonts.Light,
    marginTop: 2,
    textAlign: "center",
  },

  // Floating Action Button
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: AppColors.theme,
    borderRadius: 30,
    padding: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    width: 320,
    borderRadius: 12,
  },

  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },

  modalActions: { flexDirection: "row", justifyContent: "space-between" },

  modalButton: {
    backgroundColor: AppColors.theme,
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },

  modalButtonText: { color: "#fff", fontWeight: "bold" },

  noData: { fontSize: 16, color: "#999" },
});
