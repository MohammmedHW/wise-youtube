import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import AppFonts from '../utils/AppFonts';
import AppColors from '../utils/AppColors';

const PlaylistBottomSheet = ({
  playlistSheetRef,
  playlists,
  handleAddToPlaylist,
  fetchPlaylists,
  loading,
  onAddPlaylist,
}) => {
  const navigation = useNavigation();

  const handleAddPlaylistClick = () => {
    navigation.navigate('Playlist');
    if (onAddPlaylist) onAddPlaylist();
  };

  return (
    <RBSheet
      ref={playlistSheetRef}
      closeOnPressMask={true}
      height={300}
      customStyles={{
        container: {
          padding: 20,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          backgroundColor: 'white',
        },
      }}>
      {/* Title */}
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <MaterialIcons name="playlist-play" size={24} color="#333" />
        <Text
          style={{
            fontSize: 16,
            fontFamily: AppFonts.SemiBold,
            marginLeft: 10,
            color: '#333',
          }}>
          Select a Playlist
        </Text>
      </View>

      {/* Content Area */}
      <View style={{flex: 1, marginTop: 20}}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={AppColors.theme}
            style={{alignSelf: 'center', marginTop: 40}}
          />
        ) : playlists && playlists.length === 0 ? (
          <TouchableOpacity
            onPress={handleAddPlaylistClick}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              justifyContent: 'center',
            }}>
            <MaterialIcons name="add" size={20} color="#333" />
            <Text
              style={{
                fontSize: 16,
                marginLeft: 10,
                color: '#333',
                fontFamily: AppFonts.SemiBold,
              }}>
              Create Playlist
            </Text>
          </TouchableOpacity>
        ) : (
          <ScrollView>
            {playlists.map(playlist => (
              <TouchableOpacity
                key={playlist.playlist_id}
                onPress={() => handleAddToPlaylist(playlist.playlist_id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: '#ddd',
                }}>
                <MaterialIcons name="playlist-add" size={24} color="#333" />
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 10,
                    color: '#333',
                    fontFamily: AppFonts.Regular,
                  }}>
                  {playlist.playlist_Name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </RBSheet>
  );
};

export default PlaylistBottomSheet;
