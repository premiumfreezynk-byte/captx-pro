import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  onPress?: () => void;
  accent?: boolean;
  description?: string;
}

export function SettingRow({
  icon,
  label,
  value,
  isToggle,
  toggleValue,
  onToggle,
  onPress,
  accent,
  description,
}: SettingRowProps) {
  const colors = useColors();

  const content = (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: accent ? colors.primary + "22" : colors.secondary },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={accent ? colors.primary : colors.mutedForeground}
        />
      </View>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        {description ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>{description}</Text>
        ) : null}
      </View>
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary + "66" }}
          thumbColor={toggleValue ? colors.primary : colors.mutedForeground}
          ios_backgroundColor={colors.border}
        />
      ) : (
        <View style={styles.right}>
          {value ? (
            <Text style={[styles.value, { color: colors.primary }]}>{value}</Text>
          ) : null}
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </View>
      )}
    </View>
  );

  if (isToggle) return content;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingSection({ title, children }: SettingSectionProps) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  desc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  value: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
