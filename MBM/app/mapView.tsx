import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import NavigationBar from '../components/ui/NavigationBar';
import { fetchMapPins } from '../Controlador/mapPinsController';
import { MapPin } from '../Modelo/MapPins';
import { debugLog } from '../services/debugLogger';

import { useEffect, useState } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false
  }),
});

export default function MapScreen() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Permission to access location was denied');
          return;
        }

        const { status: notificationStatus } = await Notifications.requestPermissionsAsync();

        if (notificationStatus !== 'granted'){
          Alert.alert('Permission Denied', 'Permision to send notifications was denied');
        }

        let location = await Location.getCurrentPositionAsync({});
        
        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

      } catch (error) {
        console.error("Error getting location:", error);
         setInitialRegion({
          latitude: 20.630117,
          longitude: -103.555317,
          latitudeDelta: 0.11,
          longitudeDelta: 0.11,
        });
      }
    })();
  }, []);

  useEffect(() => {
    const loadPins = async () => {
      try {
        debugLog.info('🗺️ Loading map pins...');
        const fetched = await fetchMapPins();
        setPins(fetched);
        debugLog.info(`✓ Map display: ${fetched.length} pins`);
      } catch (err) {
        debugLog.error('Error loading map pins:', err);
        setPins([]);
      }
    };
    loadPins();
  }, []);

  return (
    <View style={styles.container}>
      {initialRegion === null ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          showsUserLocation={true}
          showsMyLocationButton={true}
          initialRegion={initialRegion} 
        >
          {pins.map((pin, index) => (
            <Marker
              key={(pin as any).id ?? index}
              coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
              title={(pin as any).name ?? (pin as any).title}
            />
          ))}
        </MapView>
      )}
      <NavigationBar currentTab="mapView" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  buttonContainer: {
    paddingTop: 50,
    paddingHorizontal: 20,
    gap: 10,
    pointerEvents: 'auto',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});