import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useRecorder, RecordingEntry } from "@/context/RecorderContext";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function RecordingCard({ item, onDelete }: { item: RecordingEntry; onDelete: () => void }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const handleDownload = () => {
    if (Platform.OS === "web" && item.uri) {
      const a = document.createElement("a");
      a.href = item.uri;
      a.download = item.title + ".webm";
      a.click();
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = () => {
    Alert.alert("Delete Recording", "Are you sure you want to delete this recording?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setExpanded(!expanded)}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.cardRow}>
        <View style={[styles.thumb, { backgroundColor: colors.secondary }]}>
          <Ionicons name="videocam" size={26} color={colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
            {formatDate(item.date)}
          </Text>
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{item.resolution}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.accent + "20" }]}>
              <Text style={[styles.tagText, { color: colors.accent }]}>{item.fps}fps</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                {formatDuration(item.duration)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.cardActions}>
          <Text style={[styles.sizeText, { color: colors.mutedForeground }]}>
            {formatBytes(item.sizeBytes)}
          </Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.mutedForeground}
          />
        </View>
      </View>

      {expanded && (
        <View style={[styles.expandedRow, { borderTopColor: colors.border }]}>
          {Platform.OS === "web" && item.uri && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary + "20" }]}
              onPress={handleDownload}
              activeOpacity={0.7}
            >
              <Ionicons name="download-outline" size={16} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Download</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.destructive + "18" }]}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color={colors.destructive} />
            <Text style={[styles.actionBtnText, { color: colors.destructive }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function RecordingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recordings, deleteRecording } = useRecorder();

  const totalSize = recordings.reduce((acc, r) => acc + r.sizeBytes, 0);

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Recordings</Text>
        <View style={{ width: 36 }} />
      </View>

      {recordings.length > 0 && (
        <View style={[styles.storageBar, { backgroundColor: colors.secondary, borderBottomColor: colors.border }]}>
          <Ionicons name="server-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.storageText, { color: colors.mutedForeground }]}>
            {recordings.length} recording{recordings.length !== 1 ? "s" : ""} · {formatBytes(totalSize)} total
          </Text>
        </View>
      )}

      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={recordings.length > 0}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="videocam-off-outline" size={40} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No recordings yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Your recordings will appear here after you capture them
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={[styles.emptyBtnText, { color: colors.primaryForeground }]}>
                Start Recording
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <RecordingCard item={item} onDelete={() => deleteRecording(item.id)} />
        )}
      />
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
  storageBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  storageText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  list: { padding: 16, gap: 12 },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  cardRow: { flexDirection: "row", gap: 12, padding: 14, alignItems: "flex-start" },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  tagsRow: { flexDirection: "row", gap: 6, marginTop: 4, flexWrap: "wrap" },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  tagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardActions: { alignItems: "flex-end", gap: 8 },
  sizeText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  expandedRow: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
  emptyBtn: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 100,
  },
  emptyBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
