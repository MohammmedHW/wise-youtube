import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
  TouchableHighlight,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Channel, Playlist} from '../../services';
import {config} from '../../../config';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppLoader from '../../components/AppLoader';
import OptionsBottomSheet from '../../components/OptionsBottomSheet';
import PlaylistBottomSheet from '../../components/PlaylistBottomSheet';

function ChannelVideos({route}) {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [pageToken, setPageToken] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const uploadsPlaylistId = useRef('');
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const API_KEY = config.cli.api_key;

  const sheetRef = useRef(null);
  const playlistSheetRef = useRef(null);

  useEffect(() => {
    const channelId = route?.params?.channelId;
    if (channelId) {
      uploadsPlaylistId.current = '';
      setVideos([]);
      getVideosByChannelId(channelId);
    }
  }, []);

  const getVideosByChannelId = async (channelId, page = '') => {
    try {
      if (!uploadsPlaylistId.current) {
        const channelRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`,
        );
        const channelData = await channelRes.json();
        const playlistId =
          channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (!playlistId) {
          Alert.alert('Error', 'Could not find uploads playlist.');
          return;
        }

        uploadsPlaylistId.current = playlistId;
      }

      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${uploadsPlaylistId.current}&pageToken=${page}&key=${API_KEY}`,
      );
      const videosData = await videosRes.json();

      setVideos(prev => [...prev, ...(videosData.items || [])]);
      setPageToken(videosData.nextPageToken || '');
    } catch (err) {
      console.error('Error loading videos:', err);
      Alert.alert('Error', 'Could not load videos.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}) => {
    const videoId = item?.snippet?.resourceId?.videoId;
    if (!videoId) return null;

    return (
      <View
        style={{
          flex: 1,
          marginVertical: 6,
          backgroundColor: 'white',
          overflow: 'hidden',
        }}>
        <TouchableHighlight
          style={{width: '100%'}}
          onPress={() => navigation.navigate('Add Video', {videoId})}>
          <Image
            source={{uri: item.snippet?.thumbnails?.medium?.url}}
            style={{
              width: '100%',
              height: 200,
              resizeMode: 'cover',
            }}
          />
        </TouchableHighlight>
        <View style={{flexDirection: 'row', padding: 10, alignItems: 'center'}}>
          <View style={{flex: 1}}>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 16,
                color: '#222',
                fontFamily: 'Roboto-Medium',
              }}>
              {item.snippet?.title}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: '#666',
                marginTop: 2,
                fontFamily: 'Roboto-Regular',
              }}>
              {item.snippet?.channelTitle}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setSelectedVideoId(item.snippet?.resourceId?.videoId);
              sheetRef.current.open();
            }}>
            <MaterialIcons name="more-vert" size={24} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const fetchPlaylists = async () => {
    setLoadingPlaylists(true); // Start loading

    const email = await AsyncStorage.getItem('userUserName');
    try {
      const response = await Playlist.getAllPlaylist(email);
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setPlaylists([]); // Optional fallback
    } finally {
      setLoadingPlaylists(false); // Stop loading
    }
  };

  const handleAddToPlaylist = async playlistId => {
    const email = await AsyncStorage.getItem('userUserName');

    const data = {
      email_id: email,
      video_link: `https://www.youtube.com/watch?v=${selectedVideoId}`,
      playlist_id: String(playlistId),
    };

    try {
      const resp = await Playlist.addToPlaylist(data);
      if (resp.status === 'success') {
        await playlistSheetRef.current.close();
        Alert.alert('Success', resp.message);
      } else {
        Alert.alert('Error', 'Failed to add video to playlist');
      }
    } catch (err) {
      console.error('Error adding to playlist:', err);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      {loading ? (
        <AppLoader message="Loading videos..." />
      ) : (
        <>
          <View style={{padding: 10}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>
              {videos[0]?.snippet?.channelTitle}
            </Text>
          </View>

          <FlatList
            data={videos}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              item?.snippet?.resourceId?.videoId || index.toString()
            }
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (pageToken && !loadingMore) {
                setLoadingMore(true);
                getVideosByChannelId(route.params.channelId, pageToken).then(
                  () => setLoadingMore(false),
                );
              }
            }}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="large"
                  color="#888"
                  style={{marginVertical: 20}}
                />
              ) : null
            }
            contentContainerStyle={{paddingBottom: 20}}
          />
        </>
      )}

      <OptionsBottomSheet
        sheetRef={sheetRef}
        fetchPlaylists={fetchPlaylists}
        openPlaylistSheet={() => playlistSheetRef.current.open()}
        selectedVideoId={selectedVideoId}
      />

      <PlaylistBottomSheet
        playlistSheetRef={playlistSheetRef}
        playlists={playlists}
        handleAddToPlaylist={handleAddToPlaylist}
        loading={loadingPlaylists}
      />
    </View>
  );
}

export default ChannelVideos;
