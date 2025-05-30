import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Playlist} from '../../services';
import {useRoute} from '@react-navigation/native';
import axios from 'axios';
import {config} from '../../../config';
import AppColors from '../../utils/AppColors';
import AppFonts from '../../utils/AppFonts';
import YoutubePlayer from 'react-native-youtube-iframe';
import DraggableFlatList from 'react-native-draggable-flatlist';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Alert} from 'react-native';

const getYouTubeVideoDetails = async videoId => {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${config.cli.api_key}`;
  try {
    const response = await axios.get(url);
    const videoData = response.data.items[0].snippet;
    return {
      title: videoData.title,
      thumbnail: videoData.thumbnails.high.url,
      description: videoData.description,
    };
  } catch (error) {
    console.error('Error fetching video details from YouTube:', error);
    return {
      title: 'Unknown Video',
      thumbnail: '',
      description: 'No Description Available',
    };
  }
};

export default function PlaylistDetails() {
  const route = useRoute();
  const {playlistId, source = 'custom'} = route.params;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noVideosMessage, setNoVideosMessage] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playlistStorageKey = `playlist_order_${playlistId}`;
  const playerRef = useRef(null);

  useEffect(() => {
    fetchPlaylistDetails();
  }, []);

  const fetchPlaylistDetails = async () => {
    try {
      let videoDetails = [];

      // Fetch playlist videos from YouTube API
      if (source === 'youtube') {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=20&playlistId=${playlistId}&key=${config.cli.api_key}`;
        const response = await axios.get(url);
        const items = response.data.items;

        videoDetails = items.map(item => {
          const snippet = item.snippet;
          const videoId = snippet?.resourceId?.videoId;
          return {
            key: videoId,
            videoId,
            videoLink: `https://www.youtube.com/watch?v=${videoId}`,
            title: snippet?.title || 'Unknown Title',
            description: snippet?.description || '',
            thumbnail: snippet?.thumbnails?.high?.url || '',
          };
        });
      } else {
        // Fetch playlist details from custom API (if not from YouTube directly)
        const email = await AsyncStorage.getItem('userUserName');
        const response = await Playlist.getPlaylistDetails({
          email_id: email,
          playlist_id: playlistId,
        });

        if (response.status === 'success') {
          const videoDetailsPromises = response.videos.map(async video => {
            const link = video.video_link;
            const MyvideoId = video.video_id;
            // If it's a YouTube video link
            if (link.includes('watch?v=')) {
              const videoId = link.split('v=')[1].split('&')[0];
              const details = await getYouTubeVideoDetails(videoId);
              return {
                key: videoId,
                videoId,
                videoLink: link,
                MyvideoId,
                ...details,
              };
            }
            // If it's a nested YouTube playlist link
            else if (link.includes('playlist?list=')) {
              const playlistId = link.split('list=')[1].split('&')[0];
              const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=20&playlistId=${playlistId}&key=${config.cli.api_key}`;

              try {
                const response = await axios.get(playlistUrl);
                const items = response.data.items;

                return items.map(item => {
                  const snippet = item.snippet;
                  const videoId = snippet?.resourceId?.videoId;

                  return {
                    key: videoId,
                    videoId,
                    videoLink: `https://www.youtube.com/watch?v=${videoId}`,
                    title: snippet?.title || 'Unknown Title',
                    description: snippet?.description || '',
                    thumbnail: snippet?.thumbnails?.high?.url || '',
                  };
                });
              } catch (err) {
                console.error('Failed to fetch nested playlist:', err);
                return [];
              }
            }

            return null;
          });

          const results = await Promise.all(videoDetailsPromises);
          videoDetails = results.flat().filter(Boolean);
        }
      }

      // Reordering the videos as per saved order
      const saved = await AsyncStorage.getItem(playlistStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedIds = parsed.map(v => v.videoId);
        const reordered = savedIds
          .map(id => videoDetails.find(v => v.videoId === id))
          .filter(Boolean);
        const remaining = videoDetails.filter(
          v => !savedIds.includes(v.videoId),
        );
        setVideos([...reordered, ...remaining]);
      } else {
        setVideos(videoDetails);
      }

      setNoVideosMessage(videoDetails.length === 0 ? 'No videos found.' : '');
    } catch (error) {
      console.error('Error:', error);
      setNoVideosMessage('Error fetching playlist.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = () => {
    const index = videos.findIndex(v => v.videoId === currentVideoId);
    if (index < videos.length - 1) {
      setCurrentVideoId(videos[index + 1].videoId);
    }
  };

  const renderItem = ({item, index, drag, isActive}) => (
    <View
      style={[
        styles.videoItem,
        isActive && {backgroundColor: '#ddd'},
        currentVideoId === item.videoId && styles.highlightedVideo,
      ]}>
      <TouchableOpacity
        style={{flexDirection: 'row', flex: 1}}
        activeOpacity={0.8}
        onPress={() => {
          setCurrentVideoId(item.videoId);
          setIsPlaying(true);
        }}>
        {item.thumbnail ? (
          <Image source={{uri: item.thumbnail}} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailText}>No Thumbnail</Text>
          </View>
        )}

        <View style={styles.videoInfo}>
          <Text
            style={[
              styles.videoTitle,
              currentVideoId === item.videoId && styles.highlightedText,
            ]}>
            {item.title.length > 30
              ? item.title.slice(0, 30) + '...'
              : item.title}
          </Text>
          <Text
            style={[
              styles.videoDescription,
              currentVideoId === item.videoId && styles.highlightedText,
            ]}>
            {item.description.length > 60
              ? item.description.slice(0, 60) + '...'
              : item.description}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Show delete button only if MyvideoId is present */}
      {item.MyvideoId && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={e => {
            e.stopPropagation(); // Prevent drag event propagation
            Alert.alert(
              'Delete Video',
              'Are you sure you want to delete this video?',
              [
                {text: 'No', onPress: () => {}, style: 'cancel'},
                {
                  text: 'Yes',
                  onPress: () => deleteVideo(item.MyvideoId), // Use MyvideoId for deletion
                },
              ],
              {cancelable: false},
            );
          }}>
          <MaterialIcons name="delete" size={22} color="red" />
        </TouchableOpacity>
      )}

      {/* Drag Handle */}
      <TouchableOpacity
        onPressIn={drag}
        style={styles.dragHandle}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Ionicons name="reorder-three-outline" size={24} color="#999" />
      </TouchableOpacity>
    </View>
  );

  const deleteVideo = async MyvideoId => {
    try {
      const response = await fetch(
        'http://timesride.com/custom/DeletePlayListAndVideo.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_id: MyvideoId.toString(),
          }),
        },
      );

      const result = await response.json();

      if (result.status === 'success') {
        await fetchPlaylistDetails();
        Alert.alert('Success', 'Video deleted successfully.');
      } else {
        Alert.alert('Error', 'Failed to delete video.');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      Alert.alert('Error', 'An error occurred while deleting the video.');
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: AppColors.white}}>
      <StatusBar backgroundColor={AppColors.white} barStyle={'dark-content'} />
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={AppColors.theme}
            style={{flex: 1, justifyContent: 'center'}}
          />
        ) : noVideosMessage ? (
          <Text style={styles.noVideosMessage}>{noVideosMessage}</Text>
        ) : (
          <View style={{flex: 1}}>
            {isPlaying && currentVideoId && (
              <YoutubePlayer
                height={220}
                play={isPlaying}
                videoId={currentVideoId}
                onChangeState={event => {
                  if (event === 'ended') {
                    handleEnd();
                  }
                }}
                webViewProps={{setSupportMultipleWindows: false}}
                webViewStyle={styles.webViewStyle}
              />
            )}
            <View style={{padding: 8, flex: 1}}>
              <DraggableFlatList
                data={videos}
                onDragEnd={({data}) => {
                  setVideos(data);
                  AsyncStorage.setItem(
                    playlistStorageKey,
                    JSON.stringify(data),
                  ).catch(err =>
                    console.error('Failed to save reordered playlist:', err),
                  );
                }}
                keyExtractor={item => item.videoId.toString()}
                renderItem={renderItem}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  videoItem: {
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: 110,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    width: 110,
    height: 80,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 12,
  },
  thumbnailText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontFamily: AppFonts.Medium,
    color: '#222',
  },
  videoDescription: {
    fontSize: 12,
    color: '#555',
    fontFamily: AppFonts.Regular,
    marginTop: 4,
    lineHeight: 18,
  },
  noVideosMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
  highlightedVideo: {
    backgroundColor: AppColors.theme,
  },
  highlightedText: {
    color: 'white',
    fontFamily: AppFonts.Medium,
  },
  webViewStyle: {
    marginBottom: 16,
  },
  dragHandle: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  deleteButton: {
    marginLeft: 10,
    paddingLeft: 10,
  },
});
