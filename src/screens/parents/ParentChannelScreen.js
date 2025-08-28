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
import AppColors from '../../utils/AppColors';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  const [thumbnail, setThumbnail] = useState(null);
  const [sortType, setSortType] = useState('newest');
  const [searchText, setSearchText] = useState('')

  const API_KEY = config.cli.api_key;

  const sheetRef = useRef(null);
  const playlistSheetRef = useRef(null);

  useEffect(() => {
    const channelId = route?.params?.channelId;
    
    setThumbnail(route?.params?.thumbnail);
    if (channelId) {
      uploadsPlaylistId.current = '';
      setVideos([]);
      getVideosByChannelId(channelId);
    }
  }, []);

  const iso8601ToDuration = iso => {
    if (!iso) return '0:00';
    const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso);
    if (!match) return '0:00';
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
    const ss = String(seconds).padStart(2, '0');
    return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  const formatViews = v => {
    if (!v) return '0 views';
    const num = Number(v);
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B views`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M views`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K views`;
    return `${num} views`;
  };

  const timeAgo = dateStr => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    const mo = Math.floor(d / 30);
    const y = Math.floor(d / 365);
    if (y > 0) return `${y} year${y > 1 ? 's' : ''} ago`;
    if (mo > 0) return `${mo} month${mo > 1 ? 's' : ''} ago`;
    if (d > 0) return `${d} day${d > 1 ? 's' : ''} ago`;
    if (h > 0) return `${h} hour${h > 1 ? 's' : ''} ago`;
    if (m > 0) return `${m} minute${m > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  const enrichWithStats = async items => {
    try {
      const ids = items
        .map(it => it?.snippet?.resourceId?.videoId)
        .filter(Boolean);
      if (ids.length === 0) return items;

      // videos API allows up to 50 ids per call
      const chunks = [];
      for (let i = 0; i < ids.length; i += 50) {
        chunks.push(ids.slice(i, i + 50));
      }

      const results = await Promise.all(
        chunks.map(async chunk => {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${chunk.join(',')}&key=${API_KEY}`,
          );
          return res.json();
        }),
      );

      const meta = new Map();
      results.forEach(r => {
        (r.items || []).forEach(v =>
          meta.set(v.id, {
            viewCount: v.statistics?.viewCount,
            duration: iso8601ToDuration(v.contentDetails?.duration),
          }),
        );
      });

      return items.map(it => {
        const vid = it?.snippet?.resourceId?.videoId;
        const m = meta.get(vid) || {};
        return {
          ...it,
          stats: {
            viewCount: m.viewCount || '0',
            duration: m.duration || '0:00',
          },
        };
      });
    } catch (e) {
      console.log('Failed to enrich stats', e);
      return items;
    }
  };

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

      const items = await enrichWithStats(videosData.items || []);

      setVideos(prev => [...prev, ...items]);
      setPageToken(videosData.nextPageToken || '');
    } catch (err) {
      console.error('Error loading videos:', err);
      Alert.alert('Error', 'Could not load videos.');
    } finally {
      setLoading(false);
    }
  };

  const sortedVideos = (() => {
    const copy = [...videos];
    if (sortType === 'newest') {
      return copy.sort(
        (a, b) =>
          new Date(b?.snippet?.publishedAt) - new Date(a?.snippet?.publishedAt),
      );
    }
    if (sortType === 'oldest') {
      return copy.sort(
        (a, b) =>
          new Date(a?.snippet?.publishedAt) - new Date(b?.snippet?.publishedAt),
      );
    }
    // mostViewed
    return copy.sort(
      (a, b) => Number(b?.stats?.viewCount || 0) - Number(a?.stats?.viewCount || 0),
    );
  })();

  const renderItem = ({item}) => {
    const videoId = item?.snippet?.resourceId?.videoId;
    if (!videoId) return null;

    return (
      <View
        style={{
          flex: 1,
          margin: 8,
          backgroundColor: 'white',
          borderRadius: 12,
          overflow: 'hidden',
          elevation: 2,
        }}>
        <TouchableHighlight
          style={{width: '100%'}}
          onPress={() => navigation.navigate('Add Video', {videoId})}>
          <View>
            <Image
              source={{uri: item.snippet?.thumbnails?.medium?.url}}
              style={{
                width: '100%',
                height: 140,
                resizeMode: 'cover',
              }}
            />
            <View
              style={{
                position: 'absolute',
                right: 8,
                bottom: 8,
                backgroundColor: 'rgba(0,0,0,0.75)',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
              }}>
              <Text style={{color: '#fff', fontSize: 12}}>
                {item?.stats?.duration || '0:00'}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
        <View style={{padding: 10}}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 14,
              color: AppColors.black,
              fontFamily: 'Roboto-Medium',
            }}>
            {item.snippet?.title}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: '#666',
              marginTop: 6,
              fontFamily: 'Roboto-Regular',
            }}>
            {formatViews(item?.stats?.viewCount)} • {timeAgo(item?.snippet?.publishedAt)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedVideoId(videoId);
            sheetRef.current.open();
          }}
          style={{position: 'absolute', right: 6, top: 6, padding: 6}}>
          <MaterialIcons name="more-vert" size={22} color="#fff" />
        </TouchableOpacity>
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
    console.log("ParentchannelScreen.js");
    console.log(selectedVideoId);
    const email = await AsyncStorage.getItem('userUserName');
    const isYouTubePlaylist =
      selectedVideoId?.startsWith('PL') || selectedVideoId?.includes('list=');

    const video_link = isYouTubePlaylist
      ? `https://www.youtube.com/playlist?list=${selectedVideoId.replace(
          'https://www.youtube.com/playlist?list=',
          '',
        )}`
      : `https://www.youtube.com/watch?v=${selectedVideoId}`;

    const data = {
      email_id: email,
      video_link,
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
          <View style={{padding: 10, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', columnGap: 20, paddingHorizontal: 20, paddingVertical: 20, backgroundColor: AppColors.backgroundGray}}>
            <Image source={{uri: thumbnail}} style={{width: 70, height: 70, borderRadius: 40}} />
            <View style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', rowGap: 5, flex: 1}}>
                <Text 
                  numberOfLines={2}
                  style={{fontSize: 28, color: AppColors.black, fontWeight: 'bold', flexShrink: 1}}>
                {videos[0]?.snippet?.channelTitle}
                </Text>
                {route?.params?.isSubscribed && <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', columnGap: 5}}>
                    <Icon name='check-circle' color={"green"} size={25} />
                    <Text style={{fontSize: 16, color: AppColors.black}}>Added to My Channels</Text>
                </View>}
            </View>
          </View>

          <View style={{flexDirection: 'row', paddingHorizontal: 16, marginTop: 8, marginBottom: 6, columnGap: 8}}>
            {[
              {key: 'newest', label: 'Newest First'},
              {key: 'oldest', label: 'Oldest First'},
              {key: 'mostViewed', label: 'Most Viewed'},
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setSortType(tab.key)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor:
                    sortType === tab.key ? AppColors.theme : AppColors.backgroundGray,
                  borderRadius: 16,
                }}>
                <Text style={{
                  color: sortType === tab.key ? AppColors.white : '#333',
                  fontSize: 12,
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={sortedVideos}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              item?.snippet?.resourceId?.videoId || index.toString()
            }
            numColumns={2}
            columnWrapperStyle={{justifyContent: 'space-between', paddingHorizontal: 8}}
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
