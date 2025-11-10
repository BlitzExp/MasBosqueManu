import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Button, Text, View, TouchableOpacity  } from 'react-native';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { supabase } from '../services/supabase';


import styles from '../Styles/styles';

export default function register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  
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
          <View style={styles.Background}>
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
              <TextInput
                placeholder="Medico"
                secureTextEntry
                value={userType}
                onChangeText={setUserType}
                style={styles.inputField}
              />
              <TouchableOpacity onPress={handleSubmit} style={styles.buttonStart}>
                <Text style={styles.buttonStartText}>Registrar</Text>
              </TouchableOpacity>
    
              <Text style={styles.URLText} onPress={() => router.replace('/logIn') }>
                Iniciar Sesión
              </Text>
            </View>
          </View>
          
        </GestureHandlerRootView>
  );
}