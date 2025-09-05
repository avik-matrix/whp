import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

// Make LinearGradient animatable
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const App = () => {
  const colorAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-1)).current; // starts off-screen

  useEffect(() => {
    // Background color animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Shine effect animation (diagonal sweep back and forth)
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 2, // forward sweep
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: -1, // backward sweep
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Animated background gradient
  const color1 = colorAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['#04893F', '#03602C', '#034E24', '#0A209C', '#9445e9ff'],
  });
  
  const color2 = colorAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['#9445e9ff', '#0A209C', '#034E24', '#03602C', '#04893F'],
  });

  const color3 = colorAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['#04893F', '#03602C', '#034E24', '#0A209C', '#9445e9ff'],
  });

  const color4 = colorAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['#9445e9ff', '#0A209C', '#034E24', '#03602C', '#04893F'],
  });

  // Shine movement (diagonal)
  const translateX = shineAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-500, 500], // adjust depending on screen size
  });

  const translateY = shineAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-500, 500],
  });

  return (
    <View style={styles.containerMain}>
      {/* Animated gradient background */}
      <AnimatedLinearGradient
        colors={[color1, color2, color3, color4]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }} // 45° diagonal
        style={StyleSheet.absoluteFill}
      />

      {/* Shining sweep layer */}
      <Animated.View
        style={[
          styles.shineContainer,
          {
            transform: [{ translateX }, { translateY }, { rotate: '45deg' }], // rotate streak
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255,255,255,0.10)',
            'rgba(255,255,255,0.20)', // bright center
            'rgba(255,255,255,0.10)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shine}
        />
      </Animated.View>

      {/* Dark overlay */}
      <View style={styles.overlayOuter} />

      {/* Content */}
      <View style={styles.container}>
        <Text style={styles.text1}>Welcome</Text>
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
  },
  text1: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 70,
    textAlign: 'center',
    zIndex: 3,
  },
  container: {
    backgroundColor: 'transparent',
    flex: 1,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  overlayOuter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    opacity: 0.7,
    zIndex: 1,
  },
  shineContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    overflow: 'hidden',
  },
  shine: {
    width:300,         // narrow streak instead of full flex
    height:'300%',     // tall so rotation covers screen
    opacity: 0.7,
  },
});