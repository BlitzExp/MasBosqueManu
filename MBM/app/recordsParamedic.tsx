import { useRouter } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';

import { useEffect, useState } from 'react';

import NavigationBar from '@/components/ui/NavigationBar';
import { useStoredDataController } from '@/Controlador/storedDataController';
import styles from '@/Styles/styles';




export default function RecordsParamedic() {
  const router = useRouter();

  const testRecords = [
    { id: 1, name: 'Juan Perez', date: '12 Octubre', summary: 'Atencion por fractura de brazo. Awdwadawdawfawfwfawfawfawf' },
    { id: 2, name: 'Maria Lopez', date: '10 Octubre', summary: 'Atencion por quemadura leve. Awadawdawdawdawdawdawdawdawd' },
    { id: 3, name: 'Carlos Sanchez', date: '08 Octubre', summary: 'Atencion por deshidratacion. Awadawdawdawdawdawdawdawdawd' },
    { id: 4, name: 'Ana Gomez', date: '05 Octubre', summary: 'Atencion por picadura de insecto. Awadawdawdawdawdawdawdawdawd' },
  ];

  const [userType, setUserType] = useState('user');
  // call controller at top level (not inside inner function)
  const storedDataController = useStoredDataController();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await storedDataController.getStoredData('userType');
        if (data) {
          setUserType(data);
        }
      } catch (err) {
        console.error('Error reading stored userType', err);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.Background}>
        <View>
          <Text style={[styles.HeaderText, { marginTop: 100 }]}>Registros</Text>
        </View>
        <View style= {[styles.Separator]}></View>
        {userType === 'medic' ? (
          <ScrollView style={styles.scrollViewStyleRegisters} contentContainerStyle={{ paddingBottom: 10 }}>
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              {testRecords.map(record => (
                <View key={record.id} style={styles.alertItem}>
                  <View>
                    <Image
                      source={require('../assets/images/MissingImage.jpg')}
                      style={styles.imageContainer}
                      resizeMode="cover"
                    />
                  </View>
                  <View>
                    <Text style={styles.registerTitle}>{record.date}</Text>
                    <Text style={styles.registerText}>{record.summary} </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
          ) : userType === 'admin' ? (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            
          </View>
          ) : null
        }
        <NavigationBar userType={userType} currentTab='history'/>
    </View>
  );
}