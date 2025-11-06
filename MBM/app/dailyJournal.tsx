import { Button, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function DailyJournal() {
  const router = useRouter();
  return (
    <View>
        <Button title="Editar Perfil" onPress={() => router.replace('/editProfile')} />
        <Button title="Ir a registros de bitácora" onPress={() => router.replace('/recordsParamedic')} />
        <Button title="Vista de mapa" onPress={() => router.replace('/mapView')} />
    </View>
  );
}