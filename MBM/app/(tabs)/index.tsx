import { loadScreen } from '@/Controlador/loadScreen';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import styles from '../../Styles/styles';

export default function App() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        await loadScreen(router, 2000);
        
      } catch (err) {
        console.error('Error in loadScreen:', err);
        if (mounted) router.replace('/mapView');
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [router]);

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