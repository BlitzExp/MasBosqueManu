import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Button, Text, View, TouchableOpacity  } from 'react-native';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';


import { useFonts } from 'expo-font';

import styles from '../Styles/styles';

export default function logIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    // Llama al Controlador de Autenticación aquí
    console.log('Username:', username);
    console.log('Password:', password);
  }

  //Pasar esto a pantalla de carga
  const [fontsLoaded] = useFonts({
    'Jura-Regular': require('../assets/Fonts/Jura-Regular.ttf'),
    'BebasNeue-Regular': require('../assets/Fonts/BebasNeue-Regular.ttf'),
    'Jura-Bold': require('../assets/Fonts/Jura-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.Background}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }


  const router = useRouter();
  return (
    <GestureHandlerRootView>
      <View style={styles.Background}>
        <View style={styles.form}>
          <Text style={styles.textTitle}>Iniciar Sesión</Text>
          <Text style={styles.textInput}>Usuario</Text>
          <TextInput
            placeholder="Usuario"
            value={username}
            onChangeText={setUsername}
            style={styles.inputField}
          />
          <Text style={styles.textInput}>Contraseña</Text>
          <TextInput
            placeholder="Constraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.inputField}
          />
          <View style={styles.buttonStart}>
            <TouchableOpacity onPress={handleSubmit} style={styles.buttonStart}>
              <Text style={styles.buttonStartText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.URLText} onPress={() => router.replace('/register') }>
            Registar Usuario
          </Text>
        </View>
      </View>
      
    </GestureHandlerRootView>
  );
}