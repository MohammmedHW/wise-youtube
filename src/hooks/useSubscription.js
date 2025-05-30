import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubscriptionService from '../services/subscriptionService';

export const useSubscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSubscription = async () => {
        try {
            const email = await AsyncStorage.getItem('userEmail');
            if (!email) {
                setLoading(false);
                return;
            }

            const response = await SubscriptionService.getSubscription(email);
            if (response.success) {
                setSubscription(response.data);
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSubscription();
    }, []);

    return { subscription, loading, checkSubscription };
}; 