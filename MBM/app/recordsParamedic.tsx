import { useRouter } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { getUserLogs } from "@/services/logService";
import { supabase } from "@/services/supabase";

import NavigationBar from '@/components/ui/NavigationBar';
import { useStoredDataController } from '@/Controlador/storedDataController';
import styles from '@/Styles/styles';

export default function RecordsParamedic() {
  const router = useRouter();
  const storedDataController = useStoredDataController();
  const [logs, setLogs] = useState([]);
  const [userType, setUserType] = useState('user');

  useEffect(() => {
    const loadLogs = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/logIn");
        return;
      }

      try {
        const userLogs = await getUserLogs(user.id);
        setLogs(userLogs);
      } catch (err) {
        console.log("Error loading logs:", err);
      }
    };

    loadLogs();
  }, []);

  return (
    <View style={styles.Background}>
      <View>
        <Text style={[styles.HeaderText, { marginTop: 100 }]}>Registros</Text>
      </View>

      <View style={[styles.Separator]} />

      {(
        <ScrollView
          style={styles.scrollViewStyleRegisters}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            {logs.map(log => (
              <View key={log.id} style={styles.alertItem}>
                <View>
                  <Image
                    source={require('../assets/images/MissingImage.jpg')}
                    style={styles.imageContainer}
                    resizeMode="cover"
                  />
                </View>

                <View>
                  <Text style={styles.registerTitle}>{log.logDate}</Text>
                  <Text style={styles.registerText}>{log.description}</Text>
                  <Text style={styles.registerText}>
                    {log.ingressTime} - {log.exitTime}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <NavigationBar userType={userType} currentTab='history' />
    </View>
  );
}
