import { getUserLogs } from '@/services/logService';
import { supabase } from '@/services/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

import NavigationBar from '@/components/ui/NavigationBar';
import { useStoredDataController } from '@/Controlador/storedDataController';
import styles from '@/Styles/styles';

import { userType as fetchUserType } from '@/Controlador/navBar';




export default function RecordsParamedic() {
  const router = useRouter();
  const storedDataController = useStoredDataController();
  const [logs, setLogs] = useState<any[]>([]);
  const [userType, setUserType] = useState<string>('user');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/logIn');
          return;
        }
        const userLogs = await getUserLogs(user.id);
        if (mounted) setLogs(userLogs || []);
      } catch (err) {
        console.error('Error loading logs:', err);
      }
    };

    load();

    fetchUserType()
      .then((t) => {
        if (mounted && t) setUserType(t);
      })
      .catch((err) => console.error('fetchUserType failed', err));

    return () => { mounted = false; };
  }, []);

  return (
    <View style={styles.Background}>
      <View>
        <Text style={[styles.HeaderText, { marginTop: 100 }]}>Registros</Text>
      </View>

      <View style={[styles.Separator]} />

      <ScrollView style={styles.scrollViewStyleRegisters} contentContainerStyle={{ paddingBottom: 10 }}>
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          {logs.map((log) => (
            <View key={log.id ?? log.record_id} style={styles.alertItem}>
              <View>
                <Image
                  source={require('../assets/images/MissingImage.jpg')}
                  style={styles.imageContainer}
                  resizeMode="cover"
                />
              </View>

              <View>
                <Text style={styles.registerTitle}>{log.logDate ?? log.date ?? ''}</Text>
                <Text style={styles.registerText}>{log.description ?? log.summary ?? ''}</Text>
                <Text style={styles.registerText}>{(log.ingressTime ?? '') + (log.exitTime ? ` - ${log.exitTime}` : '')}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <NavigationBar currentTab='history' />
    </View>
  );
}
