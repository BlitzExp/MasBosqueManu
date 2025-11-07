import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';


import styles from '../Styles/styles';
import NavigationBar from '../components/ui/NavigationBar';

export default function EditProfile() {

  const userType = 'medic'; 
  const router = useRouter();
  const [name, setName] =  React.useState('');
  const [contraseña, setContraseña] =  React.useState('');
  const [hiddenContraseña, setHiddenContraseña] =  React.useState('');
  const [nVisitas, setNVisitas] =  React.useState('');
  const [registro, setRegistro] =  React.useState('');
  const [lastVisit, setLastVisit] =  React.useState('');
  const [rol, setRol] =  React.useState('');

  const [showPassword, setShowPassword] =  React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    // Obtener datos del usuario y asignar
    setName('Edgar Osvaldo Navarro');
    setContraseña('Edgar1223');
    setHiddenContraseña('********'); 
    setNVisitas('15');
    setRegistro('10 / 09 / 2023');
    setLastVisit('03 / 11 / 2025');
    setRol('Admin');
  }, []);

  const handleSubmit = () => {
    router.replace('/logIn');
  }

  return (
    <View style={styles.Background}>
      <Text style={styles.HeaderText}>Perfil</Text>
      <View style= {styles.Separator}></View>
      <View style={styles.userInputContainer}>
        <Text style={styles.fieldName}>Nombre</Text>
        <Text style={styles.fieldInput}> {name}</Text>
      </View>
      <View style={styles.userInputContainer}>
        <Text style={styles.fieldName}>Contraseña</Text>
        <View style={styles.passwordContainer}>
          { showPassword ? 
            <Text style={styles.fieldInput}> {contraseña} </Text> : 
            <Text style={styles.fieldInput}> {hiddenContraseña} </Text>
          }
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
      {
        rol === 'Médico' && (
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
        rol === 'Médico' && (
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
      <TouchableOpacity onPress={handleSubmit} style={styles.redButton}>
        <Text style={styles.redButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <NavigationBar userType={userType} currentTab="profile" />
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