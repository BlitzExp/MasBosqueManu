// src/components/NotifyButton.tsx
import React from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { useNotifications } from "../hooks/useNotifications";
import { Palette } from "../constants/theme";
import BrandButton from "./ui/BrandButton";

type Props = {
  title?: string;
  message?: string;
};

export default function NotifyButton({ title, message }: Props) {
  const { ready, token, simulator, sendTest } = useNotifications();

    try {
      const r = await sendTest(title ?? "Hello", message ?? "Triggered from button");
      if (r.fallback) {
        Alert.alert("Simulator fallback", "Local notification in ~3s.");
      } else {
        Alert.alert("Push sent", "Check your device’s tray.");
      }
    } catch (e: any) {
      Alert.alert("Notification error", String(e?.message ?? e));
    }
  };

  return (
    <View style={styles.container}>
      <BrandButton
        label="Send test notification"
        onPress={onPress}
        disabled={!ready}
        variant="primary"
      />
      <Text style={styles.meta}>
        Status: {ready ? "ready" : "not ready"} • {simulator ? "Simulator" : "Device"}
      </Text>
      {!!token && (
        <View style={styles.tokenBox}>
          <Text numberOfLines={2} selectable style={styles.tokenText}>
            {token}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, alignItems: "center" },
  // Button styles moved to BrandButton
  meta: { fontSize: 12, opacity: 0.75 },
  tokenBox: {
    backgroundColor: "#ffffff60",
    borderColor: Palette.hunter,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 8,
    maxWidth: 320,
  },
  tokenText: {
    fontSize: 12,
    color: Palette.raisin,
  },
});
