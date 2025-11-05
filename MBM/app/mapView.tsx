import { useRouter } from 'expo-router';
import { Button, View } from 'react-native';
import NavigationBar from '../components/ui/NavigationBar';

export default function mapView() {
  const router = useRouter();
  return (
    <View>
      <Button title="Ir a logIn" onPress={() => router.replace('/logIn')} />
        <Button title="Ir a logIn" onPress={() => router.replace('/logIn')} />
        <Button title="Crear una entrada en bitácora" onPress={() => router.replace('/dailyJournal')} />
        <Button title="Ver entradas de bitácora" onPress={() => router.replace('/recordsParamedic')} />
        <Button title="EditarPerfil" onPress={() => router.replace('/editProfile')} />

        <NavigationBar userType='admin' currentTab="mapView" />
    </View>
  );
}