import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import NotificationsProvider from '@/providers/NotificationsProvider';

import { initializeConnectionManager } from '@/services/connectionManager';
import { syncManager } from '@/services/syncManager';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    console.log('📱 Inicializando sistema de resiliencia...');
    initializeConnectionManager();
    syncManager.start();
    
    return () => {
      console.log('🛑 Deteniendo sistema de resiliencia...');
      syncManager.stop();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NotificationsProvider>
        <Stack>
          <Stack.Screen name="logIn" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, navigationBarHidden: true }} />
          <Stack.Screen name="mapView" options={{ headerShown: false }} />
          <Stack.Screen name="adminNotifications" options={{ headerShown: false }} />
          <Stack.Screen name="recordsAdmin" options={{ headerShown: false }} />
          <Stack.Screen name="editProfile" options={{ headerShown: false }} />
          <Stack.Screen name="dailyJournal" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="recordsParamedic" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />  
      </NotificationsProvider>
    </ThemeProvider>
  );
}
