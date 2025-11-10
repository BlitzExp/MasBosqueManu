import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { supabase } from '../services/supabase';
import NavigationBar from '../components/ui/NavigationBar';

import styles from '../Styles/styles';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('medico');
  
  const handleSubmit = async () => {
  if (!username || !password) {
    alert('Por favor llena todos los campos');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: username,
      password: password,
      options: {
        data: {
          userType,
        },
      },
    });

    if (error) throw error;

    alert('Registro exitoso, revisa tu correo para confirmar tu cuenta');
    router.replace('/logIn');
  } catch (err: any) {
    alert(err.message);
  }
};

  
  const router = useRouter();
  return (
    <GestureHandlerRootView>
          <View style={styles.BackgroundForms}>
            <View style={styles.form}>
              <Text style={styles.textTitle}>Registrar Usuario</Text>
              <Text style={styles.textInput}>Usuario</Text>
              <TextInput
                placeholder="Usuario"
                value={username}
                onChangeText={setUsername}
                style={styles.inputField}
              />
              <Text style={styles.textInput}>Contraseña</Text>
              <TextInput
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.inputField}
              />
              <Text style={styles.textInput}>Tipo de Usuario</Text>
              <Dropdown
                data={[
                  { label: 'Médico', value: 'medico' },
                  { label: 'Admin', value: 'admin' },
                ]}
                labelField="label"
                valueField="value"
                value={userType}
                onChange={(item) => setUserType(item.value)}
                style={styles.inputField}
                placeholderStyle={{ color: 'rgba(0,0,0,0.6)' }}
                selectedTextStyle={{ color: '#000' }}
              />
              <TouchableOpacity onPress={handleSubmit} style={styles.buttonStart}>
                <Text style={styles.buttonStartText}>Registrar</Text>
              </TouchableOpacity>
    
              <Text style={styles.URLText} onPress={() => router.replace('/logIn') }>
                Iniciar Sesión
              </Text>
            </View>
          </View>
          <NavigationBar userType='user' currentTab="profile" />
        </GestureHandlerRootView>
  );
}