import { getUserLogs } from "@/services/logService";
import { supabase } from "@/services/supabase";
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import NavigationBar from '@/components/ui/NavigationBar';
import { useStoredDataController } from '@/Controlador/storedDataController';
import styles from '@/Styles/styles';

import { userType as fetchUserType } from '@/Controlador/navBar';




export default function RecordsParamedic() {

  const testRecords = [
    { id: 1, name: 'Juan Perez', date: '12 Octubre', dateISO: '2025-10-12', summary: 'Atencion por fractura de brazo. Awdwadawdawfawfwfawfawfawf' },
    { id: 2, name: 'Maria Lopez', date: '10 Octubre', dateISO: '2025-10-10', summary: 'Atencion por quemadura leve. Awadawdawdawdawdawdawdawdawd' },
    { id: 3, name: 'Carlos Sanchez', date: '08 Octubre', dateISO: '2025-10-08', summary: 'Atencion por deshidratacion. Awadawdawdawdawdawdawdawdawd' },
    { id: 4, name: 'Ana Gomez', date: '05 Octubre', dateISO: '2025-10-05', summary: 'Atencion por picadura de insecto. Awadawdawdawdawdawdawdawdawd' },
  ];

  const [userType, setUserType] = useState<string>('user');
  const router = useRouter();
  const storedDataController = useStoredDataController();
  const [logs, setLogs] = useState<any[]>([]);

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [filtered, setFiltered] = useState<any[]>(testRecords);

  useEffect(() => {
    let mounted = true;
    const loadLogs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.replace('/logIn');
          return;
        }

        const userLogs = await getUserLogs(user.id);
        if (mounted) setLogs(userLogs || []);
      } catch (err) {
        console.log('Error loading logs:', err);
      }
    };
    loadLogs();

    fetchUserType()
      .then((t) => {
        if (mounted && t) setUserType(t);
      })
      .catch((err) => {
        console.error('NavigationBar: fetchUserType failed', err);
      });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // default filtered is logs if present, otherwise testRecords
    setFiltered(logs.length > 0 ? logs : testRecords);
  }, [logs]);

  const parseISO = (s: string): number | null => {
    if (!s) return null;
    const d = Date.parse(s);
    if (!isNaN(d)) return d;
    const alt = s.replace(/\//g, '-');
    const d2 = Date.parse(alt);
    return isNaN(d2) ? null : d2;
  };

  const handleFilter = () => {
    const from = parseISO(fromDate);
    const to = parseISO(toDate);
    const source = logs.length > 0 ? logs : testRecords;

    const res = source.filter((r) => {
      const rIso = r.dateISO || r.date || r.created_at || r.time;
      const rDate = rIso ? Date.parse(String(rIso)) : null;
      if (!rDate) return false;
      if (from && rDate < from) return false;
      if (to && rDate > to) return false;
      return true;
    });
    setFiltered(res);
  };

  const clearFilter = () => {
    setFromDate('');
    setToDate('');
    setFiltered(logs.length > 0 ? logs : testRecords);
  };

  return (
    <View style={styles.Background}>
      <View>
        <Text style={[styles.HeaderText, { marginTop: 100 }]}>Registros</Text>
      </View>
      <View style= {[styles.Separator]} />

      {userType === 'medico' ? (
        <>
          <View style={{ flexDirection: 'row', paddingHorizontal: 12, alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 4 }}>Desde</Text>
              <TextInput
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="YYYY-MM-DD"
                style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 6, backgroundColor: '#fff' }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 4 }}>Hasta</Text>
              <TextInput
                value={toDate}
                onChangeText={setToDate}
                placeholder="YYYY-MM-DD"
                style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 6, backgroundColor: '#fff' }}
              />
            </View>
            <TouchableOpacity onPress={handleFilter} style={{ backgroundColor: '#f57c00', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6 }}>
              <Text style={{ color: '#fff' }}>Filtrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearFilter} style={{ marginLeft: 6, padding: 8 }}>
              <Text>🔁</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollViewStyleRegisters} contentContainerStyle={{ paddingBottom: 10 }}>
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              {filtered.map((record: any) => (
                <View key={record.id || record.record_id || Math.random()} style={styles.alertItem}>
                  <View>
                    <Image
                      source={require('../assets/images/MissingImage.jpg')}
                      style={styles.imageContainer}
                      resizeMode="cover"
                    />
                  </View>
                  <View>
                    <Text style={styles.registerTitle}>{record.date ?? (record.dateISO ? new Date(record.dateISO).toLocaleDateString() : '')}</Text>
                    <Text style={styles.registerText}>{record.summary ?? record.description ?? ''} </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      ) : userType === 'admin' ? (
        <View style={{ alignItems: 'center', marginTop: 20 }} />
      ) : null}

      <NavigationBar currentTab='history'/>
    </View>
  );
}
