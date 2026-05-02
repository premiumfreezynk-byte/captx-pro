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

interface TutorialCard {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  desc: string;
  tips: string[];
  color: string;
}

const CARDS: TutorialCard[] = [
  {
    icon: "tv-outline",
    title: "Resolution",
    subtitle: "480p · 720p · 1080p · 2K · 4K",
    desc: "Controls the sharpness of your recording. Higher resolution = clearer image but larger file size.",
    tips: [
      "Use 1080p for most screen recordings — best balance",
      "Use 4K only if your display is 4K and you have lots of storage",
      "480p is great for tutorial videos where file size matters",
    ],
    color: "#00D4FF",
  },
  {
    icon: "speedometer-outline",
    title: "Frame Rate (FPS)",
    subtitle: "24 · 30 · 60 · 120 FPS",
    desc: "How many frames are captured per second. Higher FPS = smoother motion but bigger files.",
    tips: [
      "60 FPS is perfect for app demos and gameplay",
      "30 FPS is standard for most tutorial content",
      "24 FPS gives a cinematic film-like look",
      "120 FPS is for ultra-smooth slow-motion playback",
    ],
    color: "#7B61FF",
  },
  {
    icon: "wifi-outline",
    title: "Bitrate",
    subtitle: "2 · 4 · 8 · 16 · 32 Mbps",
    desc: "Controls video quality and compression. Higher bitrate = better quality but much larger file.",
    tips: [
      "8 Mbps is the sweet spot for 1080p recordings",
      "16+ Mbps only needed for 4K content",
      "Lower bitrate if storage or upload speed is limited",
    ],
    color: "#30D158",
  },
  {
    icon: "mic-outline",
    title: "Audio Source",
    subtitle: "None · Mic · System · Both",
    desc: "Choose where your audio comes from during recording.",
    tips: [
      "Microphone: for narrated tutorials or commentary",
      "System: capture app sounds, music, notifications",
      "Both: narrate AND capture system sounds simultaneously",
      "None: silent recordings for clean demos",
    ],
    color: "#FF9500",
  },
  {
    icon: "timer-outline",
    title: "Countdown Timer",
    subtitle: "0 · 3 · 5 · 10 seconds",
    desc: "Delays the start of recording so you can get in position before it begins.",
    tips: [
      "3 seconds is enough to switch to your target app",
      "10 seconds gives you time to set up physically",
      "Set to 0 for instant recordings",
    ],
    color: "#FF375F",
  },
  {
    icon: "alarm-outline",
    title: "Recording Limit",
    subtitle: "1m · 5m · 10m · 30m · None",
    desc: "Automatically stops recording after the set time. Useful to prevent massive files.",
    tips: [
      "Set a 5 minute limit for short demos",
      "30 minutes max for long tutorials",
      "Leave at None for manual control",
    ],
    color: "#FFD60A",
  },
  {
    icon: "flash-outline",
    title: "GPU Acceleration",
    subtitle: "Hardware encoding",
    desc: "Uses your device's GPU to encode video faster with less battery drain.",
    tips: [
      "Keep this ON — it's almost always faster",
      "Turn OFF only if you experience encoding glitches",
      "Saves significant battery during long recordings",
    ],
    color: "#00D4FF",
  },
  {
    icon: "contrast-outline",
    title: "HDR Mode",
    subtitle: "High Dynamic Range",
    desc: "Captures a wider range of colors and brightness levels for more vivid recordings.",
    tips: [
      "Only useful on HDR displays",
      "HDR files are larger and need compatible players",
      "Great for recording games or HDR content",
    ],
    color: "#FF6B35",
  },
  {
    icon: "finger-print",
    title: "Show Touches",
    subtitle: "Touch point visualization",
    desc: "Shows visual indicators where you tap on screen — great for creating tutorials.",
    tips: [
      "Enable for app demo recordings",
      "Viewers can follow your interactions easily",
      "Appears as circular highlights on touch points",
    ],
    color: "#5E5CE6",
  },
  {
    icon: "videocam-outline",
    title: "Face Cam Overlay",
    subtitle: "Picture-in-picture camera",
    desc: "Shows your face camera in a small overlay corner while recording the screen.",
    tips: [
      "Great for reaction videos or personal tutorials",
      "Appears in the bottom corner by default",
      "Adds personality to your recordings",
    ],
    color: "#30D158",
  },
  {
    icon: "phone-portrait-outline",
    title: "Orientation Lock",
    subtitle: "Auto · Portrait · Landscape",
    desc: "Locks the recording orientation so it doesn't rotate unexpectedly mid-recording.",
    tips: [
      "Auto follows your device's physical rotation",
      "Lock to Landscape for games and widescreen apps",
      "Lock to Portrait for social media and mobile apps",
    ],
    color: "#7B61FF",
  },
];

function TutorialCardView({ card, isLast }: { card: TutorialCard; isLast: boolean }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setExpanded(!expanded)}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        !isLast && { marginBottom: 10 },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: card.color + "20" }]}>
          <Ionicons name={card.icon} size={22} color={card.color} />
        </View>
        <View style={styles.cardLeft}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{card.title}</Text>
          <Text style={[styles.cardSub, { color: card.color }]}>{card.subtitle}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.mutedForeground}
        />
      </View>

      {expanded && (
        <View style={[styles.cardBody, { borderTopColor: colors.border }]}>
          <Text style={[styles.cardDesc, { color: colors.foreground }]}>{card.desc}</Text>
          <View style={styles.tipsList}>
            {card.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: card.color }]} />
                <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TutorialScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Guide</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroBanner, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
          <Ionicons name="school-outline" size={28} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>CaptX Pro Guide</Text>
            <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>
              Tap any setting to learn what it does and get pro tips
            </Text>
          </View>
        </View>

        {CARDS.map((card, i) => (
          <TutorialCardView key={card.title} card={card} isLast={i === CARDS.length - 1} />
        ))}

        <View style={[styles.footer, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Text style={[styles.footerTitle, { color: colors.foreground }]}>Quick Start</Text>
          <View style={styles.steps}>
            {[
              { num: "1", text: "Tap the big cyan button to start recording" },
              { num: "2", text: "Use the quick icons for audio, touches, and face cam" },
              { num: "3", text: "Tap again to stop — recording saves automatically" },
              { num: "4", text: "Find all recordings in the Recordings tab" },
            ].map((step) => (
              <View key={step.num} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.stepNumText, { color: colors.primaryForeground }]}>{step.num}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.foreground }]}>{step.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  content: { padding: 16, gap: 0 },
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  heroTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  heroDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardSub: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
  cardBody: {
    padding: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  cardDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  tipsList: { gap: 8 },
  tipRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  footer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 6,
  },
  footerTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 14 },
  steps: { gap: 12 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  stepText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
});
