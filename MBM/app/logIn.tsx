import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';

import { useAuthController } from '../Controlador/Authenticate';

import NavigationBar from '../components/ui/NavigationBar';

import styles from '../Styles/styles';

export default function LogIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { handleLogin, goToRegister } = useAuthController();

  const handleSubmit = () => {
    handleLogin(username, password);
  }

  return (
    <GestureHandlerRootView>
      <View style={styles.BackgroundForms}>
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
          <TouchableOpacity onPress={handleSubmit} style={styles.buttonStart}>
            <Text style={styles.buttonStartText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <Text style={styles.URLText} onPress={goToRegister}>
            Registar Usuario
          </Text>
        </View>
        <NavigationBar userType='user' currentTab="profile" />
      </View>
    </GestureHandlerRootView>
  );
}