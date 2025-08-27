// App.tsx
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function App() {
  // band width: each moving gradient stripe is very wide so that
  // when rotated diagonally it still covers the full screen area.
  const bandWidth = width * 2.5;
  const containerWidth = bandWidth * 2; // two gradient copies placed side-by-side (for seamless loop)
  const containerHeight = height * 1.6;

  // animated values to control horizontal translation of each stripe
  const redX = useRef(new Animated.Value(0)).current;
  const greenX = useRef(new Animated.Value(0)).current;
  const blueX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    /**
     * Utility: creates an infinite loop moving the gradient
     * from `0` → `-bandWidth`, so the 2nd copy slides in and
     * creates a seamless endless scroll.
     */
    const startSeamless = (anim: Animated.Value, duration: number, delay = 0) => {
      const loopAnim = Animated.loop(
        Animated.timing(anim, {
          toValue: -bandWidth,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      if (delay > 0) {
        const t = setTimeout(() => loopAnim.start(), delay);
        return () => clearTimeout(t);
      } else {
        loopAnim.start();
        return () => loopAnim.stop();
      }
    };

    // Launch each color band with different speed + delay
    // so they overlap naturally instead of stacking together
    const stopRed = startSeamless(redX, 8000, 0);        // fastest, starts immediately
    const stopGreen = startSeamless(greenX, 10000, 1200); // medium speed, slight delay
    const stopBlue = startSeamless(blueX, 12000, 2400);   // slowest, starts last

    return () => {
      stopRed && stopRed();
      stopGreen && stopGreen();
      stopBlue && stopBlue();
    };
  }, [redX, greenX, blueX, bandWidth]);

  // shortcut: apply Animated.Value as translateX transform
  const tx = (anim: Animated.Value) => ({ translateX: anim });

  return (
    <View style={styles.container}>
      {/**
       * BASE GRADIENT (static, always visible background).
       * This is the dark purplish background from CSS `--gradient-hero`.
       * It provides depth and ensures the screen is never empty.
       */}
      <LinearGradient
        colors={["hsl(240,10%,3.9%)", "hsl(270,30%,15%)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/**
       * MOVING RED STRIPE
       * Two identical gradient strips placed side-by-side, sliding horizontally.
       * Center has a reddish hue with transparency fading to edges → creates
       * a “tint” that moves across the screen.
       */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.band,
          {
            left: -bandWidth * 0.5,
            width: containerWidth,
            height: containerHeight,
            transform: [{ rotate: "-15deg" }, tx(redX)], // slight diagonal rotation
            opacity: 0.9,
          },
        ]}
      >
        <View style={{ flexDirection: "row" }}>
          <LinearGradient
            colors={[
              "rgba(255,60,126,0)",   // transparent edge
              "rgba(255,60,126,0.22)", // reddish core
              "rgba(255,60,126,0)",   // transparent edge
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: bandWidth, height: containerHeight }}
          />
          <LinearGradient
            colors={[
              "rgba(255,60,126,0)",
              "rgba(255,60,126,0.22)",
              "rgba(255,60,126,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: bandWidth, height: containerHeight }}
          />
        </View>
      </Animated.View>

      {/**
       * MOVING GREEN STRIPE
       * Same as above but with a green tint, slower and rotated opposite
       * to create variation. Overlaps with red/blue for dynamic hues.
       */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.band,
          {
            left: -bandWidth * 0.6,
            width: containerWidth,
            height: containerHeight,
            transform: [{ rotate: "12deg" }, tx(greenX)],
            opacity: 0.9,
          },
        ]}
      >
        <View style={{ flexDirection: "row" }}>
          <LinearGradient
            colors={[
              "rgba(42,255,144,0)",
              "rgba(42,255,144,0.18)",
              "rgba(42,255,144,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: bandWidth, height: containerHeight }}
          />
          <LinearGradient
            colors={[
              "rgba(42,255,144,0)",
              "rgba(42,255,144,0.18)",
              "rgba(42,255,144,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: bandWidth, height: containerHeight }}
          />
        </View>
      </Animated.View>

      {/**
       * MOVING BLUE STRIPE
       * Similar idea again, but bluish tint, slowest speed, different angle.
       * Because all three overlap, the visual blends into shifting purple,
       * teal, and magenta — same as the website background effect.
       */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.band,
          {
            left: -bandWidth * 0.55,
            width: containerWidth,
            height: containerHeight,
            transform: [{ rotate: "-10deg" }, tx(blueX)],
            opacity: 0.9,
          },
        ]}
      >
        <View style={{ flexDirection: "row" }}>
          <LinearGradient
            colors={[
              "rgba(60,182,255,0)",
              "rgba(60,182,255,0.18)",
              "rgba(60,182,255,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: bandWidth, height: containerHeight }}
          />
          <LinearGradient
            colors={[
              "rgba(60,182,255,0)",
              "rgba(60,182,255,0.18)",
              "rgba(60,182,255,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: bandWidth, height: containerHeight }}
          />
        </View>
      </Animated.View>

      {/**
       * SUBTLE WHITE SHEEN OVERLAY
       * A faint diagonal white gradient overlaid above everything.
       * Adds a glossy "sheen" so transitions feel softer and less flat.
       */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: 0.06,
            transform: [{ rotate: "-10deg" }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.28)",
            "rgba(255,255,255,0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: width * 2,
            height: height * 2,
            left: -width * 0.5,
            top: -height * 0.2,
          }}
        />
      </Animated.View>

      {/**
       * ANDROID SHIM
       * A tiny nearly-transparent black overlay. On some Android
       * devices it smooths out banding/buffering in gradients.
       */}
      {Platform.OS === "android" && <View style={styles.androidShim} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width,
    height,
    backgroundColor: "black", // base fallback background
  },
  band: {
    position: "absolute",
    top: -height * 0.4,
  },
  androidShim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
});
