import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Flatlist } from 'react-native';

import NavigationBar from '../components/ui/NavigationBar';
import styles from '../Styles/styles';

import { getPendingArrivalAlerts, acceptArrivalAlert } from '@/services/arrivalAlertService';

export default function AdminNotifications() {
  const router = useRouter();

  const [arrivalRequestMenu, setArrivalRequestMenu] = useState(true);
  const [emergencyAlertMenu, setEmergencyAlertMenu] = useState(false);

  const [arrivalAlerts, setArrivalAlerts] = useState([]);

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
  }, []);

  const handleAccept = async (id) => {
    try {
      await acceptArrivalAlert(id);
      setArrivalAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.log("Error accepting alert:", err);
    }
  };

  return (
    <View style={styles.Background}>
      <Text style={[styles.HeaderText, { marginTop: 100 }]}>
        Notificaciones
      </Text>

      <View style={styles.Separator}></View>

      <ScrollView style={styles.scrollView}>
        {/* ARRIVAL REQUESTS SECTION */}
        <TouchableOpacity style={styles.menuButton} onPress={toggleArrivalRequest}>
          <Text style={styles.menuButtonText}>Llegadas</Text>
          <MaterialCommunityIcons
            name={arrivalRequestMenu ? "chevron-up" : "chevron-down"}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        {arrivalRequestMenu && (
          <View style={{ marginTop: 10 }}>
            {arrivalAlerts.length === 0 ? (
              <Text style={styles.noDataText}>No hay solicitudes pendientes</Text>
            ) : (
              arrivalAlerts.map((alert) => (
                <View key={alert.id} style={styles.alertItem}>
                  <Text style={styles.registerTitle}>{alert.name}</Text>
                  <Text style={styles.registerText}>
                    Llegó a las {alert.arrivalTime}
                  </Text>

                  <TouchableOpacity
                    style={styles.redButtonAlert}
                    onPress={() => handleAccept(alert.id)}
                  >
                    <Text style={styles.redButtonText}>Aceptar</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* EMERGENCY ALERTS SECTION */}
        <TouchableOpacity style={styles.menuButton} onPress={toggleEmergencyAlert}>
          <Text style={styles.menuButtonText}>Emergencias</Text>
          <MaterialCommunityIcons
            name={emergencyAlertMenu ? "chevron-up" : "chevron-down"}
            size={24}
            color="white"
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
