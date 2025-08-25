// components/AppLoader.js

import React, { useEffect, useRef } from 'react';
import { View, Modal, StyleSheet, Animated, Easing } from 'react-native';

const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D']; // Modern bright colors

const AppLoader = ({ visible = true }) => {
  const animations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current
  ];

  useEffect(() => {
    const createAnimation = (anim: Animated.Value | Animated.ValueXY, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: false
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: false
          })
        ])
      ).start();
    };

    animations.forEach((anim, i) => createAnimation(anim, i * 150));
  }, []);

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.dotsContainer}>
          {animations.map((anim, i) => {
            const backgroundColor = anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['#ccc', colors[i]]
            });
            return <Animated.View key={i} style={[styles.dot, { backgroundColor }]} />;
          })}
        </View>
      </View>
    </Modal>
  );
};

export default AppLoader;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7
  }
});
