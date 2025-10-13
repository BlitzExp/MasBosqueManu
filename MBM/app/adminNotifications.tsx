import { Button, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function adminNotifications() {
  const router = useRouter();
  return (
    <View>
        <Button title="Vista de paramedico" onPress={() => router.replace('/dailyJournal')} />
        <Button title="Ir a registros de bitácora" onPress={() => router.replace('/recordsAdmin')} />
        <Button title="Vista de mapa" onPress={() => router.replace('/mapView')} />
    </View>
  );
}