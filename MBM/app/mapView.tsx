import React from 'react';
import { StyleSheet, View} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import NavigationBar from '../components/ui/NavigationBar';

const pins = [
  {
    latitude: 20.595209,
    longitude: -103.547140,
    title: 'Torre 1'
  },
  {
    latitude: 20.604368,
    longitude: -103.603445,
    title: 'Torre 3'
  },
  {
    latitude: 20.623970,
    longitude: -103.562075,
    title: 'Arbol Manu / Fin de Toboganes'
  },
  {
    latitude: 20.615114,
    longitude: -103.534941,
    title: 'Check Point'
  },
  {
    latitude: 20.622600,
    longitude:  -103.535956,
    title: 'El Arbol / Final Garrison'
  },
  {
    latitude: 20.614480,
    longitude: -103.519726,
    title: 'El Tecuan'
  },
  {
    latitude: 20.617585,
    longitude: -103.509111,
    title: 'El Ocho y Medio'
  },
  {
    latitude: 20.674321,
    longitude: -103.514444,
    title: 'Torre 2'
  }
];

export default function MapScreen() {
  const router = useRouter();
  
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
            key={index}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            title={pin.title}
          />
        ))}
      </MapView>
      <View style={styles.overlayContainer}>
        <View style={{ pointerEvents: 'auto' }}>
          <NavigationBar userType='user' currentTab="mapView" />
        </View>
      </View>
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