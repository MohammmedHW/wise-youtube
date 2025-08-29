import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  Button,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  TouchableHighlight,
} from 'react-native';
import {Dimensions} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import YoutubePlayer from 'react-native-youtube-iframe';
import {Playlist, Video} from '../../services';
import {Dropdown} from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppColors from '../../utils/AppColors';
import AppFonts from '../../utils/AppFonts';
import AppLoader from '../../components/AppLoader';
import {config} from '../../../config';
import getLocaleInfo from '../../utils/getLocaleInfo';
import OptionsBottomSheet from '../../components/OptionsBottomSheet';
import PlaylistBottomSheet from '../../components/PlaylistBottomSheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // top of file

function ParentVideoDetailScreen({route}) {
  const navigation = useNavigation();
  const {videoId, comingFrom} = route.params;
  console.log('TCL: ParentVideoDetailScreen -> comingFrom', comingFrom);
  const [videoDetails, setVideoDetails] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [playlistId, setPlaylistId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [relatedNextPage, setRelatedNextPage] = useState(null);
  const [loadingMoreRelated, setLoadingMoreRelated] = useState(false);
  const API_KEY = config.cli.api_key;
  const {regionCode, languageCode} = getLocaleInfo();
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [selectedVideoId, setselectedVideoId] = useState(false);
  const sheetRef = useRef(null); // Reference for the options bottom sheet
  const playlistSheetRef = useRef(null); // Reference for the playlist bottom sheet

  const screenWidth = Dimensions.get('window').width;
  const playerHeight = (screenWidth * 9) / 16; // 16:9 aspect ratio
  useEffect(() => {
    getVideoDetails(videoId);
    setRelatedNextPage(null);
    fetchPlaylists();
    getRelatedVideos(videoId);
  }, [videoId]);

  const getVideoDetails = async videoId => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`,
      );
      const result = await res.json();
			console.log("TCL: ParentVideoDetailScreen -> result", result)
      setVideoDetails(result?.items[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const email = await AsyncStorage.getItem('userUserName');

      if (!email) {
        Alert.alert('Error', 'Email not found in storage');
        return;
      }

      const data = await Playlist.getAllPlaylist(email);
      // Assuming response like: { status: "success", data: [...] }
      setPlaylist(data?.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load playlists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlaylist = async playlistId => {
    console.log('ParentVideoDetailScreen.js');
    try {
      const email = await AsyncStorage.getItem('userUserName');
      const isYouTubePlaylist =
        selectedVideoId?.startsWith('PL') || selectedVideoId?.includes('list=');
      console.log('before the playlist if condition check');
      console.log(selectedVideoId);
      if (isYouTubePlaylist) {
        // Extract playlist ID from the URL
        const youtubePlaylistId = selectedVideoId.includes('list=')
          ? selectedVideoId.split('list=')[1].split('&')[0]
          : selectedVideoId;

        // First, fetch all videos from the YouTube playlist
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${youtubePlaylistId}&key=${API_KEY}`,
        );
        console.log('playlist Id', youtubePlaylistId);
        console.log('response', response);
        const data = await response.json();
        console.log('data', data);

        if (data.items && data.items.length > 0) {
          // Show loading message
          Alert.alert(
            'Adding Videos',
            'Please wait while we add all videos...',
          );

          // Add each video individually
          const addPromises = data.items.map(async item => {
            const videoId = item.snippet.resourceId.videoId;
            const video_link = `https://www.youtube.com/watch?v=${videoId}`;

            const addData = {
              email_id: email,
              video_link,
              playlist_id: String(playlistId),
            };

            return Playlist.addToPlaylist(addData);
          });

          // Wait for all videos to be added
          const results = await Promise.all(addPromises);
          const successCount = results.filter(
            r => r.status === 'success',
          ).length;

          await playlistSheetRef.current.close();
          Alert.alert(
            'Success',
            `Added ${successCount} out of ${data.items.length} videos to your playlist`,
          );
        } else {
          Alert.alert('Error', 'No videos found in the playlist');
        }
      } else {
        // Handle single video
        const video_link = `https://www.youtube.com/watch?v=${selectedVideoId}`;
        const data = {
          email_id: email,
          video_link,
          playlist_id: String(playlistId),
        };

        const resp = await Playlist.addToPlaylist(data);
        if (resp.status === 'success') {
          await playlistSheetRef.current.close();
          Alert.alert('Success', resp.message);
        } else {
          Alert.alert('Error', 'Failed to add video to playlist');
        }
      }
    } catch (err) {
      console.error('Error adding to playlist:', err);
      Alert.alert('Error', 'Failed to add videos to playlist');
    }
  };

  const getRelatedVideos = async (videoId, isLoadMore = false) => {
    console.log('TCL: getRelatedVideos -> videoId', videoId);
    try {
      if (isLoadMore) setLoadingMoreRelated(true);
      else setIsLoading(true);

      const detailsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`,
      );
      const detailsData = await detailsRes.json();
      console.log(
        'TCL: getRelatedVideos -> detailsData',
        JSON.stringify(detailsData),
      );

      let searchUrl = '';
      console.log('TCL: getRelatedVideos -> comingFrom', comingFrom);

      if (comingFrom == 'channel') {
        const channelId = detailsData.items[0].snippet.channelId;

        // Step 2: Fetch videos from that channel
        searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${API_KEY}${
          isLoadMore && relatedNextPage ? `&pageToken=${relatedNextPage}` : ''
        }`;
      } else {
        const categoryId = detailsData.items[0].snippet.categoryId;
        const videoTitle = detailsData.items[0].snippet.title;

        searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=${categoryId}&maxResults=10&regionCode=${regionCode}&q=${videoTitle
          .split(' ')
          .slice(0, 3)
          .join(' ')}&key=${API_KEY}${
          isLoadMore && relatedNextPage ? `&pageToken=${relatedNextPage}` : ''
        }`;
      }

      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      console.log(
        'TCL: getRelatedVideos -> searchData',
        JSON.stringify(searchData),
      );

      if (isLoadMore) {
        setRelatedVideos(prev => [
          ...prev,
          ...(Array.isArray(searchData?.items) ? searchData.items : []),
        ]);
      } else {
        setRelatedVideos(searchData.items || []);
      }

      setRelatedNextPage(searchData.nextPageToken || null);
    } catch (err) {
      console.error('Error fetching related videos:', err);
    } finally {
      if (isLoadMore) setLoadingMoreRelated(false);
      else setIsLoading(false);
    }
  };

  const addVideoToPlaylist = async () => {
    if (playlistId === '') {
      Alert.alert('Please Select Playlist');
      return;
    }
    const email = await AsyncStorage.getItem('userUserName'); // Ensure email is fetched correctly

    const data = {
      email_id: email,
      video_link: `https://www.youtube.com/watch?v=${videoId}`,
      playlist_id: String(playlistId),
    };
    try {
      const resp = await Playlist.addToPlaylist(data);
      if (resp.status === 'success') {
        Alert.alert('Success', resp.message);
      } else {
        Alert.alert('Error', 'Failed to add video to playlist');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#e5e5e5'}}>
      <YoutubePlayer
        height={playerHeight}
        videoId={videoId}
        play={true}
        webViewProps={{setSupportMultipleWindows: false}}
        initialPlayerParams={{
          rel: 0, // 'rel' = related videos
          modestbranding: true,
          controls: 1,
          showinfo: false,
        }}
        // initialPlayerParams={{ controls: false }}
      />
      <View style={{padding: 10}}>
        <Text style={styles.title}>{videoDetails?.snippet?.title}</Text>
        <Text style={styles.subtitle}>
          {videoDetails?.snippet?.channelTitle}
        </Text>
      </View>

      {playlist.length > 0 ? (
        <View style={styles.dropdownContainer}>
          <Dropdown
            style={[styles.dropdown, isFocus && {borderColor: 'blue'}]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={playlist.map(item => ({
              label: item.playlist_Name,
              value: item.playlist_id,
            }))}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Playlist' : '...'}
            searchPlaceholder="Search..."
            value={playlistId}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setPlaylistId(item.value);
              setIsFocus(false);
            }}
          />
          <TouchableOpacity
            style={{
              backgroundColor: AppColors.theme,
              padding: 10,
              height: 40,
              borderRadius: 8,
            }}
            onPress={addVideoToPlaylist}>
            <Text style={{color: AppColors.white, fontFamily: AppFonts.Medium}}>
              Add Video
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {relatedVideos.length > 0 && (
        <View style={{padding: 10}}>
          <Text style={styles.relatedTitle}>More Videos</Text>
          <FlatList
            data={relatedVideos}
            style={{marginBottom: 10}}
            keyExtractor={(item, index) => `${item.id?.videoId}-${index}`}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.relatedItem}
                onPress={() =>
                  navigation.replace('Add Video', {
                    videoId: item.id.videoId,
                    comingFrom: comingFrom ? comingFrom : '',
                  })
                }>
                <Image
                  source={{uri: item.snippet.thumbnails.medium.url}}
                  style={styles.relatedImage}
                />
                <View style={{flex: 1}}>
                  <Text numberOfLines={2} style={styles.relatedText}>
                    {item.snippet.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.relatedChannel}>
                    {item.snippet.channelTitle}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setselectedVideoId(item.id.videoId);
                    sheetRef.current.open();
                  }}>
                  <MaterialIcons name="more-vert" size={24} color="#555" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (relatedNextPage) {
                getRelatedVideos(videoId, true);
              }
            }}
            ListFooterComponent={
              loadingMoreRelated ? (
                <View
                  style={{
                    paddingVertical: 20,
                    alignItems: 'center',
                  }}>
                  <ActivityIndicator size="large" color={AppColors.theme} />
                </View>
              ) : null
            }
          />
        </View>
      )}
      {isLoading && <AppLoader message="Loading videos..." />}
      <OptionsBottomSheet
        sheetRef={sheetRef}
        fetchPlaylists={fetchPlaylists}
        openPlaylistSheet={() => playlistSheetRef.current.open()}
        selectedVideoId={selectedVideoId}
      />
      <PlaylistBottomSheet
        playlistSheetRef={playlistSheetRef}
        playlists={playlist}
        handleAddToPlaylist={handleAddToPlaylist}
        loading={loadingPlaylists}
      />
    </View>
  );
}

export default ParentVideoDetailScreen;

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    marginBottom: 5,
    color: AppColors.black,
    fontFamily: AppFonts.SemiBold,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    fontFamily: AppFonts.Regular,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  dropdown: {
    width: '70%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: AppFonts.Medium,
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: AppFonts.Medium,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  relatedTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: AppColors.black,
    fontFamily: AppFonts.Medium,
  },
  relatedItem: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  relatedImage: {
    width: 120,
    height: 70,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  relatedText: {
    color: AppColors.black,
    fontFamily: AppFonts.Regular,
  },
  relatedChannel: {
    color: '#666',
    fontFamily: AppFonts.Light,
  },
});
