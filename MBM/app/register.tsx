import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';

import NavigationBar from '../components/ui/NavigationBar';

import styles from '../Styles/styles';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [userType, setUserType] = useState('');
  
  const handleSubmit = () => {
    // Llama al Controlador de Registro aquí
    console.log('Username:', username);
    console.log('Password:', password);
  }
  
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
                placeholder="Constraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.inputField}
              />
              <Text style={styles.textInput}>Token</Text>
              <TextInput
                secureTextEntry
                value={token}
                onChangeText={setToken}
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
          <NavigationBar userType='user' currentTab="profile" />
        </GestureHandlerRootView>
  );
}