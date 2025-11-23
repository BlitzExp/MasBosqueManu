import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import NavigationBar from '../components/ui/NavigationBar';
import { fetchCurrentUserProfile, logoutCurrentUser } from '../Controlador/profileController';
import styles from '../Styles/styles';

export default function EditProfile() {

  const router = useRouter();

  const [name, setName] =  React.useState('');
  const [nVisitas, setNVisitas] =  React.useState('');
  const [registro, setRegistro] =  React.useState('');
  const [lastVisit, setLastVisit] =  React.useState('');
  const [rol, setRol] =  React.useState('');

  const handleLogout = async () => {
    try {
      await logoutCurrentUser();
      router.replace('/logIn');
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchCurrentUserProfile();
        if (!profile) {
          router.replace('/logIn');
          return;
        }

        setName(profile.name || '');
        setRol(profile.role || '');
        setNVisitas(profile.nVisits ?? '0');
        setRegistro(profile.dateRegistered ?? '');
        setLastVisit(profile.lastVisit ?? '');
      } catch (err) {
        console.log('Error fetching profile:', err);
      }
    };
    loadProfile();
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
        rol === 'medico' && (
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
        rol === 'medico' && (
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
