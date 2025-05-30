import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AppLoader from '../../components/AppLoader';
import {config} from '../../../config';
import getLocaleInfo from '../../utils/getLocaleInfo';
import AppColors from '../../utils/AppColors';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppImage from '../../utils/AppImage';
import AppFonts from '../../utils/AppFonts';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import OptionsBottomSheet from '../../components/OptionsBottomSheet';
import PlaylistBottomSheet from '../../components/PlaylistBottomSheet';
import {Playlist} from '../../services';
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';
const API_KEY = config.cli.api_key;

export default function VideoChannelAll() {
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videoNextPage, setVideoNextPage] = useState(null);
  const [loadingMoreVideos, setLoadingMoreVideos] = useState(false);
  const {regionCode, languageCode} = getLocaleInfo();
  const [videoFilter, setVideoFilter] = useState('none');
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const sheetRef = useRef(null);
  const playlistSheetRef = useRef(null);
  const [playlists, setPlaylists] = useState([]);
  const navigation = useNavigation();
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  let alert = _data => new Promise(res => res);

  useFocusEffect(
    React.useCallback(() => {
      fetchSubscribedChannels();
    }, []),
  );
  const getUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId !== null) {
        return userId;
      }
    } catch (error) {
      console.error('Error getting userId from AsyncStorage', error);
    }
    return null;
  };

  const fetchSubscribedChannels = async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        console.log('User ID not found!');
        return;
      }

      const requestData = {
        action: 'GetData',
        userid: userId,
      };

      const response = await fetch(
        'http://timesride.com/custom/SubscribeAddDelete.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch subscribed channels');
      }

      const data = await response.json();

      if (data.status === 'success' && data.data.length > 0) {
        const channelIds = data.data.map(item => item.channel_id).join(',');

        const detailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds}&key=${API_KEY}`,
        );
        const channelData = await detailsResponse.json();

        const formattedChannels = channelData.items.map(item => ({
          id: item.id,
          name: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
        }));

        const sortedChannels = formattedChannels.reverse();
        setSubscribedChannels(sortedChannels);

        fetchChannelVideos(sortedChannels[0].id);
        setSelectedChannel(sortedChannels[0].id);
      } else {
        setSubscribedChannels([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching subscribed channels:', error);
      setSubscribedChannels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeChannel = async channelId => {
    try {
      const userId = await getUserId();

      if (!userId) {
        console.log('User ID not found!');
        return;
      }

      const requestData = {
        action: 'unsubscribe',
        userid: userId,
        channel_id: channelId,
      };

      setIsLoading(true);

      const response = await fetch(
        'http://timesride.com/custom/SubscribeAddDelete.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to unsubscribe channel');
      }

      const data = await response.json();

      if (data.status === 'success') {
        await fetchSubscribedChannels();
        alert({
          type: DropdownAlertType.Success,
          title: 'Success',
          message: 'Channel unsubscribed successfully',
        });
      } else {
        alert({
          type: DropdownAlertType.Error,
          title: 'Error',
          message: 'Failed to unsubscribe channel',
        });
      }
    } catch (error) {
      console.error('Error unsubscribing channel:', error);
      Alert.alert('Error', 'An error occurred while unsubscribing');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChannelVideos = async (channelId, isLoadMore = false) => {
    if (isLoadMore && loadingMoreVideos) return;
    if (!isLoadMore) setIsLoading(true);
    if (isLoadMore) setLoadingMoreVideos(true);

    try {
      let orderParam = '';
      if (videoFilter === 'latest') orderParam = '&order=date';
      else if (videoFilter === 'popular') orderParam = '&order=viewCount';

      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&type=video${orderParam}&key=${API_KEY}${
        isLoadMore && videoNextPage ? `&pageToken=${videoNextPage}` : ''
      }`;

      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      const videoIds = searchData.items
        .map(item => item.id?.videoId)
        .filter(Boolean)
        .join(',');

      let statisticsMap = {};

      if (videoIds) {
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${API_KEY}`;
        const statsResponse = await fetch(statsUrl);
        const statsData = await statsResponse.json();

        statsData.items.forEach(item => {
          statisticsMap[item.id] = item.statistics;
        });
      }

      const enrichedItems = searchData.items.map(item => ({
        ...item,
        statistics: statisticsMap[item.id?.videoId] || {},
      }));

      if (isLoadMore) {
        setVideos(prev => [
          ...prev,
          ...(videoFilter === 'oldest'
            ? enrichedItems.reverse()
            : enrichedItems),
        ]);
      } else {
        const sortedItems =
          videoFilter === 'oldest'
            ? [...enrichedItems].reverse()
            : enrichedItems;
        setVideos(sortedItems);
        setSelectedChannel(channelId);
      }

      setVideoNextPage(searchData.nextPageToken || null);
    } catch (error) {
      console.error('Failed to fetch channel videos:', error);
    } finally {
      setIsLoading(false);
      setLoadingMoreVideos(false);
    }
  };

  const renderChannelItem = ({item}) => {
    const isSelected = item.id === selectedChannel;

    return (
      <View style={styles.channelCard}>
        <TouchableOpacity
          style={[styles.channelButton, isSelected && styles.channelSelected]}
          onPress={() => {
            setVideoNextPage(null);
            fetchChannelVideos(item.id);
          }}>
          <View style={{position: 'relative'}}>
            <Image source={{uri: item.thumbnail}} style={styles.channelImage} />

            {isSelected && (
              <View style={styles.selectedBadge}>
                <MaterialIcons
                  name="check-circle"
                  size={18}
                  color={AppColors.theme}
                />
              </View>
            )}
          </View>

          <Text numberOfLines={1} style={styles.channelName}>
            {item.name}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.unsubscribeButton}
          onPress={() => unsubscribeChannel(item.id)}>
          <Text style={styles.unsubscribeText}>Unsubscribe</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getRelativeTime = dateString => {
    const now = new Date();
    const uploadDate = new Date(dateString);
    const diffMs = now - uploadDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  };

  const renderVideoItem = ({item}) => {
    const videoId =
      item.id?.videoId || item.snippet?.resourceId?.videoId || null;

    const thumbnailUri =
      item.snippet?.thumbnails?.medium?.url ||
      'https://via.placeholder.com/320x180.png?text=No+Thumbnail';

    const publishedAt = item.snippet?.publishedAt
      ? new Date(item.snippet.publishedAt).toLocaleDateString()
      : '';

    const views = item.statistics?.viewCount
      ? `${Number(item.statistics.viewCount).toLocaleString()} views`
      : '';

    return (
      <View
        style={{
          backgroundColor: '#fff',
          marginBottom: 10,
          borderRadius: 8,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#eee',
        }}>
        {videoId && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Add Video', {videoId})}>
            <Image
              source={{uri: thumbnailUri}}
              style={{width: '100%', height: 200}}
            />
          </TouchableOpacity>
        )}

        <View style={{padding: 10}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={{flex: 1, paddingRight: 10}}>
              <Text
                numberOfLines={2}
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#222',
                }}>
                {item.snippet?.title}
              </Text>
              <Text style={{fontSize: 12, color: '#777', marginTop: 4}}>
                <Text style={{fontSize: 12, color: '#777', marginTop: 4}}>
                  {item.statistics?.viewCount
                    ? `${
                        item.statistics.viewCount >= 1000000
                          ? (item.statistics.viewCount / 1000000).toFixed(1) +
                            'M'
                          : item.statistics.viewCount >= 1000
                          ? (item.statistics.viewCount / 1000).toFixed(1) + 'K'
                          : item.statistics.viewCount
                      } views`
                    : ''}
                  {item.statistics?.viewCount ? ' • ' : ''}{' '}
                  {getRelativeTime(item.snippet?.publishedAt)}
                </Text>
              </Text>
            </View>

            {videoId && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedVideoId(videoId);
                  sheetRef.current?.open();
                }}
                style={{padding: 5}}>
                <MaterialIcons name="more-vert" size={22} color="#555" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const fetchPlaylists = async () => {
    setLoadingPlaylists(true);

    const email = await AsyncStorage.getItem('userUserName');
    try {
      const response = await Playlist.getAllPlaylist(email);
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
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
    <View style={styles.container}>
      {isLoading ? (
        <AppLoader message="Loading subscribed channels..." />
      ) : subscribedChannels.length === 0 ? (
        <View style={styles.noChannelsContainer}>
          <Image source={AppImage.heart} style={styles.heartImage} />
          <Text style={styles.noChannelsText}>No Subscribed Channels</Text>
        </View>
      ) : (
        <View>
          <FlatList
            data={subscribedChannels}
            horizontal
            keyExtractor={(item, index) => item.id || `channel-${index}`}
            renderItem={renderChannelItem}
            showsHorizontalScrollIndicator={false}
            style={{marginBottom: 10}}
            onEndReachedThreshold={0.5}
            onEndReached={() => {}}
            ListFooterComponent={
              loadingMoreVideos ? (
                <ActivityIndicator
                  size="large"
                  color={AppColors.theme}
                  style={{
                    justifyContent: 'center',
                    flex: 1,
                  }}
                />
              ) : null
            }
          />
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginBottom: 10,
              }}>
              {['none', 'latest', 'oldest', 'popular'].map(filter => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => {
                    setVideoFilter(filter);
                    fetchChannelVideos(selectedChannel);
                  }}
                  style={{
                    padding: 8,
                    paddingHorizontal: 15,
                    backgroundColor:
                      videoFilter === filter ? AppColors.theme : '#eee',
                    borderRadius: 8,
                  }}>
                  <Text
                    style={{
                      color: videoFilter === filter ? '#fff' : '#333',
                      fontWeight: '500',
                    }}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {isLoading ? (
            <AppLoader message="Loading videos..." />
          ) : (
            <FlatList
              data={videos}
              keyExtractor={(item, index) =>
                item.id?.videoId || `video-${index}`
              }
              renderItem={renderVideoItem}
              contentContainerStyle={{paddingBottom: 200, flexGrow: 1}}
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (videoNextPage && selectedChannel) {
                  fetchChannelVideos(selectedChannel, true);
                }
              }}
              ListFooterComponent={
                loadingMoreVideos ? (
                  <ActivityIndicator
                    size="large"
                    color={AppColors.theme}
                    style={{marginVertical: 20}}
                  />
                ) : null
              }
            />
          )}
        </View>
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
      <DropdownAlert alert={func => (alert = func)} alertPosition="bottom" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 10},
  channelCard: {alignItems: 'center', marginRight: 15, marginBottom: 40},
  channelButton: {alignItems: 'center', marginBottom: 8},
  channelSelected: {borderColor: AppColors.theme, borderRadius: 10},
  channelImage: {width: 60, height: 60, borderRadius: 40, marginBottom: 5},
  channelName: {fontSize: 12, color: '#333', textAlign: 'center'},
  unsubscribeButton: {
    backgroundColor: '#ff5252',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  unsubscribeText: {color: '#fff', fontSize: 12},
  videoCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  videoThumbnail: {width: '100%', height: 200},
  videoInfo: {padding: 8},
  videoTitle: {fontSize: 15, fontWeight: '500', color: '#222'},
  videoDetails: {fontSize: 12, color: '#666', marginTop: 4},
  moreButton: {position: 'absolute', right: 10, top: 10},
  noChannelsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    tintColor: AppColors.theme,
  },
  selectedBadge: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  noChannelsText: {fontSize: 18, color: '#888'},
});
