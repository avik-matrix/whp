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

const BG_COLORS = [
  "#006400", // DarkGreen
  "#13c913ff", // Green variant
  "#800080", // Purple
  "#000080", // Navy
];

export default function App() {
  const bandWidth = W * 3.2;
  const containerWidth = bandWidth * 2;
  const containerHeight = H * 2.2;

  const plumX = useRef(new Animated.Value(0)).current;
  const amberX = useRef(new Animated.Value(0)).current;
  const forestX = useRef(new Animated.Value(0)).current;
  const greenVariantX = useRef(new Animated.Value(0)).current;
  const sweepAnim = useRef(new Animated.Value(0)).current;

  const bgAnim = useRef(new Animated.Value(0)).current;
  const shimmerX = useRef(new Animated.Value(0)).current;
  const shimmerOpacity = useRef(new Animated.Value(0)).current;

  const [imgLoaded, setImgLoaded] = useState(false);
  const coverOpacity = useRef(new Animated.Value(1)).current;

  const animateStep = (to: number, duration: number) =>
    Animated.timing(bgAnim, {
      toValue: to,
      duration,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: false,
    });

  useEffect(() => {
    const startSeamless = (anim: Animated.Value, duration: number, delay = 0) => {
      const loopAnim = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -bandWidth,
            duration,
            easing: Easing.inOut(Easing.sin),
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

    // ⚡ Faster speeds (cut in half)
    const stopPlum = startSeamless(plumX, 4000, 0);
    const stopGreenVariant = startSeamless(greenVariantX, 4500, 2000);
    const stopAmber = startSeamless(amberX, 5000, 3000);
    const stopForest = startSeamless(forestX, 6000, 4000);

    // Sweep faster
    const sweepCycle = () => {
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(sweepAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sweepAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]).start(sweepCycle);
    };
    sweepCycle();

    // Background cycle faster
    const forward = [1, 2, 3];
    const backward = [3, 2, 1, 0];
    const sequence = [...forward, ...backward];

    const runLoop = () => {
      Animated.sequence(sequence.map((step) => animateStep(step, 3000))).start(runLoop);
    };

    if (imgLoaded) {
      Animated.sequence([
        animateStep(0, 0),
        Animated.delay(1000),
        animateStep(1, 1500),
      ]).start(() => {
        runLoop();
      });
    }

    // Shimmer faster
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(shimmerX, {
            toValue: W * 2,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(shimmerOpacity, {
              toValue: 0.18,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(shimmerOpacity, {
              toValue: 0,
              duration: 1000,
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
      stopGreenVariant?.();
      stopAmber?.();
      stopForest?.();
      shimmerLoop.stop();
    };
  }, [imgLoaded]);

  useEffect(() => {
    if (imgLoaded) {
      Animated.timing(coverOpacity, {
        toValue: 0,
        duration: 150,
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
      <ImageBackground
        source={BG}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        onLoadEnd={() => setImgLoaded(true)}
      >
        <Animated.View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={[bgColors as any, bgColors as any]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* DarkGreen */}
        <Animated.View
          pointerEvents="none"
          style={[styles.band, { width: containerWidth, height: containerHeight, transform: [{ rotate: "-15deg" }, tx(plumX)] }]}
        >
          <RowBands bandWidth={bandWidth} bandHeight={containerHeight} mid={`rgba(0,100,0,${BAND_CORE_ALPHA})`} />
          <BandShimmer shimmerX={shimmerX} shimmerOpacity={shimmerOpacity} color="rgba(0,100,0,0.45)" />
        </Animated.View>

        {/* Variant Green */}
        <Animated.View
          pointerEvents="none"
          style={[styles.band, { width: containerWidth, height: containerHeight, transform: [{ rotate: "-15deg" }, tx(greenVariantX)] }]}
        >
          <RowBands bandWidth={bandWidth} bandHeight={containerHeight} mid={`rgba(16,206,16,${BAND_CORE_ALPHA - 0.1})`} />
          <BandShimmer shimmerX={shimmerX} shimmerOpacity={shimmerOpacity} color="rgba(16,206,16,0.4)" />
        </Animated.View>

        {/* Purple */}
        <Animated.View
          pointerEvents="none"
          style={[styles.band, { width: containerWidth, height: containerHeight, transform: [{ rotate: "12deg" }, tx(amberX)] }]}
        >
          <RowBands bandWidth={bandWidth} bandHeight={containerHeight} mid={`rgba(128,0,128,${BAND_CORE_ALPHA})`} />
          <BandShimmer shimmerX={shimmerX} shimmerOpacity={shimmerOpacity} color="rgba(128,0,128,0.54)" />
        </Animated.View>

        {/* Navy */}
        <Animated.View
          pointerEvents="none"
          style={[styles.band, { width: containerWidth, height: containerHeight, transform: [{ rotate: "-10deg" }, tx(forestX)] }]}
        >
          <RowBands bandWidth={bandWidth} bandHeight={containerHeight} mid={`rgba(0,0,128,${BAND_CORE_ALPHA})`} />
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

        <View style={styles.center} pointerEvents="none">
          <Text style={styles.logo}>WHIPPITZ</Text>
        </View>
      </ImageBackground>

      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "transparent", opacity: coverOpacity }]}
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
