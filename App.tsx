// App.tsx
import React, { useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  useWindowDimensions,
  Text,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * This component:
 *  - uses the original CSS gradient stops (from your site)
 *  - applies the CSS-like filter: hue-rotate(185.395deg) brightness(1.02997) saturate(2.02997)
 *    by converting each stop to HSL and adjusting H/S/L (approximation of CSS filters)
 *  - animates a very large gradient sheet so it "sweeps" across the viewport
 */

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

// CSS original stops taken from your example
const ORIGINAL_STOPS = [
  "#FF00FF", // rgb(255,0,255)
  "#00FFFF", // rgb(0,255,255)
  "#FF00AA", // rgb(255,0,170)
  "#AA00FF", // rgb(170,0,255)
  "#FFAA00", // rgb(255,170,0)
  "#00FF00", // rgb(0,255,0)
];

// CSS filter parameters exactly as in your CSS
const HUE_ROTATE_DEG = 185.395;
const SATURATE_FACTOR = 2.02997;
const BRIGHTNESS_FACTOR = 1.02997;

/* ------------------ color helpers (hex <-> rgb <-> hsl) ------------------ */
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return [r, g, b] as const;
}

function rgbToHex(r: number, g: number, b: number) {
  const rr = Math.max(0, Math.min(255, Math.round(r)));
  const gg = Math.max(0, Math.min(255, Math.round(g)));
  const bb = Math.max(0, Math.min(255, Math.round(b)));
  return (
    "#" +
    rr.toString(16).padStart(2, "0").toUpperCase() +
    gg.toString(16).padStart(2, "0").toUpperCase() +
    bb.toString(16).padStart(2, "0").toUpperCase()
  );
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s, l] as const; // H in degrees
}

function hslToRgb(hDeg: number, s: number, l: number) {
  const h = (hDeg % 360 + 360) % 360; // normalize
  const hh = h / 360;

  if (s === 0) {
    const val = l * 255;
    return [val, val, val] as const;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  function hue2rgb(pv: number, qv: number, tv: number) {
    let t = tv;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  const r = hue2rgb(p, q, hh + 1 / 3) * 255;
  const g = hue2rgb(p, q, hh) * 255;
  const b = hue2rgb(p, q, hh - 1 / 3) * 255;
  return [r, g, b] as const;
}

/** Apply CSS-like hue-rotate, saturate, brightness to a hex color (approx) */
function applyCssFiltersToHex(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  let [h, s, l] = rgbToHsl(r, g, b);
  // hue rotate
  h = (h + HUE_ROTATE_DEG) % 360;
  // saturate
  s = Math.min(1, s * SATURATE_FACTOR);
  // brightness approximation (apply to lightness)
  l = Math.min(1, l * BRIGHTNESS_FACTOR);
  const [rr, gg, bb] = hslToRgb(h, s, l);
  return rgbToHex(rr, gg, bb);
}

/* ------------------ main component ------------------ */
type Props = {
  duration?: number; // ms per leg
  opacity?: number;
};

export default function App({
  duration = 8000,
  opacity = 0.6,
}: Props) {
  const { width, height } = useWindowDimensions();

  // compute filtered colors once (matches CSS-style filter)
  const filteredColors = useMemo(
    () => ORIGINAL_STOPS.map((c) => applyCssFiltersToHex(c)),
    []
  );

  // Large surface so the gradient always covers while moving
  const bigW = width * 5;
  const bigH = height * 5;

  // Center the big sheet so it doesn't reveal black edges
  const left = (width - bigW) / 2;
  const top = (height - bigH) / 2;

  // Travel distances for motion (tweak to taste)
  const travelX = width * 1.5;
  const travelY = height * 1.5;

  const tx = useMemo(() => new Animated.Value(0), []);
  const ty = useMemo(() => new Animated.Value(0), []);
  const pulse = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    // horizontal & vertical smooth drift, continuous
    const moveX = Animated.loop(
      Animated.sequence([
        Animated.timing(tx, {
          toValue: travelX,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(tx, {
          toValue: -travelX,
          duration: duration * 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(tx, {
          toValue: 0,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    const moveY = Animated.loop(
      Animated.sequence([
        Animated.timing(ty, {
          toValue: -travelY,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(ty, {
          toValue: travelY,
          duration: duration * 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(ty, {
          toValue: 0,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    moveX.start();
    moveY.start();
    pulseAnim.start();

    return () => {
      moveX.stop();
      moveY.stop();
      pulseAnim.stop();
    };
  }, [duration, travelX, travelY, tx, ty, pulse]);

  // debugging: log the computed filtered colors once
  // (uncomment if you want to see them in Metro)
  // console.log("filtered gradient stops:", filteredColors);

  return (
    <View style={styles.container}>
      {/* Background gradient sheet (rendered first so content naturally stacks on top) */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
        <AnimatedView
          style={{
            width: bigW,
            height: bigH,
            position: "absolute",
            left,
            top,
            transform: [{ translateX: tx }, { translateY: ty }],
          }}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }} // ~ -45deg angle feel
            colors={filteredColors}
            // non-even stops to create strong bands similar to CSS example
            locations={[0, 0.18, 0.36, 0.56, 0.78, 1]}
            style={{ width: "100%", height: "100%" }}
          />
        </AnimatedView>
      </View>

      {/* Foreground content */}
      <View style={styles.center}>
        <AnimatedText
          style={[
            styles.text,
            {
              transform: [{ scale: pulse }],
            },
          ]}
        >
          🎉 LET’S PARTY 🎶
        </AnimatedText>
        {/* example subtext — tweak or remove */}
        <Text style={styles.subtext}>Rave gradient — exact filters applied</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent", // keep transparent so the gradient shows everywhere
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  text: {
    fontSize: Platform.OS === "ios" ? 48 : 42,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 2,
    // Neony glow
    textShadowColor: "#FFFFFF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
  subtext: {
    marginTop: 12,
    color: "#FFF",
    opacity: 0.9,
    fontSize: 14,
  },
});
