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
  // White sheen
  const sheen = useRef(new Animated.Value(-width)).current;
  const sheenOpacity = useRef(new Animated.Value(0.18)).current;

  // Magenta
  const magenta = useRef(new Animated.Value(-width * 1.2)).current;
  const magentaOpacity = useRef(new Animated.Value(0.06)).current;

  // Cyan
  const cyan = useRef(new Animated.Value(width)).current;
  const cyanOpacity = useRef(new Animated.Value(0.06)).current;

  // Warm pink/orange
  const warm = useRef(new Animated.Value(-width * 1.5)).current;
  const warmOpacity = useRef(new Animated.Value(0.05)).current;

  useEffect(() => {
    // animations identical to before…
    const animateLoop = (val: Animated.Value, to: number, duration: number, reset: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: to, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(val, { toValue: reset, duration: 0, useNativeDriver: true }),
        ])
      ).start();

    animateLoop(sheen, width * 2, 4200, -width);
    animateLoop(magenta, width * 1.6, 9000, -width * 1.2);
    animateLoop(cyan, -width * 1.6, 12000, width);
    animateLoop(warm, width * 1.8, 14000, -width * 1.5);

    // opacity breathing
    const breathe = (val: Animated.Value, min: number, max: number, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: min, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(val, { toValue: max, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      ).start();

    breathe(sheenOpacity, 0.10, 0.18, 2100);
    breathe(magentaOpacity, 0.035, 0.06, 4500);
    breathe(cyanOpacity, 0.03, 0.06, 6000);
    breathe(warmOpacity, 0.025, 0.05, 7000);
  }, []);

  return (
    <View style={styles.container}>
      {/* 🎨 Base hero gradient */}
      <LinearGradient
        colors={["hsl(240,10%,3.9%)", "hsl(270,30%,15%)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ✨ White sheen */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.overlay,
          { opacity: sheenOpacity, transform: [{ translateX: sheen }, { rotate: "-18deg" }] },
        ]}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.85)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: width * 1.6, height: height * 1.25 }}
        />
      </Animated.View>

      {/* 🌸 Magenta (CSS primary) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.overlay,
          { opacity: magentaOpacity, transform: [{ translateX: magenta }, { rotate: "-10deg" }] },
        ]}
      >
        <LinearGradient
          colors={["hsla(270,95%,75%,0)", "hsla(320,85%,70%,0.15)", "hsla(270,95%,75%,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: width * 1.8, height: height * 1.2 }}
        />
      </Animated.View>

      {/* 💠 Cyan (CSS secondary) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.overlay,
          { opacity: cyanOpacity, transform: [{ translateX: cyan }, { rotate: "12deg" }] },
        ]}
      >
        <LinearGradient
          colors={["hsla(220,95%,65%,0)", "hsla(180,95%,65%,0.15)", "hsla(220,95%,65%,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: width * 1.8, height: height * 1.2 }}
        />
      </Animated.View>

      {/* 🔥 Warm accent (CSS accent) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.overlay,
          { opacity: warmOpacity, transform: [{ translateX: warm }, { rotate: "-6deg" }] },
        ]}
      >
        <LinearGradient
          colors={["hsla(340, 78%, 45%, 0.00)", "hsla(20, 78%, 44%, 0.12)", "hsla(340, 6%, 42%, 0.00)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: width * 2, height: height * 1.3 }}
        />
      </Animated.View>

      {Platform.OS === "android" && <View style={styles.androidShim} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width,
    height,
    backgroundColor: "black",
  },
  overlay: {
    position: "absolute",
    left: -width * 0.4,
    top: -height * 0.1,
    width: width * 2.8,
    height: height * 1.4,
  },
  androidShim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
});
