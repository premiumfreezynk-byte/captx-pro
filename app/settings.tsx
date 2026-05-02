import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useRecorder, Resolution, FPS, BitrateMbps, AudioSource, VideoFormat, Orientation, CountdownSec, TimerLimit } from "@/context/RecorderContext";
import { SettingRow, SettingSection } from "@/components/SettingRow";
import { PickerModal } from "@/components/PickerModal";

type PickerKey =
  | "resolution"
  | "fps"
  | "bitrate"
  | "audioSource"
  | "videoFormat"
  | "orientation"
  | "countdown"
  | "timerLimit"
  | null;

const OPTIONS: Record<string, Array<{ label: string; value: string; description?: string }>> = {
  resolution: [
    { label: "480p", value: "480p", description: "854×480 — Smallest file size" },
    { label: "720p HD", value: "720p", description: "1280×720 — Good balance" },
    { label: "1080p Full HD", value: "1080p", description: "1920×1080 — Recommended" },
    { label: "2K QHD", value: "2K", description: "2560×1440 — Very sharp" },
    { label: "4K Ultra HD", value: "4K", description: "3840×2160 — Maximum quality" },
  ],
  fps: [
    { label: "24 FPS", value: "24", description: "Cinematic look" },
    { label: "30 FPS", value: "30", description: "Standard, smaller file" },
    { label: "60 FPS", value: "60", description: "Smooth motion — recommended" },
    { label: "120 FPS", value: "120", description: "Ultra smooth — large files" },
  ],
  bitrate: [
    { label: "2 Mbps", value: "2", description: "Low quality, tiny file" },
    { label: "4 Mbps", value: "4", description: "Standard quality" },
    { label: "8 Mbps", value: "8", description: "High quality — recommended" },
    { label: "16 Mbps", value: "16", description: "Very high quality" },
    { label: "32 Mbps", value: "32", description: "Maximum quality, large files" },
  ],
  audioSource: [
    { label: "None", value: "none", description: "No audio" },
    { label: "Microphone", value: "microphone", description: "External mic audio" },
    { label: "System Audio", value: "system", description: "Internal system sounds" },
    { label: "Both", value: "both", description: "Mic + System audio" },
  ],
  videoFormat: [
    { label: "MP4", value: "mp4", description: "Best compatibility" },
    { label: "WebM", value: "webm", description: "Web optimized" },
    { label: "MKV", value: "mkv", description: "Lossless container" },
  ],
  orientation: [
    { label: "Auto", value: "auto", description: "Follow device rotation" },
    { label: "Portrait", value: "portrait", description: "Lock to portrait" },
    { label: "Landscape", value: "landscape", description: "Lock to landscape" },
  ],
  countdown: [
    { label: "No countdown", value: "0" },
    { label: "3 seconds", value: "3" },
    { label: "5 seconds", value: "5" },
    { label: "10 seconds", value: "10" },
  ],
  timerLimit: [
    { label: "No limit", value: "none" },
    { label: "1 minute", value: "1min" },
    { label: "5 minutes", value: "5min" },
    { label: "10 minutes", value: "10min" },
    { label: "30 minutes", value: "30min" },
  ],
};

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSetting } = useRecorder();
  const [activePicker, setActivePicker] = useState<PickerKey>(null);

  const openPicker = (key: PickerKey) => setActivePicker(key);
  const closePicker = () => setActivePicker(null);

  const handleSelect = (key: PickerKey, value: string) => {
    if (!key) return;
    if (key === "fps") updateSetting("fps", parseInt(value) as FPS);
    else if (key === "bitrate") updateSetting("bitrate", parseInt(value) as BitrateMbps);
    else if (key === "countdown") updateSetting("countdown", parseInt(value) as CountdownSec);
    else if (key === "resolution") updateSetting("resolution", value as Resolution);
    else if (key === "audioSource") updateSetting("audioSource", value as AudioSource);
    else if (key === "videoFormat") updateSetting("videoFormat", value as VideoFormat);
    else if (key === "orientation") updateSetting("orientation", value as Orientation);
    else if (key === "timerLimit") updateSetting("timerLimit", value as TimerLimit);
  };

  const fpsDisplayMap: Record<string, string> = { "24": "24 FPS", "30": "30 FPS", "60": "60 FPS", "120": "120 FPS" };
  const countdownMap: Record<string, string> = { "0": "Off", "3": "3s", "5": "5s", "10": "10s" };
  const timerMap: Record<string, string> = { none: "Off", "1min": "1m", "5min": "5m", "10min": "10m", "30min": "30m" };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 12, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Advanced Settings</Text>
        <TouchableOpacity onPress={() => router.push("/tutorial")} activeOpacity={0.7}>
          <Ionicons name="help-circle-outline" size={22} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SettingSection title="Video Quality">
          <SettingRow
            icon="tv-outline"
            label="Resolution"
            value={settings.resolution}
            accent
            onPress={() => openPicker("resolution")}
          />
          <SettingRow
            icon="speedometer-outline"
            label="Frame Rate"
            value={fpsDisplayMap[String(settings.fps)]}
            accent
            onPress={() => openPicker("fps")}
          />
          <SettingRow
            icon="wifi-outline"
            label="Bitrate"
            value={`${settings.bitrate} Mbps`}
            accent
            onPress={() => openPicker("bitrate")}
          />
          <SettingRow
            icon="document-outline"
            label="Video Format"
            value={settings.videoFormat.toUpperCase()}
            onPress={() => openPicker("videoFormat")}
          />
        </SettingSection>

        <SettingSection title="Audio">
          <SettingRow
            icon="mic-outline"
            label="Audio Source"
            value={settings.audioSource.charAt(0).toUpperCase() + settings.audioSource.slice(1)}
            accent
            onPress={() => openPicker("audioSource")}
          />
        </SettingSection>

        <SettingSection title="Recording Controls">
          <SettingRow
            icon="timer-outline"
            label="Countdown Timer"
            value={countdownMap[String(settings.countdown)]}
            onPress={() => openPicker("countdown")}
          />
          <SettingRow
            icon="alarm-outline"
            label="Recording Limit"
            value={timerMap[settings.timerLimit]}
            onPress={() => openPicker("timerLimit")}
          />
          <SettingRow
            icon="phone-portrait-outline"
            label="Orientation Lock"
            value={settings.orientation.charAt(0).toUpperCase() + settings.orientation.slice(1)}
            onPress={() => openPicker("orientation")}
          />
        </SettingSection>

        <SettingSection title="Overlays">
          <SettingRow
            icon="finger-print"
            label="Show Touches"
            description="Highlight touch points on screen"
            isToggle
            toggleValue={settings.showTouches}
            onToggle={(v) => updateSetting("showTouches", v)}
          />
          <SettingRow
            icon="ellipse-outline"
            label="Show Tap Rings"
            description="Visual ring effect on taps"
            isToggle
            toggleValue={settings.showTaps}
            onToggle={(v) => updateSetting("showTaps", v)}
          />
          <SettingRow
            icon="videocam-outline"
            label="Face Cam Overlay"
            description="Picture-in-picture face camera"
            isToggle
            toggleValue={settings.faceCamOverlay}
            onToggle={(v) => updateSetting("faceCamOverlay", v)}
          />
        </SettingSection>

        <SettingSection title="Performance">
          <SettingRow
            icon="flash-outline"
            label="GPU Acceleration"
            description="Faster encoding with hardware"
            isToggle
            accent
            toggleValue={settings.gpuAcceleration}
            onToggle={(v) => updateSetting("gpuAcceleration", v)}
          />
          <SettingRow
            icon="contrast-outline"
            label="HDR Mode"
            description="High dynamic range capture"
            isToggle
            toggleValue={settings.hdrMode}
            onToggle={(v) => updateSetting("hdrMode", v)}
          />
        </SettingSection>

        <View style={[styles.infoCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <Ionicons name="information-circle" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            All settings are saved automatically. Higher resolution and FPS = larger file size.
          </Text>
        </View>
      </ScrollView>

      {activePicker && OPTIONS[activePicker] && (
        <PickerModal
          visible={!!activePicker}
          title={OPTIONS[activePicker]?.[0]?.label ? activePicker.charAt(0).toUpperCase() + activePicker.slice(1) : ""}
          options={OPTIONS[activePicker] ?? []}
          selected={
            activePicker === "fps" || activePicker === "bitrate" || activePicker === "countdown"
              ? String(settings[activePicker])
              : String(settings[activePicker])
          }
          onSelect={(val) => handleSelect(activePicker, val)}
          onClose={closePicker}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16 },
  infoCard: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
