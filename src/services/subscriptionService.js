import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'subscribedChannels';
const CACHE_EXPIRY_KEY = 'subscribedChannelsExpiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const subscriptionService = {
  // Get user ID helper
  getUserId: async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  },

  // Check if cache is valid
  isCacheValid: async () => {
    try {
      const expiry = await AsyncStorage.getItem(CACHE_EXPIRY_KEY);
      if (!expiry) return false;
      return Date.now() < parseInt(expiry);
    } catch (error) {
      return false;
    }
  },

  // Get cached subscribed channels
  getCachedSubscribedChannels: async () => {
    try {
      const isValid = await subscriptionService.isCacheValid();
      if (!isValid) return null;

      const cached = await AsyncStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached channels:', error);
      return null;
    }
  },

  // Cache subscribed channels
  cacheSubscribedChannels: async channels => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(channels));
      await AsyncStorage.setItem(
        CACHE_EXPIRY_KEY,
        (Date.now() + CACHE_DURATION).toString(),
      );
    } catch (error) {
      console.error('Error caching channels:', error);
    }
  },

  // Clear cache
  clearCache: async () => {
    try {
      await AsyncStorage.multiRemove([CACHE_KEY, CACHE_EXPIRY_KEY]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  // Fetch subscribed channels with caching
  fetchSubscribedChannels: async (forceRefresh = false) => {
    try {
      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cached = await subscriptionService.getCachedSubscribedChannels();
        if (cached) {
          return {success: true, data: cached, fromCache: true};
        }
      }

      const userId = await subscriptionService.getUserId();
      if (!userId) {
        return {success: false, error: 'User ID not found'};
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

        // Cache the result
        await subscriptionService.cacheSubscribedChannels(subscribedChannelIds);

        return {success: true, data: subscribedChannelIds, fromCache: false};
      } else {
        // Cache empty result too
        await subscriptionService.cacheSubscribedChannels([]);
        return {success: true, data: [], fromCache: false};
      }
    } catch (error) {
      console.error('Error fetching subscribed channels:', error);
      return {success: false, error: error.message};
    }
  },

  // Subscribe to a channel
  subscribeToChannel: async channelId => {
    try {
      const userId = await subscriptionService.getUserId();
      if (!userId) {
        return {success: false, error: 'User ID not found'};
      }

      const requestData = {
        action: 'AddData',
        userid: userId,
        channel_id: channelId,
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

      const data = await response.json();

      if (data.status === 'success') {
        // Clear cache to force refresh next time
        await subscriptionService.clearCache();
        return {success: true};
      } else {
        return {success: false, error: data.message || 'Failed to subscribe'};
      }
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      return {success: false, error: error.message};
    }
  },

  // Unsubscribe from a channel
  unsubscribeFromChannel: async channelId => {
    try {
      const userId = await subscriptionService.getUserId();
      if (!userId) {
        return {success: false, error: 'User ID not found'};
      }

      const requestData = {
        action: 'DeleteData',
        userid: userId,
        channel_id: channelId,
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

      const data = await response.json();

      if (data.status === 'success') {
        // Clear cache to force refresh next time
        await subscriptionService.clearCache();
        return {success: true};
      } else {
        return {success: false, error: data.message || 'Failed to unsubscribe'};
      }
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
      return {success: false, error: error.message};
    }
  },
};
