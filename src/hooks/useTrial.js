import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubscriptionService from '../services/subscriptionService';

export const useTrial = () => {
    const [trialStatus, setTrialStatus] = useState(null);
	console.log("TCL: useTrial -> trialStatus", trialStatus)
    const [loading, setLoading] = useState(true);

    const checkTrialStatus = async () => {
        try {
            const email = await AsyncStorage.getItem('userUserName');
            if (!email) {
                setLoading(false);
                return;
            }
            console.log("from useTrial.js file");
            const response = await SubscriptionService.getSubscription(email);
			console.log("TCL: checkTrialStatus -> response", response?.message)
            console.log(response);
            if (response?.data?.[0]?.status === "active") {
                await AsyncStorage.setItem("trialdata", JSON.stringify(response.data[0].is_trial));
                await AsyncStorage.setItem("pricedata", JSON.stringify(response.data[0].price));
                console.log("from inside");
                const subscription = response.data[0];
				console.log("TCL: checkTrialStatus -> subscription", subscription)
                if (subscription.is_trial === 1) {
                    const now = new Date();
                    const expiryDate = new Date(subscription.expiry_date);
                    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                    await AsyncStorage.setItem("expirydata",JSON.stringify(daysRemaining));
                    const status = {
                        isActive: daysRemaining > 0,
                        daysRemaining: Math.max(0, daysRemaining),
                        expiryDate: subscription.expiry_date
                    };
						console.log("TCL: checkTrialStatus -> status", status)

                    await AsyncStorage.setItem("daysRemaining", JSON.stringify(daysRemaining));

                    setTrialStatus(status);
                }
            }
            
        } catch (error) {
            console.error('Error checking trial status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkTrialStatus();
    }, []);

    return { trialStatus, loading, checkTrialStatus };
}; 