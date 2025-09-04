import React, { useRef } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface RippleButtonProps {
  title: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const RippleButton: React.FC<RippleButtonProps> = ({
  title,
  onPress,
  containerStyle,
  textStyle,
}) => {
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  const startRipple = () => {
    rippleScale.setValue(0);
    rippleOpacity.setValue(0.6);

    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    startRipple();
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, containerStyle]}
    >
      {/* Ripple */}
      <Animated.View
        style={[
          styles.ripple,
          {
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      >
        <LinearGradient
          colors={["#ffffff", "#e0e0e0", "#f5f5f5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Button Label */}
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "transparent", // transparent background
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 240,
    height: 240,
    borderRadius: 120,
    marginLeft: -120,
    marginTop: -120,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    borderRadius: 120,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RippleButton;
