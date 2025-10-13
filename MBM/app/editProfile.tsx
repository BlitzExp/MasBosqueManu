import { Button, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function editProfile() {
  const router = useRouter();
  return (
    <View>
        <Button title="Crear registro de bitácora" onPress={() => router.replace('/dailyJournal')} />
        <Button title="Ir a registros de bitácora" onPress={() => router.replace('/recordsParamedic')} />
        <Button title="Vista de mapa" onPress={() => router.replace('/mapView')} />
    </View>
  );
}