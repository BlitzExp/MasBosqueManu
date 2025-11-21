import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { useAuthController } from '../Controlador/Authenticate';
import NavigationBar from '../components/ui/NavigationBar';
import styles from '../Styles/styles';

export default function LogIn() {
  const { login, goToRegister } = useAuthController();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    login(email, password);
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.BackgroundForms}>
        <View style={styles.form}>
          <Text style={styles.textTitle}>Iniciar Sesión</Text>

          <Text style={styles.textInput}>Usuario</Text>
          <TextInput
            placeholder="Usuario"
            value={email}
            onChangeText={setEmail}
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

          <TouchableOpacity onPress={handleSubmit} style={styles.buttonStart}>
            <Text style={styles.buttonStartText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <Text style={styles.URLText} onPress={goToRegister}>
            Registrar Usuario
          </Text>
        </View>
        <NavigationBar currentTab="profile" />
      </View>
    </GestureHandlerRootView>
  );
}
