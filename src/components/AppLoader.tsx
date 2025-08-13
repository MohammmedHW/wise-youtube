// components/AppLoader.js

import React from 'react';
import {View, Modal, StyleSheet, Text} from 'react-native';
import LottieView from 'lottie-react-native';

const AppLoader = ({message = 'Loading...'}) => {
  return (
    <Modal transparent={true} animationType="fade" visible={true}>
      <View style={styles.overlay}>
        <View style={styles.loaderContainer}>
          <LottieView
            source={require('../../assets/lotties/loader.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AppLoader;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 120,
    height: 120,
  },
  loaderText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
