import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {YoutubeApi} from '../services';
import AppColors from '../utils/AppColors';
import AppFonts from '../utils/AppFonts';
import Icon from 'react-native-vector-icons/MaterialIcons';

function VideosScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {categoryId, categoryName, subcategoryId, subcategoryName} =
    route.params;

  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchVideos();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, fetchVideos, slideAnim]);

  const fetchVideos = useCallback(
    async (isLoadMore = false) => {
      if (!isLoadMore && !refreshing) {
        setIsLoading(true);
      } else if (isLoadMore) {
        setLoadingMore(true);
      }

      try {
        const searchKeyword =
          subcategoryName === 'All Other' ? categoryName : subcategoryName;

        const response = await YoutubeApi.getVideosBySearch(
          searchKeyword,
          isLoadMore ? nextPageToken : '',
          'video',
        );

        setNextPageToken(response.nextPageToken || null);

        if (isLoadMore) {
          setVideos(prev => [...prev, ...response.items]);
        } else {
          setVideos(response.items);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        Alert.alert('Error', 'Failed to load videos. Please try again.');
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [refreshing, nextPageToken, subcategoryName, categoryName],
  );

  const handleVideoPress = videoId => {
    navigation.navigate('Add Video', {videoId});
  };

  const handleLoadMore = () => {
    if (nextPageToken && !loadingMore) {
      fetchVideos(true);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVideos();
  };

  const formatDuration = duration => {
    // This would need to be implemented based on your video data structure
    return '5:30'; // Placeholder
  };

  const formatViewCount = viewCount => {
    if (!viewCount) {
      return '0 views';
    }
    const num = parseInt(viewCount, 10);
    if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M views';
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K views';
    }
    return num.toString() + ' views';
  };

  const renderVideoItem = ({item, index}) => {
    if (!item?.id?.videoId) {
      return null;
    }

    return (
      <View style={styles.videoItemContainer}>
        <TouchableOpacity
          style={styles.videoItem}
          onPress={() => handleVideoPress(item.id.videoId)}
          activeOpacity={0.9}>
          <View style={styles.thumbnailContainer}>
            <Image
              source={{
                uri:
                  item?.snippet?.thumbnails?.medium?.url ||
                  item?.snippet?.thumbnails?.default?.url,
              }}
              style={styles.thumbnail}
            />
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{formatDuration()}</Text>
            </View>
            <View style={styles.playOverlay}>
              <Icon name="play-arrow" size={24} color="#fff" />
            </View>
          </View>

          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {item?.snippet?.title}
            </Text>
            <View style={styles.videoMeta}>
              <Text style={styles.channelName} numberOfLines={1}>
                {item?.snippet?.channelTitle}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.viewCount}>
                  {formatViewCount(item?.statistics?.viewCount)}
                </Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.publishTime}>2 days ago</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.moreButton}>
            <Icon name="more-vert" size={20} color="#666" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.listHeader,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <Text style={styles.resultsCount}>{videos.length} videos found</Text>
    </Animated.View>
  );

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={AppColors.theme} />
        <Text style={styles.loadingFooterText}>Loading more videos...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
        },
      ]}>
      <Icon name="video-library" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>No videos found</Text>
      <Text style={styles.emptySubtitle}>
        Try searching for something else or check back later
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchVideos()}>
        <Icon name="refresh" size={20} color="#fff" />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#F8F9FA" barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.theme} />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F8F9FA" barStyle="dark-content" />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{subcategoryName}</Text>
          <Text style={styles.headerSubtitle}>{categoryName}</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={24} color="#666" />
        </TouchableOpacity>
      </Animated.View>

      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item, index) => `${item?.id?.videoId || index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[AppColors.theme]}
            tintColor={AppColors.theme}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: AppFonts.Bold,
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: AppFonts.Regular,
    color: '#666',
    marginTop: 2,
  },
  searchButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listHeader: {
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: AppFonts.Medium,
    color: '#666',
  },
  videoItemContainer: {
    marginBottom: 16,
  },
  videoItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: 120,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: AppFonts.Medium,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 14,
    fontFamily: AppFonts.Bold,
    color: '#1A1A1A',
    lineHeight: 18,
    marginBottom: 8,
  },
  videoMeta: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  channelName: {
    fontSize: 12,
    fontFamily: AppFonts.Medium,
    color: '#666',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCount: {
    fontSize: 11,
    fontFamily: AppFonts.Regular,
    color: '#888',
  },
  separator: {
    fontSize: 11,
    color: '#888',
    marginHorizontal: 6,
  },
  publishTime: {
    fontSize: 11,
    fontFamily: AppFonts.Regular,
    color: '#888',
  },
  moreButton: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: AppFonts.Medium,
    color: '#666',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingFooterText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: AppFonts.Regular,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: AppFonts.Bold,
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: AppFonts.Regular,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9370DB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: AppFonts.Medium,
    marginLeft: 8,
  },
});

export default VideosScreen;
