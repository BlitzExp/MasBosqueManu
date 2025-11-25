import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import NavigationBar from '../components/ui/NavigationBar';
import styles from '../Styles/styles';

import { acceptArrivalAlert, getPendingArrivalAlerts } from '@/Controlador/arrivalAlert';
import { acceptEmergencyAlert, getPendingEmergencies, obtainEmergencyAlertName, getTimeSinceAlert } from '@/Controlador/emergencyAlert';

export default function AdminNotifications() {

  const params = useLocalSearchParams();
  const openParam = params?.open as string | undefined;

  const [arrivalRequestMenu, setArrivalRequestMenu] = useState(true);
  const [emergencyAlertMenu, setEmergencyAlertMenu] = useState(false);

  const [arrivalAlerts, setArrivalAlerts] = useState<any[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);

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

  const loadEmergencyAlerts = async () => {
    try {
      const alerts = await getPendingEmergencies();
      const alertsWithNames = await Promise.all(
        alerts.map(async (a: any) => {
          const displayName = await obtainEmergencyAlertName(a);
          return { ...a, displayName };
        })
      );
      setEmergencyAlerts(alertsWithNames);
    } catch (err) {
      console.log("Error loading emergency alerts:", err);
    }
  };

  useEffect(() => {
    loadArrivalAlerts();
    loadEmergencyAlerts();
    if (openParam === 'arrival') {
      setArrivalRequestMenu(true);
    }
  }, [openParam]);

  const handleAcceptAlert = async (id: number) => {
    try {
      await acceptArrivalAlert(id);
      setArrivalAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.log("Error accepting alert:", err);
    }
  };

  const handleAcceptEmergency = async (id: number) => {
    try {
      await acceptEmergencyAlert(id);
      setEmergencyAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.log("Error accepting emergency alert:", err);
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
                      <Text style={styles.alertTextSecondary}> Llego a las {alert.arrivalTime}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleAcceptAlert(alert.id)} style={styles.redButtonAlert}>
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
                data={emergencyAlerts}
                style={styles.scrollViewStyle}
                contentContainerStyle={{ paddingBottom: 10 }}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item: alert }) => (
                  <View key={alert.id} style={styles.alertItem}>
                    <View style={styles.alertTextContainer}>
                      <Text style={styles.alertText}>Emergencia en {alert.displayName}</Text>
                      <Text style={styles.alertTextSecondary}>{getTimeSinceAlert( alert.date, alert.timeAlert )} atrás</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleAcceptEmergency(alert.id)} style={styles.redButtonAlert}>
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
