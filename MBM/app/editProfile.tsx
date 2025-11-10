import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';

import styles from '../Styles/styles';
import NavigationBar from '../components/ui/NavigationBar';

export default function EditProfile() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [nVisitas, setNVisitas] = useState('');
  const [registro, setRegistro] = useState('');
  const [lastVisit, setLastVisit] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/logIn');
        return;
      }

      // Fetch profile
      const { data: profile, error } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log("Error fetching profile:", error);
        return;
      }

      // Update UI
      setName(profile.name || '');
      setRole(profile.role === 1 ? 'Médico' : 'Usuario');
      setNVisitas(profile.nvisits?.toString() ?? '0');
      setRegistro(profile.dateRegistered ?? '');
      setLastVisit(profile.lastVisit ?? '');
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/logIn');
  };

  return (
    <View style={styles.Background}>
      <Text style={styles.HeaderText}>Perfil</Text>
      <View style={styles.Separator}></View>

      <View style={styles.userInputContainer}>
        <Text style={styles.fieldName}>Nombre</Text>
        <Text style={styles.fieldInput}>{name}</Text>
      </View>

      <View style={styles.userInputContainer}>
        <Text style={styles.fieldName}>Contraseña</Text>
        <View style={styles.passwordContainer}>
          <Text style={styles.fieldInput}>
            {showPassword ? '********' : '********'}
          </Text>
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye' : 'eye-off'}
              size={24}
              color="black"
              style={styles.Icons}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.userInputContainer}>
        <Text style={styles.fieldName}>N. Visitas</Text>
        <Text style={styles.fieldInput}>{nVisitas}</Text>
      </View>

      <View style={styles.userInputContainer}>
        <Text style={styles.fieldName}>Última Visita</Text>
        <Text style={styles.fieldInput}>{lastVisit}</Text>
      </View>

      <View style={styles.userInputContainer}>
        <Text style={styles.fieldName}>Fecha de Registro</Text>
        <Text style={styles.fieldInput}>{registro}</Text>
      </View>

      <View style={styles.userInputContainer}>
        <Text style={styles.fieldName}>Rol</Text>
        <Text style={styles.fieldInput}>{role}</Text>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.redButton}>
        <Text style={styles.redButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* ✅ You can leave it always as "profile" for demo purposes */}
      <NavigationBar userType="user" currentTab="profile" />
    </View>
  );
}
