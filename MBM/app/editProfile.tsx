import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useStoredDataController } from '../Controlador/storedDataController';
import styles from '../Styles/styles';
import NavigationBar from '../components/ui/NavigationBar';
import { clearUserData } from '../services/localdatabase';
import { supabase } from '../services/supabase';

export default function EditProfile() {

  const router = useRouter();
  const storedDataController = useStoredDataController();

  const [name, setName] =  React.useState('');
  const [nVisitas, setNVisitas] =  React.useState('');
  const [registro, setRegistro] =  React.useState('');
  const [lastVisit, setLastVisit] =  React.useState('');
  const [rol, setRol] =  React.useState('');

  const [userType, setUserType] = React.useState('user');

  const handleLogout = async () => {
    try {
    await supabase.auth.signOut();
    await clearUserData();
    router.replace("/logIn");
    } catch (err: any) {
    Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/logIn');
        return;
      }

      const { data: profile, error } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log("Error fetching profile:", error);
        return;
      }

      setName(profile.name || '');
      setRol(profile.role || '');
      setUserType(profile.role || 'user');
      setNVisitas(profile.nvisits?.toString() ?? '0');
      setRegistro(profile.dateRegistered ?? '');
      setLastVisit(profile.lastVisit ?? '');
    };
    const fetchUserType = async () => {
      try {
        const data = await storedDataController.getStoredData('userType');
        if (data) {
          setUserType(data);
        }
      } catch (err) {
        console.error('Error reading stored userType', err);
      }
    };
    loadProfile();
    fetchUserType();
  }, []);

  return (
    <View style={styles.Background}>
      <Text style={styles.HeaderText}>Perfil</Text>
      <View style= {styles.Separator}></View>
      <View style={styles.userInputContainer}>
        <Text style={styles.fieldName}>Nombre</Text>
        <Text style={styles.fieldInput}> {name}</Text>
      </View>
      {
        rol === 'medic' && (
          <View style={styles.userInputContainer}>
            <Text style={styles.fieldName}>N. Visitas</Text>
            <Text style={styles.fieldInput}> {nVisitas}</Text>
          </View>
        )
      }
      
      <View style={styles.userInputContainer}>
        <Text style={styles.fieldName}>Fecha de Registro</Text>
        <Text style={styles.fieldInput}> {registro}</Text>
      </View>
      {
        rol === 'medic' && (
          <View style={styles.userInputContainer}>
            <Text style={styles.fieldName}>Última Visita</Text>
            <Text style={styles.fieldInput}> {lastVisit}</Text>
          </View>
        )
      }
      
      <View style={styles.userInputContainer}>
        <Text style={styles.fieldName}>Rol</Text>
        <Text style={styles.fieldInput}> {rol}</Text>
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.redButton}>
        <Text style={styles.redButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <NavigationBar currentTab="profile" />
    </View>
  );
}


/** Version para elementos editables
<View style={styles.userInputContainer}> 
        <Text style={styles.fieldName}>Nombre</Text>
        <TextInput
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
          style={styles.fieldInput}
        />
</View>
 */