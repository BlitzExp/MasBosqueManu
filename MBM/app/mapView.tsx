import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import NavigationBar from '../components/ui/NavigationBar';

import {useStoredDataController} from '../Controlador/storedDataController';
import { fetchMapPins } from '../Controlador/mapPinsController';
import { MapPin } from '../Modelo/MapPins';

import { useState } from 'react';
import { useEffect } from 'react';

export default function MapScreen() {
  const router = useRouter();
  const [userType, setUserType] = useState('user');
  const [pins, setPins] = useState<MapPin[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const storedDataController = useStoredDataController();
      const data = await storedDataController.getStoredData('userType');
      if (data) {
        setUserType(data);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const loadPins = async () => {
      try {
        const fetched = await fetchMapPins();
        setPins(fetched);
      } catch (err) {
        console.error('Error loading map pins:', err);
        setPins([]);
      }
    };

    loadPins();
  }, []);



  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 20.630117,
          longitude: -103.555317,
          latitudeDelta: 0.11,
          longitudeDelta: 0.11,
        }}
      >
        {pins.map((pin, index) => (
          <Marker
            key={(pin as any).id ?? index}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            title={(pin as any).name ?? (pin as any).title}
          />
        ))}
      </MapView>
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
});