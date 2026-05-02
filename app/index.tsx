import React, { useEffect, useRef } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useRecorder } from "@/context/RecorderContext";
import { RecordButton } from "@/components/RecordButton";
import { CountdownOverlay } from "@/components/CountdownOverlay";

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
      <Text style={[styles.statVal, { color: color ?? colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function QuickIconBtn({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity style={styles.quickBtn} onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.quickBtnIcon,
          { backgroundColor: active ? colors.primary + "22" : colors.secondary, borderColor: active ? colors.primary + "44" : colors.border },
        ]}
      >
        <Ionicons name={icon} size={22} color={active ? colors.primary : colors.mutedForeground} />
      </View>
      <Text style={[styles.quickBtnLabel, { color: active ? colors.primary : colors.mutedForeground }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function MainScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    settings,
    updateSetting,
    recordings,
    isRecording,
    isPaused,
    elapsed,
    countdownValue,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useRecorder();

  const recDotOpacity = useSharedValue(1);
  const recDotInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      recDotInterval.current = setInterval(() => {
        recDotOpacity.value = recDotOpacity.value === 1 ? 0 : 1;
      }, 600);
    } else {
      if (recDotInterval.current) clearInterval(recDotInterval.current);
      recDotOpacity.value = withTiming(1);
    }
    return () => { if (recDotInterval.current) clearInterval(recDotInterval.current); };
  }, [isRecording, isPaused]);

  const recDotStyle = useAnimatedStyle(() => ({
    opacity: recDotOpacity.value,
  }));

  const estimatedSize = isRecording
    ? formatBytes((settings.bitrate * 1024 * 1024 * elapsed) / 8)
    : "0 B";

  const handleMainButton = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePauseResume = () => {
    if (isPaused) resumeRecording();
    else pauseRecording();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {countdownValue !== null && <CountdownOverlay value={countdownValue} />}

      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 12 },
        ]}
      >
        <View style={styles.headerLeft}>
          {isRecording && (
            <Animated.View style={[styles.recDot, { backgroundColor: colors.recording }, recDotStyle]} />
          )}
          {isRecording && (
            <Text style={[styles.timer, { color: colors.foreground }]}>
              {formatElapsed(elapsed)}
            </Text>
          )}
          {!isRecording && (
            <Text style={[styles.brandName, { color: colors.primary }]}>CaptX</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/recordings")}
            activeOpacity={0.7}
          >
            <Ionicons name="folder-outline" size={20} color={colors.mutedForeground} />
            {recordings.length > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{recordings.length > 99 ? "99+" : recordings.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/settings")}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/tutorial")}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatPill label="RES" value={settings.resolution} color={colors.primary} />
        <StatPill label="FPS" value={`${settings.fps}`} color={colors.accent} />
        <StatPill label="MBPS" value={`${settings.bitrate}`} color={colors.success} />
        {isRecording && <StatPill label="SIZE" value={estimatedSize} color={colors.warning} />}
      </View>

      <View style={styles.center}>
        <View style={styles.glowRing}>
          <View
            style={[
              styles.glowRingInner,
              {
                borderColor: isRecording
                  ? colors.recording + "30"
                  : colors.primary + "20",
                backgroundColor: isRecording
                  ? colors.recording + "08"
                  : colors.primary + "06",
              },
            ]}
          />
        </View>
        <RecordButton
          isRecording={isRecording}
          isPaused={isPaused}
          onPress={handleMainButton}
          size={92}
        />
        <Text style={[styles.recordHint, { color: colors.mutedForeground }]}>
          {isRecording
            ? "Tap to stop"
            : countdownValue !== null
            ? "Starting..."
            : "Tap to record"}
        </Text>
      </View>

      <View style={styles.quickRow}>
        {isRecording && (
          <QuickIconBtn
            icon={isPaused ? "play" : "pause"}
            label={isPaused ? "Resume" : "Pause"}
            active={isPaused}
            onPress={handlePauseResume}
          />
        )}
        {!isRecording && (
          <>
            <QuickIconBtn
              icon={settings.audioSource !== "none" ? "mic" : "mic-off"}
              label="Audio"
              active={settings.audioSource !== "none"}
              onPress={() =>
                updateSetting(
                  "audioSource",
                  settings.audioSource !== "none" ? "none" : "microphone"
                )
              }
            />
            <QuickIconBtn
              icon="finger-print"
              label="Touches"
              active={settings.showTouches}
              onPress={() => updateSetting("showTouches", !settings.showTouches)}
            />
            <QuickIconBtn
              icon={settings.faceCamOverlay ? "videocam" : "videocam-outline"}
              label="FaceCam"
              active={settings.faceCamOverlay}
              onPress={() => updateSetting("faceCamOverlay", !settings.faceCamOverlay)}
            />
            <QuickIconBtn
              icon="speedometer-outline"
              label="Settings"
              onPress={() => router.push("/settings")}
            />
          </>
        )}
      </View>

      {Platform.OS === "web" && (
        <View
          style={[
            styles.webNote,
            { backgroundColor: colors.primary + "11", borderColor: colors.primary + "33" },
          ]}
        >
          <Ionicons name="information-circle" size={14} color={colors.primary} />
          <Text style={[styles.webNoteText, { color: colors.primary }]}>
            Web: Uses browser screen capture. On Android APK: full native recording.
          </Text>
        </View>
      )}

      <View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8, minWidth: 80 },
  headerRight: { flexDirection: "row", gap: 8 },
  brandName: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  timer: { fontSize: 22, fontFamily: "Inter_600SemiBold", fontVariant: ["tabular-nums"] },
  recDot: { width: 10, height: 10, borderRadius: 5 },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, color: "#000", fontFamily: "Inter_700Bold" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  statPill: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statVal: { fontSize: 13, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", marginTop: 1, letterSpacing: 0.8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  glowRing: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  glowRingInner: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
  },
  recordHint: {
    marginTop: 24,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  quickBtn: { alignItems: "center", gap: 6 },
  quickBtnIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  quickBtnLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  webNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  webNoteText: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
});
