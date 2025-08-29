import React, {createContext, useContext, useState, useEffect} from 'react';
import {subscriptionService} from '../services/subscriptionService';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      'useSubscription must be used within a SubscriptionProvider',
    );
  }
  return context;
};

export const SubscriptionProvider = ({children}) => {
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscribedChannels = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const result = await subscriptionService.fetchSubscribedChannels(
        forceRefresh,
      );

      if (result.success) {
        setSubscribedChannels(result.data);
        return result.data;
      } else {
        setError(result.error);
        setSubscribedChannels([]);
        return [];
      }
    } catch (err) {
      setError(err.message);
      setSubscribedChannels([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChannel = async channelId => {
    const result = await subscriptionService.subscribeToChannel(channelId);

    if (result.success) {
      // Refresh the subscribed channels list
      await fetchSubscribedChannels(true);
    }

    return result;
  };

  const unsubscribeFromChannel = async channelId => {
    const result = await subscriptionService.unsubscribeFromChannel(channelId);

    if (result.success) {
      // Refresh the subscribed channels list
      await fetchSubscribedChannels(true);
    }

    return result;
  };

  const isChannelSubscribed = channelId => {
    return subscribedChannels.includes(channelId);
  };

  const value = {
    subscribedChannels,
    loading,
    error,
    fetchSubscribedChannels,
    subscribeToChannel,
    unsubscribeFromChannel,
    isChannelSubscribed,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
