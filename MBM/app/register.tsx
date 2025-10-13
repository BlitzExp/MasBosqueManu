import { Button, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function register() {
  const router = useRouter();
  return (
    <View>
        <Button title="Ir a logIn" onPress={() => router.replace('/logIn')} />
        <Button title="Crear Cuenta" onPress={() => router.replace('/mapView')} />
    </View>
  );
}