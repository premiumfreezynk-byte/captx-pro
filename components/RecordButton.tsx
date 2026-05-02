import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

interface RecordButtonProps {
  isRecording: boolean;
  isPaused: boolean;
  onPress: () => void;
  size?: number;
}

export function RecordButton({ isRecording, isPaused, onPress, size = 88 }: RecordButtonProps) {
  const colors = useColors();
  const pulseScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);
  const innerScale = useSharedValue(1);

  useEffect(() => {
    if (isRecording && !isPaused) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800 }),
          withTiming(0, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(pulseScale);
      cancelAnimation(ringOpacity);
      pulseScale.value = withTiming(1, { duration: 300 });
      ringOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isRecording, isPaused]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    innerScale.value = withSequence(
      withTiming(0.88, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
    onPress();
  };

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
  }));

  const outerSize = size + 32;
  const ringSize = size + 52;

  return (
    <View style={{ width: ringSize, height: ringSize, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          ringStyle,
          {
            position: "absolute",
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: 2,
            borderColor: isRecording ? colors.recording : colors.primary,
          },
        ]}
      />
      <Animated.View
        style={[
          pulseStyle,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            borderWidth: 2.5,
            borderColor: isRecording ? colors.recording : colors.primary,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isRecording
              ? colors.recordingGlow
              : colors.primaryGlow,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.85}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        >
          <Animated.View
            style={[
              innerStyle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: isRecording ? colors.recording : colors.primary,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            {isRecording && !isPaused ? (
              <View
                style={{
                  width: size * 0.35,
                  height: size * 0.35,
                  borderRadius: 6,
                  backgroundColor: colors.destructiveForeground,
                }}
              />
            ) : isPaused ? (
              <View style={{ flexDirection: "row", gap: 6 }}>
                <View
                  style={{
                    width: size * 0.1,
                    height: size * 0.35,
                    borderRadius: 3,
                    backgroundColor: colors.destructiveForeground,
                  }}
                />
                <View
                  style={{
                    width: size * 0.1,
                    height: size * 0.35,
                    borderRadius: 3,
                    backgroundColor: colors.destructiveForeground,
                  }}
                />
              </View>
            ) : (
              <View
                style={{
                  width: size * 0.38,
                  height: size * 0.38,
                  borderRadius: size * 0.19,
                  backgroundColor: "#000",
                }}
              />
            )}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
