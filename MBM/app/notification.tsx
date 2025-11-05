import React from "react";
import { SafeAreaView, View, Text, Button } from "react-native";
import NotificationsProvider from "../providers/NotificationsProvider";
import NotifyButton from "../components/NotifyButton";
import { Palette, Fonts } from "../constants/theme";
import { useRouter } from 'expo-router';

export default function App() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.ivory }}>
      <View
        style={{
          flex: 1,
          padding: 24,
          gap: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            textAlign: "center",
            color: Palette.raisin,
          }}
        >
          Home
        </Text>
        <Text
          style={{
            fontSize: 15,
            opacity: 0.8,
            textAlign: "center",
            color: Palette.hunter,
            maxWidth: 320,
          }}
        >
          Modular Notifications Demo
        </Text>
        <NotifyButton title="Server push (with fallback)" message="From modular App" />
        <Button title="Ir al map" onPress={() => router.replace("/mapView")}/>
      </View>
    </SafeAreaView>
  );
}