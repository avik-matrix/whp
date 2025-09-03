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

// New color sequence based on gradient image
const BG_COLORS = [
  "#006400", // 0: DarkGreen
  "#024902ff", // 1: DarkGreen variant
  "#800080", // 2: Purple
  "#000080", // 3: NavyBlue
];

export default function App() {
  const bandWidth = W * 3.2;
  const containerWidth = bandWidth * 2;
  const containerHeight = H * 2.2;

  const plumX = useRef(new Animated.Value(0)).current;
  const amberX = useRef(new Animated.Value(0)).current;
  const forestX = useRef(new Animated.Value(0)).current;
  const sweepAnim = useRef(new Animated.Value(0)).current;

  // Background anim, starting at 0 (DarkGreen)
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
      easing: Easing.inOut(Easing.sin), // Wavy easing for smooth transition
      useNativeDriver: false,
    });

  useEffect(() => {
    // Bands
    const startSeamless = (anim: Animated.Value, duration: number, delay = 0) => {
      const loopAnim = Animated.loop(
        Animated.sequence([
          Animated.delay(delay / 2),
          Animated.timing(anim, {
            toValue: -bandWidth,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin), // Wavy easing for bands
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
        Animated.delay(6000 / 2),
        Animated.timing(sweepAnim, {
          toValue: 1,
          duration: 900 / 2,
          easing: Easing.inOut(Easing.sin), // Wavy easing for sweep
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

    // Background bounce sequence, starting with DarkGreen
    const forward = [1, 2, 3]; // Move to DarkGreen variant, Purple, then NavyBlue
    const backward = [3, 2, 1, 0]; // Back to NavyBlue, Purple, DarkGreen variant, DarkGreen
    const sequence = [...forward, ...backward]; // Start with forward sequence immediately

    const runLoop = () => {
      Animated.sequence(
        sequence.map((step) => animateStep(step, 6000 / 2)) // Increased duration for smoother transitions
      ).start(runLoop);
    };

    // Start animation only after image is loaded
    if (imgLoaded) {
      Animated.sequence([
        animateStep(1, 2500 / 2), // Slightly longer transition for smoothness
      ]).start(() => {
        runLoop();
      });
    }

    // Shimmer
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(shimmerX, {
            toValue: W * 2,
            duration: 8000 / 2,
            easing: Easing.inOut(Easing.sin), // Wavy easing for shimmer
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(shimmerOpacity, {
              toValue: 0.18,
              duration: 2000 / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(shimmerOpacity, {
              toValue: 0,
              duration: 2000 / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(shimmerX, { toValue: -W * 2, duration: 0, useNativeDriver: true }),
      ])
    );
    if (imgLoaded) shimmerLoop.start();

    return () => {
      stopPlum?.();
      stopAmber?.();
      stopForest?.();
      shimmerLoop.stop();
    };
  }, [imgLoaded]);

  useEffect(() => {
    if (imgLoaded) {
      Animated.timing(coverOpacity, {
        toValue: 0,
        duration: 100 / 2, // Faster fade to show image quicker
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [imgLoaded]);

  const tx = (anim: Animated.Value) => ({ translateX: anim });

  const bgColors = bgAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: BG_COLORS,
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* PNG as base background */}
      <ImageBackground
        source={BG}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* Animated Gradient on top */}
        <Animated.View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={[bgColors as any, bgColors as any]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* DarkGreen Band */}
        <Animated.View
          pointerEvents="none"
          style={[styles.band, { width: containerWidth, height: containerHeight, transform: [{ rotate: "-15deg" }, tx(plumX)] }]}
        >
          <RowBands bandWidth={bandWidth} bandHeight={containerHeight} mid={`rgba(0,100,0,${BAND_CORE_ALPHA - 0.06})`} />
          <BandShimmer shimmerX={shimmerX} shimmerOpacity={shimmerOpacity} color="rgba(0,100,0,0.35)" />
        </Animated.View>

        {/* DarkGreen Variant Band */}
        <Animated.View
          pointerEvents="none"
          style={[styles.band, { width: containerWidth, height: containerHeight, transform: [{ rotate: "-15deg" }, tx(plumX)] }]}
        >
          <RowBands bandWidth={bandWidth} bandHeight={containerHeight} mid={`rgba(2,73,2,${BAND_CORE_ALPHA - 0.06})`} />
          <BandShimmer shimmerX={shimmerX} shimmerOpacity={shimmerOpacity} color="rgba(1,82,1,0.35)" />
        </Animated.View>

        {/* Purple Band */}
        <Animated.View
          pointerEvents="none"
          style={[styles.band, { width: containerWidth, height: containerHeight, transform: [{ rotate: "12deg" }, tx(amberX)] }]}
        >
          <RowBands bandWidth={bandWidth} bandHeight={containerHeight} mid={`rgba(128,0,128,${BAND_CORE_ALPHA})`} />
          <BandShimmer shimmerX={shimmerX} shimmerOpacity={shimmerOpacity} color="rgba(128,0,128,0.54)" />
        </Animated.View>

        {/* NavyBlue Band */}
        <Animated.View
          pointerEvents="none"
          style={[styles.band, { width: containerWidth, height: containerHeight, transform: [{ rotate: "-10deg" }, tx(forestX)] }]}
        >
          <RowBands bandWidth={bandWidth} bandHeight={containerHeight} mid={`rgba(0,0,128,${BAND_CORE_ALPHA - 0.10})`} />
          <BandShimmer shimmerX={shimmerX} shimmerOpacity={shimmerOpacity} color="rgba(0,0,128,0.54)" />
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
          { backgroundColor: "transparent", opacity: coverOpacity },
        ]}
      />
      {Platform.OS === "android" && <View style={styles.androidShim} />}
    </View>
  );
}

function RowBands({ bandWidth, bandHeight, mid }: { bandWidth: number; bandHeight: number; mid: string }) {
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
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
  container: { position: "absolute", width: W, height: H, backgroundColor: "transparent" },
  band: { position: "absolute", top: -H * 0.6, left: -W * 0.6, opacity: 1 },
  center: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
  logo: { color: "#fff", fontSize: 32, fontWeight: "bold", letterSpacing: 2 },
  androidShim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.02)" },
});