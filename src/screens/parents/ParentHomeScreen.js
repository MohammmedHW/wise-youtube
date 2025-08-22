import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
  Keyboard,
  RefreshControl,
  StatusBar,
  Alert,
  ScrollView,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Animated,
  TouchableHighlight,
} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {Playlist, YoutubeApi} from '../../services';
import AppLoader from '../../components/AppLoader';
import AppColors from '../../utils/AppColors';
import AppFonts from '../../utils/AppFonts';
import {Linking} from 'react-native';

import {config} from '../../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // top of file
import RBSheet from 'react-native-raw-bottom-sheet'; // Add this import at the top of your file
import {Vibration} from 'react-native';
import OptionsBottomSheet from '../../components/OptionsBottomSheet';
import PlaylistBottomSheet from '../../components/PlaylistBottomSheet';
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';
import {AppContext} from '../../contextApi/AppContext';
// import { AppContext } from './AppContext';

function HomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [videos, setVideos] = useState([]);
  const {checkTrialFirstTime, setCheckTrialFirstTime} = useContext(AppContext);
  console.log('TCL: checkTrialFirstTime', checkTrialFirstTime);

  const [searchText, setSearchText] = useState('');
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('video');
  const [channelStats, setChannelStats] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  // Get category from route params, fallback to 'All' if not provided
  const categoryFromRoute = route.params?.categoryName || 'All';
  console.log('categoryFromRoute', categoryFromRoute);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromRoute);
  const [isSubscribedMap, setIsSubscribedMap] = useState({});
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [load, setload] = useState(true);
  const sheetRef = useRef(null);
  const playlistSheetRef = useRef(null);

  const [playlists, setPlaylists] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  const API_KEY = config.cli.api_key;
  let alert = _data => new Promise(res => res);

  const checkLock = async () => {
    const isLocked = await AsyncStorage.getItem('homeLocked');
    setIsLocked(isLocked === 'true');
  };
  useEffect(() => {
    const isFocused = navigation.addListener('focus', () => {
      checkLock();
    });
    return isFocused;
  }, [navigation]);

  useEffect(() => {
    if (checkTrialFirstTime) {
      alert({
        type: DropdownAlertType.Success,
        title: 'Congratulations',
        message: `You have unlocked free trial period of 3 days.`,
      });
      setCheckTrialFirstTime(null);
    }
  }, [checkTrialFirstTime]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const checkLock = async () => {

  // Check expiry date
  // if (expiryDate) {
  //   console.log(expiryDate);
  //   if (expiryDate <= 2) {
  //     Alert.alert(
  //       'Enjoyment Expiring Soon',
  //       `Your  won't enjoy services after ${expiryDate} day${expiryDate === 1 ? '' : 's'}. Please renew your subscription to continue using the app.`,
  //       [
  //         {
  //           text: 'Ok',
  //           style: 'cancel'
  //         },
  //       ]
  //     );
  //   }
  // }
  //     };

  //     checkLock();
  //   }, []),
  // );

  const unlockHome = async () => {
    const storedPin = await AsyncStorage.getItem('userPin');
    if (pin === storedPin) {
      await AsyncStorage.setItem('homeLocked', 'false');
      setIsLocked(false);
      setPin('');
    } else {
      triggerShake();
      Vibration.vibrate(100);
      setPin('');
    }
  };

  // Update selected category when route params change
  useEffect(() => {
    const newCategory =
      route.params?.subcategoryName || route.params?.categoryName || 'All';
    if (newCategory !== selectedCategory) {
      setSelectedCategory(newCategory);
    }
  }, [route.params, selectedCategory]);

  useEffect(() => {
    getVideos(false, searchText, selectedCategory);
  }, [filterType, selectedCategory, searchText]);

  useEffect(() => {
    const fetchStats = async () => {
      const uniqueChannelIds = [
        ...new Set(
          videos
            .filter(item => item.id?.channelId)
            .map(item => item.id.channelId),
        ),
      ].filter(id => !channelStats[id]);

      if (uniqueChannelIds.length === 0) return;

      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${uniqueChannelIds.join(
            ',',
          )}&key=${API_KEY}`,
        );
        const data = await response.json();

        const statsMap = {};
        data.items.forEach(item => {
          statsMap[item.id] = {
            subscriberCount: item.statistics.subscriberCount,
            videoCount: item.statistics.videoCount,
          };
        });

        setChannelStats(prev => ({...prev, ...statsMap}));
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, [API_KEY, channelStats, videos]);

  useEffect(() => {
    const checkSubscriptions = async () => {
      try {
        const subscribedChannels = await AsyncStorage.getItem(
          'subscribedChannels',
        );
        const subscribedChannelsList = subscribedChannels
          ? JSON.parse(subscribedChannels)
          : [];

        const newIsSubscribedMap = {};
        videos.forEach(item => {
          if (item?.id?.channelId) {
            newIsSubscribedMap[item.id.channelId] =
              subscribedChannelsList.includes(item.id.channelId);
          }
        });

        setIsSubscribedMap(newIsSubscribedMap);
      } catch (error) {
        console.error('Error checking subscription status', error);
      }
    };

    checkSubscriptions();
  }, [videos]);

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

  const handleSubscriptionToggle = channelId => {
    Vibration.vibrate(100);

    // Optimistically update UI
    const action = subscribedChannels.includes(channelId)
      ? 'unsubscribe'
      : 'subscribe';

    const updatedSubscribedChannels = [...subscribedChannels];

    if (action === 'subscribe') {
      updatedSubscribedChannels.push(channelId);
    } else {
      const index = updatedSubscribedChannels.indexOf(channelId);
      if (index !== -1) updatedSubscribedChannels.splice(index, 1);
    }

    setSubscribedChannels(updatedSubscribedChannels);

    // Show success message without server check
    alert({
      type: DropdownAlertType.Success,
      title: 'Success',
      message: `You have successfully ${action}d the channel`,
    });

    console.log(`TCL: Subscription toggle bypassed server. Action: ${action}`);
  };

  const fetchSubscribedChannels = useCallback(async () => {
    setload(true);

    try {
      const userId = await getUserId();
      if (!userId) {
        console.log('User ID not found!');
        setload(false);
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
        const subscribedChannelIds = data.data.map(item => item.channel_id);
        setSubscribedChannels(subscribedChannelIds);
      } else {
        setSubscribedChannels([]);
      }
    } catch (error) {
      console.error('Error fetching subscribed channels:', error);
      setSubscribedChannels([]);
    } finally {
      setload(false);
    }
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchSubscribedChannels();
    }, [fetchSubscribedChannels]),
  );

  useFocusEffect(
    React.useCallback(() => {
      fetchSubscribedChannels();
    }, [fetchSubscribedChannels]),
  );

  const formatCount = count => {
    if (!count) return '0';
    const num = parseInt(count, 10);
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const onSearchSubmit = () => {
    Keyboard.dismiss();
    getVideos(false);
  };

  const getVideos = async (
    isLoadMore = false,
    keywordOverride = '',
    categoryOverride = '',
  ) => {
    // navigation.navigate('Add Video', {videoId: 'dQw4w9WgXcQ'|| item.id.videoId})
    // return
    let keyword = '';

    if (keywordOverride) {
      keyword = keywordOverride;
    } else if (
      searchText.trim() !== '' &&
      categoryOverride &&
      categoryOverride !== 'All'
    ) {
      keyword = `${searchText.trim()} ${categoryOverride}`;
    } else if (searchText.trim() !== '') {
      keyword = searchText.trim();
    } else if (categoryOverride && categoryOverride !== 'All') {
      keyword = categoryOverride;
    } else {
      keyword = ''; // Removed default 'kids' search term
    }

    if (!isLoadMore && !refreshing) setIsLoading(true);

    try {
      console.log('Using API Key:', API_KEY); // Log the API key being used
      const response = await YoutubeApi.getVideosBySearch(
        keyword,
        isLoadMore ? nextPageToken : '',
        filterType,
      );

      console.log(
        'TCL: response responseresponseresponseresponseresponse',
        JSON.stringify(response),
      );

      setNextPageToken(response.nextPageToken || null);

      if (isLoadMore) {
        setVideos(prev => [...prev, ...response.items]);
      } else {
        setVideos(response.items);
      }
    } catch (error) {
      console.log('Error fetching videos:', error);
      console.log('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 403) {
        Alert.alert(
          'API Access Error',
          'The YouTube API access is currently restricted. Please check:\n\n1. API key configuration\n2. API quota limits\n3. API restrictions',
        );
      } else {
        Alert.alert(
          'Error',
          'We are unable to load videos right now. Please try again later.',
        );
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
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
    console.log('ParentHomeScreen.js');
    console.log(selectedVideoId);
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

  const onRefresh = () => {
    setRefreshing(true);
    getVideos(false, '', selectedCategory);
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderItem = ({item}) => {
    const isChannel = item?.id?.channelId;
    console.log('TCL: renderItem -> isChannel', isChannel);
    const isVideo = item?.id?.videoId;
    const isPlaylist = item?.id?.playlistId;
    const isSubscribed = subscribedChannels.includes(item.id.channelId);

    if (isChannel) {
      return (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            padding: 10,
            marginVertical: 5,
            marginHorizontal: 10,
            backgroundColor: '#f9f9f9',
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ddd',
          }}
          onPress={() =>
            navigation.navigate('Channel', {channelId: item.id.channelId})
          }>
          <Image
            source={{uri: item?.snippet?.thumbnails?.high?.url}}
            style={{width: 60, height: 60, borderRadius: 30, marginRight: 12}}
          />
          <View style={{flex: 1}}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 16,
                color: '#333',
                fontFamily: AppFonts.Medium,
              }}>
              {item?.snippet?.title}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 13,
                color: AppColors.darkGray,
                fontFamily: AppFonts.Regular,
              }}>
              {item?.snippet?.description?.slice(0, 60)}...
            </Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: isSubscribed ? AppColors.theme : '#ccc',
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => handleSubscriptionToggle(item.id.channelId)}>
            <MaterialIcons
              name={isSubscribed ? 'notifications' : 'notifications-none'}
              size={14}
              color="#fff"
              style={{marginRight: 6}}
            />
            <Text
              style={{
                color: '#fff',
                fontSize: 10,
                fontFamily: AppFonts.Medium,
              }}>
              {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }

    if (isVideo) {
      return (
        <View
          style={{
            flex: 1,
            marginVertical: 6,
            borderColor: '#ddd',
            overflow: 'hidden',
          }}>
          <TouchableHighlight
            style={{width: '100%'}}
            onPress={() =>
              navigation.navigate('Add Video', {videoId: item.id.videoId})
            }>
            <Image
              source={{
                uri:
                  item?.snippet?.thumbnails?.medium?.url ||
                  item?.snippet?.thumbnails?.default?.url,
              }}
              style={{width: '100%', height: 200, resizeMode: 'cover'}}
            />
          </TouchableHighlight>

          <View
            style={{flexDirection: 'row', padding: 10, alignItems: 'center'}}>
            <View style={{flex: 1}}>
              <Text
                numberOfLines={2}
                style={{
                  fontSize: 16,
                  color: '#222',
                  fontFamily: AppFonts.Medium,
                }}>
                {item?.snippet?.title}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#666',
                  marginTop: 2,
                  fontFamily: AppFonts.Regular,
                }}>
                {item?.snippet?.channelTitle}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setSelectedVideoId(item.id.videoId);
                sheetRef.current.open();
              }}>
              <MaterialIcons name="more-vert" size={24} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    if (filterType === 'playlist' && isPlaylist) {
      return (
        <View
          style={{
            marginVertical: 10,
            marginHorizontal: 10,
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PlayList Details', {
                playlistId: item.id.playlistId,
                source: 'youtube',
              })
            }
            activeOpacity={0.8}>
            <View style={{position: 'relative'}}>
              <Image
                source={{uri: item?.snippet?.thumbnails?.high?.url}}
                style={{
                  width: '100%',
                  height: 190,
                  resizeMode: 'cover',
                  backgroundColor: '#ccc',
                }}
              />
              {/* Mix Badge */}
              <View
                style={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  backgroundColor: '#000',
                  paddingVertical: 2,
                  paddingHorizontal: 6,
                  borderRadius: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: 0.8,
                }}>
                <MaterialIcons
                  name="queue-music"
                  size={16}
                  color="#fff"
                  style={{marginRight: 4}}
                />
                <Text style={{color: '#fff', fontSize: 12}}>Mix</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 4,
              paddingVertical: 8,
            }}>
            <View style={{flex: 1, paddingRight: 10}}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#000',
                }}>
                Mix – Playlist
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 13,
                  color: '#666',
                  marginTop: 2,
                }}>
                {item?.snippet?.channelTitle || 'Various Artists'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setSelectedVideoId(item.id.playlistId);
                console.log(item.id.playlistId);
                sheetRef.current.open();
              }}>
              <MaterialIcons name="more-vert" size={22} color="#444" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  if (isLocked) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <StatusBar backgroundColor={AppColors.white} barStyle="dark-content" />

        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
            keyboardShouldPersistTaps="handled">
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 5,
                alignItems: 'center',
                flex: 1,
                justifyContent: 'center',
                padding: 10,
              }}>
              <Icon
                name="lock-closed-outline"
                size={70}
                color={AppColors.theme}
                style={{marginBottom: 10}}
              />
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: AppFonts.Bold,
                  color: AppColors.theme,
                  marginBottom: 6,
                }}>
                Home Screen Locked
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: AppFonts.Regular,
                  color: AppColors.gray,
                  marginBottom: 20,
                  textAlign: 'center',
                }}>
                Your access to the home screen is restricted. Please enter your
                PIN to unlock.
              </Text>
              <Animated.View
                style={{
                  transform: [{translateX: shakeAnim}],
                  width: '100%',
                  minWidth: 260,
                }}>
                <TextInput
                  value={pin}
                  onChangeText={setPin}
                  placeholder="Enter your PIN"
                  keyboardType="numeric"
                  secureTextEntry
                  style={{
                    width: '100%',
                    minWidth: 260,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 16,
                    textAlign: 'center',
                    backgroundColor: '#F8F9FB',
                    marginBottom: 20,
                    color: AppColors.black,
                    fontFamily: AppFonts.Medium,
                  }}
                />
              </Animated.View>

              <TouchableOpacity
                onPress={unlockHome}
                style={{
                  width: '100%',
                  minWidth: 260,
                  backgroundColor: AppColors.theme,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    fontFamily: AppFonts.SemiBold,
                  }}>
                  Unlock Now
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <StatusBar backgroundColor={AppColors.white} barStyle={'dark-content'} />
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {/* Header with back button */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 10,
            backgroundColor: 'white',
          }}>
          <TouchableOpacity
            onPress={() => {
              console.log('Back button pressed');
              console.log('Can go back:', navigation.canGoBack());
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                // If can't go back, navigate to HomeScreen
                navigation.navigate('HomeScreen');
              }
            }}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: '#f5f5f5',
              marginRight: 10,
            }}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontFamily: AppFonts.Medium,
              color: '#333',
              flex: 1,
            }}>
            {selectedCategory === 'All' ? 'All Videos' : selectedCategory}
          </Text>
        </View>

        <Searchbar
          style={{marginHorizontal: 10, backgroundColor: 'white'}}
          placeholder="Search anything..."
          onChangeText={setSearchText}
          onClearIconPress={() => setSearchText('')}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
          value={searchText}
        />
        {/* <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 10}}>
            {[
              'All',
              'Music',
              'Gaming',
              'News',
              'Sports',
              'Education',
              'Comedy',
            ].map(category => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => {
                    setSelectedCategory(category);
                    getVideos(false, '', category);
                  }}
                  style={{
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                    marginRight: 10,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: isSelected ? AppColors.theme : '#333',
                      fontSize: 14,
                      fontFamily: isSelected
                        ? AppFonts.Medium
                        : AppFonts.Regular,
                    }}>
                    {category}
                  </Text>
                  {isSelected && (
                    <View
                      style={{
                        height: 2,
                        width: '100%',
                        backgroundColor: AppColors.theme,
                        marginTop: 4,
                      }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View> */}
        <View style={{marginHorizontal: 10, marginBottom: 15, marginTop: 5}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {['video', 'channel', 'playlist'].map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  if (filterType === type) {
                    getVideos(false, searchText, selectedCategory);
                  } else {
                    setFilterType(type);
                    getVideos(false, searchText, selectedCategory);
                  }
                }}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  marginHorizontal: 8,
                  borderRadius: 6,
                  backgroundColor:
                    filterType === type ? AppColors.theme : '#f0f0f0',
                }}>
                <Text
                  style={{
                    color: filterType === type ? 'white' : '#333',
                    fontWeight: '500',
                    fontSize: 14,
                  }}>
                  {type === 'video'
                    ? 'Videos'
                    : type === 'channel'
                    ? 'Channels'
                    : 'Playlists'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {load ? (
          <ActivityIndicator
            size="large"
            color={AppColors.theme}
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
          />
        ) : (
          <FlatList
            data={videos}
            key={filterType === 'short' ? 'shorts' : filterType}
            keyExtractor={(item, index) =>
              item?.id?.videoId || item?.id?.channelId || index.toString()
            }
            renderItem={renderItem}
            numColumns={1}
            contentContainerStyle={{
              paddingVertical: 3,
              width: '100%',
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[AppColors.theme]}
                tintColor={AppColors.theme}
              />
            }
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (nextPageToken && !loadingMore) {
                setLoadingMore(true);
                getVideos(true).then(() => setLoadingMore(false));
              }
            }}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="large"
                  color={AppColors.theme}
                  style={{marginVertical: 25}}
                />
              ) : null
            }
          />
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
      {isLoading && <AppLoader message="Loading videos..." />}
      <DropdownAlert alert={func => (alert = func)} alertPosition="bottom" />
    </SafeAreaView>
  );
}

export default HomeScreen;
