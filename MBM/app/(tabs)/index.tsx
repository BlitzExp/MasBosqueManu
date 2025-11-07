import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import styles from '../../Styles/styles';

export default function App() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Jura-Regular': require('../../assets/Fonts/Jura-Regular.ttf'),
    'BebasNeue-Regular': require('../../assets/Fonts/BebasNeue-Regular.ttf'),
    'Jura-Bold': require('../../assets/Fonts/Jura-Bold.ttf'),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/mapView'); 
  }, 2000); 
    return () => clearTimeout(timer);
  }, [router]);

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <View style={styles.BackgroundForms}>
      <Image 
        source={require('../../assets/images/Loading.png')} 
        style={styles.loadingImage} 
      />
      <Text style={styles.loadingtext}>Cargando...</Text>
    </View>
  );
}