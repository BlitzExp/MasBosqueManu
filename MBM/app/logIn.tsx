import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import NavigationBar from '../components/ui/NavigationBar';
import { useAuthController } from '../Controlador/Authenticate';
import styles from '../Styles/styles';
import { loadScreen } from '@/Controlador/loadScreen';
import { useRouter } from 'expo-router';

export default function LogIn() {
  const router = useRouter();
  const { login, goToRegister } = useAuthController();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    login(email, password);
  };

  useEffect(() => {
      let mounted = true;
  
      const run = async () => {
        try {
          await loadScreen(router, 2000);
        } catch (err) {
          console.error('Error in loadScreen:', err);
          //if (mounted) router.replace('/mapView');
        }
      };
  
      run();
  
      return () => {
        mounted = false;
      };
    }, [router]);

  return (
    <GestureHandlerRootView>
      <View style={styles.BackgroundForms}>
        <View style={styles.form}>
          <Text style={styles.textTitle}>Iniciar Sesión</Text>

          <Text style={styles.textInput}>Correo</Text>
          <TextInput
            placeholder="email@gmail.com"
            value={email}
            onChangeText={setEmail}
            style={styles.inputField}
          />

          <Text style={styles.textInput}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <View style={styles.passwordInner}>
              <TextInput
                placeholder="Contraseña"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.passwordTextInput}
                placeholderTextColor="rgba(0,0,0,0.2)"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(prev => !prev)}
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={styles.passwordIconButton}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="black"
                />
              </TouchableOpacity>
            </View>
          </View>

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
