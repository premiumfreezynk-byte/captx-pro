import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface CountdownOverlayProps {
  value: number;
}

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  const colors = useColors();
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = 0.4;
    opacity.value = 0;
    scale.value = withSequence(
      withTiming(1.1, { duration: 200 }),
      withTiming(0.95, { duration: 300 }),
      withTiming(1, { duration: 100 }),
      withTiming(0.8, { duration: 400 })
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 600 }),
      withTiming(0, { duration: 200 })
    );
  }, [value]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]}>
      <View style={[styles.backdrop, { backgroundColor: "rgba(0,0,0,0.7)" }]} />
      <Animated.View style={[animStyle, styles.container]}>
        <Animated.Text
          style={[styles.text, { color: value === 0 ? colors.recording : colors.primary }]}
        >
          {value === 0 ? "REC" : value.toString()}
        </Animated.Text>
        <Animated.Text style={[styles.sub, { color: colors.mutedForeground }]}>
          {value === 0 ? "Starting..." : "Get ready"}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    alignItems: "center",
  },
  text: {
    fontSize: 96,
    fontFamily: "Inter_700Bold",
    lineHeight: 100,
  },
  sub: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    marginTop: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
