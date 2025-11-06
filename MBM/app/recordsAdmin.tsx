import { Button, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function RecordsAdmin() {
  const router = useRouter();
  return (
    <View>
        <Button title="Ver las notificaciones de Admin" onPress={() => router.replace('/adminNotifications')} />
        <Button title="Volver a vista de paramedico" onPress={() => router.replace('/recordsParamedic')} />
        <Button title="EditarPerfil" onPress={() => router.replace('/editProfile')} />
    </View>
  );
}