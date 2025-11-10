import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { useAuthController } from '../Controlador/Authenticate';
import NavigationBar from '../components/ui/NavigationBar';

import styles from '../Styles/styles';

export default function Register() {
  const { register, goToLogin } = useAuthController();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('medico');
  const [name, setName] = useState('');


  const handleSubmit = () => {
    register(email, password, userType, name);
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.BackgroundForms}>
        <View style={styles.form}>
          <Text style={styles.textTitle}>Registrar Usuario</Text>

          <Text style={styles.textInput}>Nombre Completo</Text>
          <TextInput
          placeholder="Nombre completo"
          value={name}
          onChangeText={setName}
          style={styles.inputField}
          />

          <Text style={styles.textInput}>Email</Text>
          <TextInput
            placeholder="Email"
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
          />

          <TouchableOpacity onPress={handleSubmit} style={styles.buttonStart}>
            <Text style={styles.buttonStartText}>Registrar</Text>
          </TouchableOpacity>

          <Text style={styles.URLText} onPress={goToLogin}>
            Iniciar Sesión
          </Text>
        </View>
        <NavigationBar userType="user" currentTab="profile" />
      </View>
    </GestureHandlerRootView>
  );
}
