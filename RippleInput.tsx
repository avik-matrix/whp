import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  Easing,
  TextInputProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface RippleInputProps extends TextInputProps {
  placeholder?: string;
}

const RippleInput: React.FC<RippleInputProps> = ({ placeholder, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  // Ripple animation refs
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  const startRipple = () => {
    rippleScale.setValue(0);
    rippleOpacity.setValue(0.5);

    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFocus = () => {
    setIsFocused(true);
    startRipple();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View style={[styles.container, isFocused && styles.inputFocused]}>
      {/* Ripple effect circle */}
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
          colors={["#ffffff", "#d9d9d9", "#f5f5f5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Text Input */}
      <TextInput
        {...props}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#ccc"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "transparent", // transparent input background
  },
  input: {
    padding: 14,
    fontSize: 16,
    color: "#fff", // white text for visibility on dark backgrounds
  },
  inputFocused: {
    borderColor: "#ffffff",
  },
  ripple: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 220,
    height: 220,
    borderRadius: 110,
    marginLeft: -110,
    marginTop: -110,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    borderRadius: 110,
  },
});

export default RippleInput;
