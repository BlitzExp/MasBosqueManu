import { Button, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function recordsParamedic() {
  const router = useRouter();
  return (
    <View>
        <Button title="Ver como admin" onPress={() => router.replace('/recordsAdmin')} />
        <Button title="Volver al mapa" onPress={() => router.replace('/mapView')} />
        <Button title="Editar Perfil" onPress={() => router.replace('/editProfile')} />
    </View>
  );
}