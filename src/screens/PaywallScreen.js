import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import * as RNIap from 'react-native-iap';
import SubscriptionService from '../services/subscriptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const productIds = [
  'monthly_plan',  // Monthly Plan
  'quarterly_plan', // Quarterly Plan
  'yearly_plan'    // Yearly Plan
];

const PaywallScreen = ({ onSubscriptionComplete }) => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    console.log('PaywallScreen: useEffect triggered, calling initializeIAP...');
    initializeIAP();

    // Cleanup function to end IAP connection
    return () => {
      RNIap.endConnection();
    };
  }, []);

  const initializeIAP = async () => {
    try {
      console.log('PaywallScreen: Starting IAP initialization...');
      
      // Initialize IAP connection
      await RNIap.initConnection();
      console.log('PaywallScreen: IAP connection initialized');

      // Get user email for verification
      const userEmail = await AsyncStorage.getItem('userUserName');
      if (!userEmail) {
        throw new Error('User email not found');
      }
      console.log('PaywallScreen: User email found:', userEmail);

      // Get subscriptions
      console.log('PaywallScreen: Fetching subscriptions with skus:', productIds);
      const items = await RNIap.getSubscriptions({ skus: productIds });
      console.log('PaywallScreen: Successfully fetched subscriptions:', items);

      if (!items || items.length === 0) {
        console.log('PaywallScreen: No products found. This might be because:');
        console.log('1. The app is not properly signed');
        console.log('2. The app is not published in Play Console');
        console.log('3. The test account is not properly set up');
        throw new Error('No subscription products found');
      }

      setProducts(items);
    } catch (error) {
      console.error('PaywallScreen: Error initializing IAP:', error);
      Alert.alert(
        'Error',
        'Failed to load subscription options. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product) => {
    try {
      setPurchasing(true);
      const userEmail = await AsyncStorage.getItem('userUserName');
      
      if (!userEmail) {
        throw new Error('User email not found');
      }

      console.log('PaywallScreen: Starting purchase for product:', product.productId);

      // Get the subscription offer token
      const offerToken = product.subscriptionOfferDetails?.[0]?.offerToken;
      if (!offerToken) {
        throw new Error('No subscription offer found');
      }

      // Start purchase flow
      const purchase = await RNIap.requestSubscription({
        sku: product.productId,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
        subscriptionOffers: [{
          sku: product.productId,
          offerToken: offerToken
        }]
      });

      console.log('PaywallScreen: Purchase completed:', purchase);

      // Calculate expiry date based on product ID
      const purchaseDate = new Date();
      let expiryDate = new Date(purchaseDate);

      switch (product.productId) {
        case 'monthly_plan':
          expiryDate.setDate(purchaseDate.getDate() + 30);
          break;
        case 'quarterly_plan':
          expiryDate.setDate(purchaseDate.getDate() + 90);
          break;
        case 'yearly_plan':
          expiryDate.setDate(purchaseDate.getDate() + 365);
          break;
        default:
          // Default to 30 days or handle unexpected product ID
          expiryDate.setDate(purchaseDate.getDate() + 30);
          console.warn('PaywallScreen: Unexpected product ID, defaulting to 30 days expiry:', product.productId);
          break;
      }

      // Format dates
      const formatISODate = (date) => date.toISOString().slice(0, 19).replace('T', ' ');
      const purchaseDateFormatted = formatISODate(purchaseDate);
      const expiryDateFormatted = formatISODate(expiryDate);

      // Verify purchase with backend
      const subscriptionData = {
        action:"UpdatePlane",
        email: userEmail,
        product_id: product.productId,
        purchase_token: purchase.transactionReceipt,
        order_id: purchase.transactionId,
        platform: 'android', // Note: This should ideally be Platform.OS for both Android/iOS
        price: product.subscriptionOfferDetails?.[0]?.pricingPhases?.pricingPhaseList?.[0]?.formattedPrice || product.price,
        purchase_date: purchaseDateFormatted,
        expiry_date: expiryDateFormatted,
        is_trial: 1,
        status: 'active'
      };

      console.log('PaywallScreen: Verifying subscription with backend:', subscriptionData);
      const response = await SubscriptionService.addSubscription(subscriptionData);
      
      if (response.status === 'success') {
        console.log('PaywallScreen: Subscription verified successfully');
        // Finish the transaction
        await RNIap.finishTransaction(purchase);
        // Check if onSubscriptionComplete is a function before calling it
        if (typeof onSubscriptionComplete === 'function') {
          onSubscriptionComplete(true);
        } else {
          console.error('onSubscriptionComplete prop is not a function');
        }
      } else {
        throw new Error('Failed to verify subscription with backend');
      }
    } catch (error) {
      console.error('PaywallScreen: Error during purchase:', error);
      
      // Show more specific error messages
      let errorMessage = 'Failed to complete purchase. Please try again.';
      if (error.message.includes('subscriptionOffers')) {
        errorMessage = 'Subscription configuration error. Please contact support.';
      } else if (error.message.includes('User cancelled')) {
        errorMessage = 'Purchase was cancelled.';
      } else if (error.message.includes('already owns')) {
        errorMessage = 'You already have an active subscription.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a subscription to continue</Text>
      
      {products.length > 0 ? (
        products.map((product) => (
          <View key={product.productId} style={styles.productContainer}>
            <View style={styles.productHeader}>
              <Text style={styles.productTitle}>{product.name}</Text>
              <Text style={styles.productPrice}>
                {product.subscriptionOfferDetails?.[0]?.pricingPhases?.pricingPhaseList?.[0]?.formattedPrice || product.price}
              </Text>
            </View>
            <Text style={styles.productDescription}>{product.description}</Text>
            <TouchableOpacity
              style={[styles.buyButton, purchasing && styles.buyButtonDisabled]}
              onPress={() => handlePurchase(product)}
              disabled={purchasing}
            >
              <Text style={styles.buyButtonText}>
                {purchasing ? 'Processing...' : 'Subscribe Now'}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProducts}>No subscription plans available</Text>
          <Text style={styles.noProductsSubtext}>
            Please make sure you are signed in with a test account
          </Text>
        </View>
      )}

      {/* <TouchableOpacity
        style={styles.bottomBackButton}
        onPress={() => navigation.navigate('TrialScreen')}
        disabled={purchasing}
      >
        <Text style={styles.bottomBackButtonText}>Go back</Text>
      </TouchableOpacity> */}

      {purchasing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Processing purchase...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  productContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  buyButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  noProductsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noProducts: {
    fontSize: 18,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 10,
  },
  noProductsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bottomBackButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  bottomBackButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default PaywallScreen; 