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
const BG = require("./assets/Splash-Whippitz.png");

const BAND_CORE_ALPHA = 0.55;

// Color sequence (Green intro only)
const BG_COLORS = [
  "#2FDD6E",   // 0: Green
  "#2E1B7B",   // 1: Blue/Purple
  "#00FFFF",   // 2: Cyan
  "#FF00AA",   // 3: Magenta
  "#AA00FF",   // 4: Violet
  "#8B4513",   // 5: Brown
  "#800080",   // 6: Purple
];

export default function App() {
  const bandWidth = W * 3.2;
  const containerWidth = bandWidth * 2;
  const containerHeight = H * 2.2;

  const plumX = useRef(new Animated.Value(0)).current;
  const amberX = useRef(new Animated.Value(0)).current;
  const forestX = useRef(new Animated.Value(0)).current;
  const sweepAnim = useRef(new Animated.Value(0)).current;

  // Background anim
  const bgAnim = useRef(new Animated.Value(0)).current;

  // Shimmer
  const shimmerX = useRef(new Animated.Value(0)).current;
  const shimmerOpacity = useRef(new Animated.Value(0)).current;

  // Cover fade
  const [imgLoaded, setImgLoaded] = useState(false);
  const coverOpacity = useRef(new Animated.Value(1)).current;

  const animateStep = (to: number, duration: number) =>
    Animated.timing(bgAnim, {
      toValue: to,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    });

  useEffect(() => {
    // Bands
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

    // Sweep overlay
    const sweepCycle = () => {
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
      ]).start(sweepCycle);
    };
    sweepCycle();

    // Background bounce sequence
    const forward = [1, 2, 3, 4, 5]; // after Green
    const backward = [4, 3, 2, 1, 0];
    const sequence = [...forward, ...backward];

    const runLoop = () => {
      Animated.sequence(
        sequence.map((step) => animateStep(step, 5000)) // 5s per step
      ).start(runLoop);
    };

    // Start: Green → Blue fast
    Animated.sequence([
      animateStep(1, 2000), // Green → Blue/Purple quick intro
    ]).start(() => {
      runLoop();
    });

    // Shimmer
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(shimmerX, {
            toValue: W * 2,
            duration: 8000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(shimmerOpacity, {
              toValue: 0.18,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(shimmerOpacity, {
              toValue: 0,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(shimmerX, { toValue: -W * 2, duration: 0, useNativeDriver: true }),
      ])
    );
    shimmerLoop.start();

    return () => {
      stopPlum?.();
      stopAmber?.();
      stopForest?.();
      shimmerLoop.stop();
    };
  }, []);

  useEffect(() => {
    if (imgLoaded) {
      Animated.timing(coverOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [imgLoaded]);

  const tx = (anim: Animated.Value) => ({ translateX: anim });

  const bgColors = bgAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5],
    outputRange: BG_COLORS.slice(0, 6),
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background */}
      <Animated.View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[bgColors as any, bgColors as any]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* PNG */}
      <ImageBackground
        source={BG}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        onLoad={() => setImgLoaded(true)}
      >
        {/* Plum */}
        <Animated.View
          pointerEvents="none"
          style={[styles.band, { width: containerWidth, height: containerHeight, transform: [{ rotate: "-15deg" }, tx(plumX)] }]}
        >
          <RowBands bandWidth={bandWidth} bandHeight={containerHeight} mid={`rgba(43,7,33,${BAND_CORE_ALPHA})`} />
          <BandShimmer shimmerX={shimmerX} shimmerOpacity={shimmerOpacity} color="rgba(90,20,70,0.54)" />
        </Animated.View>

        {/* Amber */}
        <Animated.View
          pointerEvents="none"
          style={[styles.band, { width: containerWidth, height: containerHeight, transform: [{ rotate: "12deg" }, tx(amberX)] }]}
        >
          <RowBands bandWidth={bandWidth} bandHeight={containerHeight} mid={`rgba(46,32,0,${BAND_CORE_ALPHA - 0.06})`} />
          <BandShimmer shimmerX={shimmerX} shimmerOpacity={shimmerOpacity} color="rgba(150,90,15,0.35)" />
        </Animated.View>

        {/* Forest */}
        <Animated.View
          pointerEvents="none"
          style={[styles.band, { width: containerWidth, height: containerHeight, transform: [{ rotate: "-10deg" }, tx(forestX)] }]}
        >
          <RowBands bandWidth={bandWidth} bandHeight={containerHeight} mid={`rgba(2,45,9,${BAND_CORE_ALPHA - 0.10})`} />
          <BandShimmer shimmerX={shimmerX} shimmerOpacity={shimmerOpacity} color="rgba(25, 80, 25, 0.54)" />
        </Animated.View>

        {/* Sweep */}
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

        {/* Center */}
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.logo}>WHIPPITZ</Text>
        </View>
      </ImageBackground>

      {/* Cover */}
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

function RowBands({ bandWidth, bandHeight, mid }: { bandWidth: number; bandHeight: number; mid: string }) {
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

function BandShimmer({ shimmerX, shimmerOpacity, color }: { shimmerX: Animated.Value; shimmerOpacity: Animated.Value; color: string }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{ ...StyleSheet.absoluteFillObject, opacity: shimmerOpacity, transform: [{ translateX: shimmerX }] }}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0)", color, "rgba(0,0,0,0)"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", width: W, height: H, backgroundColor: "#300317" },
  band: { position: "absolute", top: -H * 0.6, left: -W * 0.6, opacity: 1 },
  center: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
  logo: { color: "#fff", fontSize: 32, fontWeight: "bold", letterSpacing: 2 },
  androidShim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.02)" },
});
