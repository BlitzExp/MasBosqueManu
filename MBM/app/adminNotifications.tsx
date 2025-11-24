import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import NavigationBar from '../components/ui/NavigationBar';
import styles from '../Styles/styles';

import { acceptArrivalAlert, getPendingArrivalAlerts } from '@/services/arrivalAlertService';

export default function AdminNotifications() {

  const params = useLocalSearchParams();
  const openParam = params?.open as string | undefined;

  const [arrivalRequestMenu, setArrivalRequestMenu] = useState(true);
  const [emergencyAlertMenu, setEmergencyAlertMenu] = useState(false);

  const [arrivalAlerts, setArrivalAlerts] = useState<any[]>([]);

  const toggleArrivalRequest = () => setArrivalRequestMenu(!arrivalRequestMenu);
  const toggleEmergencyAlert = () => setEmergencyAlertMenu(!emergencyAlertMenu);

  const loadArrivalAlerts = async () => {
    try {
      const alerts = await getPendingArrivalAlerts();
      setArrivalAlerts(alerts);
    } catch (err) {
      console.log("Error loading arrival alerts:", err);
    }
  };

  useEffect(() => {
    loadArrivalAlerts();
    // If route contains ?open=arrival or ?open=emergency, open that section
    if (openParam === 'arrival') {
      setArrivalRequestMenu(true);
      setEmergencyAlertMenu(false);
    } else if (openParam === 'emergency') {
      setEmergencyAlertMenu(true);
      setArrivalRequestMenu(false);
    }
  }, []);

  const testDataEmergencia = [
    { id: 1, nombre: 'Emergencia: Caída', message: 'Usuario ha reportado una caída.' },
    { id: 2, nombre: 'Emergencia: Dolor', message: 'Usuario reporta dolor en el pecho.' },
  ];

  const handleSubmitEmergencia = async (id: number) => {
    try {
      console.log('Accepted emergencia with id:', id);
    } catch (err) {
      console.log('Error accepting emergencia:', err);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await acceptArrivalAlert(id);
      setArrivalAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.log("Error accepting alert:", err);
    }
  };

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
                data={arrivalAlerts}
                style={styles.scrollViewStyle}
                contentContainerStyle={{ paddingBottom: 10 }}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item: alert }) => (
                  <View key={alert.id} style={styles.alertItem}>
                    <View style={styles.alertTextContainer}>
                      <Text style={styles.alertText}>{alert.name}</Text>
                      <Text style={styles.alertTextSecondary}> Ha llegado al bosque a las {alert.arrivalTime}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleAccept(alert.id)} style={styles.redButtonAlert}>
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
                    <TouchableOpacity onPress={() => handleSubmitEmergencia(alert.id)} style={styles.redButtonAlert}>
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
