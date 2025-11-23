import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import NavigationBar from '../components/ui/NavigationBar';

import styles from '../Styles/styles';

export default function AdminNotifications() {
  const router = useRouter();

  const [arrivalRequestMenu, setArrivalRequestMenu] =  React.useState(false);
  const [emergencyAlertMenu, setEmergencyAlertMenu] =  React.useState(true);

  const toggleArrivalRequest = () => {
    setArrivalRequestMenu(!arrivalRequestMenu);
  } 

  const toggleEmergencyAlert = () => {
    setEmergencyAlertMenu(!emergencyAlertMenu);
  }

  const testDataLlegada = [
    { id: 1, nombre: 'Nombre 1', message: 'Llego hace 5 minutos' },
    { id: 2, nombre: 'Nombre 2', message: 'Llego hace 10 minutos' },
    { id: 3, nombre: 'Nombre 3', message: 'Llego hace 15 minutos' },
    { id: 4, nombre: 'Nombre 4', message: 'Llego hace 20 minutos' },
    { id: 5, nombre: 'Nombre 5', message: 'Llego hace 25 minutos' },
    { id: 6, nombre: 'Nombre 6', message: 'Llego hace 30 minutos' },
    { id: 7, nombre: 'Nombre 7', message: 'Llego hace 35 minutos' },
    { id: 8, nombre: 'Nombre 8', message: 'Llego hace 40 minutos' },
    { id: 9, nombre: 'Nombre 9', message: 'Llego hace 45 minutos' },
    { id: 10, nombre: 'Nombre 10', message: 'Llego hace 50 minutos' },
  ];

  const testDataEmergencia = [
    { id: 1, nombre: 'Emergencia en Area 2', message: 'Hace 2 minutos' },
    { id: 2, nombre: 'Emergencia en Area 3', message: 'Hace 7 minutos' },
    { id: 3, nombre: 'Emergencia en Area 4', message: 'Hace 12 minutos' },
    { id: 4, nombre: 'Emergencia en Area 5', message: 'Hace 17 minutos' },
  ];

  const handleSubmitLlegada = () => {
    console.log('Enterado Llegada');
  }

  const handleSubmitEmergencia = () => {
    console.log('Enterado Emergencia');
  }

  return (
    <View style={styles.Background}>
      <View>
        <TouchableOpacity onPress={toggleArrivalRequest} style={styles.dropMenuContainer}>
          <Text style={[styles.HeaderText, { marginTop: 0 }]}>Llegada</Text>
          <MaterialCommunityIcons
            name= {arrivalRequestMenu ? "menu-down" : "menu-right"}
            size={40}
            color="black"
            style={styles.dropDownSimbol}
          />
        </TouchableOpacity>
        <View style= {[styles.Separator]}></View>
        <View>
          {arrivalRequestMenu && (
            <>
              <FlatList
                data={testDataLlegada}
                style={styles.scrollViewStyle}
                contentContainerStyle={{ paddingBottom: 10 }}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item: alert }) => (
                  <View key={alert.id} style={styles.alertItem}>
                    <View style={styles.alertTextContainer}>
                      <Text style={styles.alertText}>{alert.nombre}</Text>
                      <Text style={styles.alertTextSecondary}>{alert.message}</Text>
                    </View>
                    <TouchableOpacity onPress={handleSubmitLlegada} style={styles.redButtonAlert}>
                      <Text style={styles.redButtonText}>Enterado</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          )}
        </View>
      </View>
      <View>
        <TouchableOpacity onPress={toggleEmergencyAlert} style={[styles.dropMenuContainer, { marginTop: 20 }]}>
          <Text style={[styles.HeaderText, { marginTop: 0 }]}>Ayuda</Text>
          <MaterialCommunityIcons
            name= {emergencyAlertMenu ? "menu-down" : "menu-right"}
            size={40}
            color="black"
            style={styles.dropDownSimbol}
          />
        </TouchableOpacity>
        <View style= {[styles.Separator]}></View>
        <View>
          {emergencyAlertMenu && (
            <>
              <FlatList
                data={testDataEmergencia}
                style={styles.scrollViewStyle}
                contentContainerStyle={{ paddingBottom: 10 }}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item: alert }) => (
                  <View key={alert.id} style={styles.alertItem}>
                    <View style={styles.alertTextContainer}>
                      <Text style={styles.alertText}>{alert.nombre}</Text>
                      <Text style={styles.alertTextSecondary}>{alert.message}</Text>
                    </View>
                    <TouchableOpacity onPress={handleSubmitEmergencia} style={styles.redButtonAlert}>
                      <Text style={styles.redButtonText}>Aceptar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          )}
        </View>
      </View>
      <NavigationBar currentTab='alert'/>
    </View>
  );
}