// App.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  View,
  Text,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

const { width: W, height: H } = Dimensions.get("window");

// Use your exact PNG for pixel-to-pixel base
const BG = require("./assets/Splash-Whippitz.png");

// Visual tuning
const BAND_CORE_ALPHA = 0.68;

export default function App() {
  // band geometry
  const bandWidth = W * 3.2;
  const containerWidth = bandWidth * 2;
  const containerHeight = H * 2.2;

  // band animations
  const plumX = useRef(new Animated.Value(0)).current;
  const amberX = useRef(new Animated.Value(0)).current;
  const forestX = useRef(new Animated.Value(0)).current;
  const sweepAnim = useRef(new Animated.Value(0)).current;

  // image fade-in overlay (prevents any flash before PNG is ready)
  const [imgLoaded, setImgLoaded] = useState(false);
  const coverOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const startSeamless = (anim: Animated.Value, duration: number, delay = 0) => {
      const loopAnim = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -bandWidth,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      loopAnim.start();
      return () => loopAnim.stop();
    };

    const SPEED = 0.85;
    const stopPlum = startSeamless(plumX, 8000 * SPEED, 0);
    const stopAmber = startSeamless(amberX, 10000 * SPEED, 1000 * SPEED);
    const stopForest = startSeamless(forestX, 12000 * SPEED, 2000 * SPEED);

    const cycle = () => {
      Animated.sequence([
        Animated.delay(6000),
        Animated.timing(sweepAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sweepAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(cycle);
    };
    cycle();

    return () => {
      stopPlum?.();
      stopAmber?.();
      stopForest?.();
    };
  }, [plumX, amberX, forestX, sweepAnim, bandWidth]);

  // fade the solid cover only after the PNG has loaded
  useEffect(() => {
    if (imgLoaded) {
      Animated.timing(coverOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [imgLoaded, coverOpacity]);

  const tx = (anim: Animated.Value) => ({ translateX: anim });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Pixel-perfect base image */}
      <ImageBackground
        source={BG}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        onLoad={() => setImgLoaded(true)}
      >
        {/* Moving tint bands */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.band,
            {
              width: containerWidth,
              height: containerHeight,
              transform: [{ rotate: "-15deg" }, tx(plumX)],
            },
          ]}
        >
          <RowBands
            bandWidth={bandWidth}
            bandHeight={containerHeight}
            mid={`rgba(43,7,33,${BAND_CORE_ALPHA})`} // plum #2B0721
          />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.band,
            {
              width: containerWidth,
              height: containerHeight,
              transform: [{ rotate: "12deg" }, tx(amberX)],
            },
          ]}
        >
          <RowBands
            bandWidth={bandWidth}
            bandHeight={containerHeight}
            mid={`rgba(46,32,0,${BAND_CORE_ALPHA - 0.06})`} // amber #2E2000
          />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.band,
            {
              width: containerWidth,
              height: containerHeight,
              transform: [{ rotate: "-10deg" }, tx(forestX)],
            },
          ]}
        >
          <RowBands
            bandWidth={bandWidth}
            bandHeight={containerHeight}
            mid={`rgba(2,45,9,${BAND_CORE_ALPHA - 0.10})`} // forest #022D09
          />
        </Animated.View>

        {/* Optional black sweep */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -W * 2,
            top: -H * 0.6,
            width: W * 5,
            height: H * 2,
            transform: [
              {
                translateX: sweepAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [W * 2, -W * 2],
                }),
              },
              { rotate: "-20deg" },
            ],
            opacity: sweepAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.25, 0],
            }),
          }}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>

        {/* Center content */}
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.logo}>WHIPPITZ</Text>
        </View>
      </ImageBackground>

      {/* Solid cover that fades out after image load (prevents any flash) */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: "#300317", opacity: coverOpacity },
        ]}
      />

      {Platform.OS === "android" && <View style={styles.androidShim} />}
    </View>
  );
}

/** draws two horizontal gradients side-by-side for seamless scrolling */
function RowBands({
  bandWidth,
  bandHeight,
  mid,
}: {
  bandWidth: number;
  bandHeight: number;
  mid: string;
}) {
  return (
    <View style={{ flexDirection: "row" }}>
      {[0, 1].map((i) => (
        <LinearGradient
          key={i}
          colors={["rgba(0,0,0,0)", mid, "rgba(0,0,0,0)"]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: bandWidth, height: bandHeight }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: W,
    height: H,
    backgroundColor: "#300317", // solid fallback matches your PNG's top tone
  },
  band: {
    position: "absolute",
    top: -H * 0.6,
    left: -W * 0.6,
    opacity: 1,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  androidShim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
});
