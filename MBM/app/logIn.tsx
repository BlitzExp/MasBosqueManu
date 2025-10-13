import { Button, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function logIn() {
  const router = useRouter();
  return (
    <View>
        <Button title="Ir a Register" onPress={() => router.replace('/register')} />
        <Button title="Iniciar Sesión" onPress={() => router.replace('/mapView')} />
    </View>
  );
}