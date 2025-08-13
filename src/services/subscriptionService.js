import { endpoints } from './endpoints';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getSubscriptionPlans = (token) =>
    new Promise((resolve, reject) => {
        axios
            .get(`${endpoints.subscription.getPlans}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            })
        .then((response) => resolve(response.data))
        .catch((error) => reject(error));
});

const placeOrder = (body, token) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${endpoints.subscription.placeOrder}`, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });

const API_URL = 'http://timesride.com/custom/subscriptondb.php';

class SubscriptionService {
    static async addSubscription(subscriptionData) {
        try {
            console.log("SubscriptionService: Sending subscription data:", JSON.stringify(subscriptionData, null, 2));
            const response = await axios.post(API_URL, subscriptionData);
            console.log("SubscriptionService: Raw response:", response);
            console.log("SubscriptionService: Response data:", response.data);
            
            if (!response.data) {
                throw new Error('No data received from server');
            }
            
            return response.data;
        } catch (error) {
            console.error('SubscriptionService: Error adding subscription:', error.response?.data || error.message);
            if (error.response) {
                console.error('SubscriptionService: Response status:', error.response.status);
                console.error('SubscriptionService: Response headers:', error.response.headers);
            }
            throw error;
        }
    }

    static async getSubscription(email) {
        try {
            const response = await axios.post(API_URL, {
                action: 'get_subscription',
                email: email
            });
            return response.data;
        } catch (error) {
            console.error('Error getting subscription:', error);
            throw error;
        }
    }

    static async addTrialSubscription(email) {
        try {
            // First check if subscription exists
            const checkData = {
                action: "get_subscription",
                email: email
            };

            const checkResponse = await axios.post(API_URL, checkData);
            
            // If no subscription found, proceed with adding trial
            if (checkResponse.data.status === 'error' && checkResponse.data.message === 'No subscriptions found for this email.') {
                const now = new Date();
                const expiryDate = new Date(now);
                expiryDate.setDate(now.getDate() + 3); // 3 days trial

                const trialData = {
                    email: email,
                    product_id: "",
                    purchase_token: "",
                    order_id: "",
                    platform: "android",
                    price: "",
                    purchase_date: now.toISOString().slice(0, 19).replace('T', ' '),
                    expiry_date: expiryDate.toISOString().slice(0, 19).replace('T', ' '),
                    is_trial: true,
                    status: "active"
                };

                const response = await axios.post(API_URL, trialData);
                
                if (response.data.success) {
                    // Store trial data in AsyncStorage
                    await AsyncStorage.setItem('trialData', JSON.stringify({
                        startDate: now.toISOString(),
                        expiryDate: expiryDate.toISOString(),
                        isActive: true,
                        daysRemaining: 3
                    }));
                }
                
                return response.data;
            } else {
                // Subscription already exists
                return {
                    status: 'error',
                    message: 'Subscription already exists for this email'
                };
            }
        } catch (error) {
            console.error('Error adding trial subscription:', error);
            throw error;
        }
    }

    static async checkSubscriptionStatus(email) {
        try {
            const response = await axios.post(API_URL, {
                action: 'get_subscription',
                email: email
            });
            return response.data;
        } catch (error) {
            console.error('Error checking subscription status:', error);
            throw error;
        }
    }

    static async updateTrialStatus(email, isActive) {
        try {
            const response = await axios.post(API_URL, {
                action: 'update_trial',
                email: email,
                is_active: isActive
            });
            return response.data;
        } catch (error) {
            console.error('Error updating trial status:', error);
            throw error;
        }
    }

    static async resetTrialStatus(email) {
        try {
            const response = await axios.post(API_URL, {
                action: 'reset_trial',
                email: email
            });
            return response.data;
        } catch (error) {
            console.error('Error resetting trial status:', error);
            throw error;
        }
    }

    static async getTrialStatus(email) {
        try {
            const response = await axios.post(API_URL, {
                action: 'get_subscription',
                email: email
            });

            if (response.data.success) {
                const subscription = response.data.data;
                if (subscription.is_trial) {
                    const now = new Date();
                    const expiryDate = new Date(subscription.expiry_date);
                    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

                    // Update local storage with latest data
                    await AsyncStorage.setItem('trialData', JSON.stringify({
                        startDate: subscription.purchase_date,
                        expiryDate: subscription.expiry_date,
                        isActive: daysRemaining > 0,
                        daysRemaining: Math.max(0, daysRemaining)
                    }));

                    return {
                        isActive: daysRemaining > 0,
                        daysRemaining,
                        expiryDate: subscription.expiry_date
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting trial status:', error);
            throw error;
        }
    }
}

export default SubscriptionService;

export {
    getSubscriptionPlans, placeOrder
}